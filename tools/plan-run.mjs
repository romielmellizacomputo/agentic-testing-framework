#!/usr/bin/env node
// Builds a run plan: which case rows to execute, in what order, as which role.
//
// Selectors (combine freely; all given filters must match):
//   --suite smoke|regression|rbac|nightly|hiring-e2e|...   (suites/<name>.json)
//   --module boards,forms         --tags smoke,rbac        --priority P0,P1
//   --role supervisor             --type rbac,security     --ids BOARD-001,FORM-002
//   --changed <git-ref>           cases for files changed vs a branch/commit (read-only git)
//   --changed-files <file.txt>    same, from a list of paths (one per line)
// Options:
//   --env develop                 override TARGET_ENV
//   --shard 2/4                   take every 4th row starting at 2 (parallel agents)
//   --run-id <id>                 choose the id (default: timestamp + selector)
//   --dry                         print the plan, write nothing
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { allCases, loadModules, loadEnv, loadAccounts, parseArgs, readJSON, writeJSON, P, runDir } from './lib/cases.mjs';

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const targetEnv = args.env || env.TARGET_ENV;
if ((env.NEVER_RUN_ON || []).includes(targetEnv)) die(`Refusing to plan a run against "${targetEnv}".`);
const baseUrl = env.ENVIRONMENTS?.[targetEnv];
if (!baseUrl) die(`Unknown environment "${targetEnv}". Known: ${Object.keys(env.ENVIRONMENTS || {}).join(', ')}`);
const allowDestructive = (env.ALLOW_DESTRUCTIVE_ON || []).includes(targetEnv);

const modules = loadModules();
let cases = allCases(modules);
const split = v => (v === true || !v ? [] : String(v).split(',').map(s => s.trim()).filter(Boolean));
const selectorDesc = [];
let keepOrder = false;

// Suite
if (args.suite) {
  const suite = readJSON(P('suites', `${args.suite}.json`), null);
  if (!suite) die(`Suite not found: suites/${args.suite}.json`);
  cases = applySelect(cases, suite.select || {}, false);
  if (suite.exclude) cases = applySelect(cases, suite.exclude, true);
  keepOrder = !!suite.keepOrder;
  if (keepOrder && suite.select?.ids) {
    const order = new Map(suite.select.ids.map((id, i) => [id, i]));
    cases.sort((a, b) => order.get(a.id) - order.get(b.id));
  }
  selectorDesc.push(`suite=${args.suite}`);
}

// Changed files → modules
if (args.changed || args['changed-files']) {
  const files = args['changed-files']
    ? fs.readFileSync(args['changed-files'], 'utf8').split(/\r?\n/).filter(Boolean)
    : gitChangedFiles(env.APP_REPO, args.changed);
  const hit = new Set();
  const unmatched = [];
  for (const f of files) {
    const norm = f.replace(/\\/g, '/');
    const mods = modules.filter(m => m.sourcePaths.some(sp => norm.startsWith(sp) || norm === sp.replace(/\/$/, '')));
    if (mods.length) mods.forEach(m => hit.add(m.module)); else unmatched.push(norm);
  }
  const relevant = cases.filter(c => hit.has(c.module) && ['P0', 'P1', 'P2'].includes(c.priority));
  const safetyNet = cases.filter(c => c.tags.includes('smoke') && c.priority === 'P0');
  const ids = new Set([...relevant, ...safetyNet].map(c => c.id));
  cases = cases.filter(c => ids.has(c.id));
  selectorDesc.push(`changed=${args.changed || args['changed-files']} → modules [${[...hit].join(', ') || 'none'}] + smoke safety net`);
  if (unmatched.length) console.log(`Changed files not owned by any module (consider adding to a module's source-paths):\n  ${unmatched.slice(0, 30).join('\n  ')}`);
  console.log(`${files.length} changed files → ${hit.size} modules`);
}

// Plain filters
const filt = { modules: split(args.module), tags: split(args.tags), priority: split(args.priority), types: split(args.type), ids: split(args.ids) };
if (Object.values(filt).some(v => v.length)) {
  cases = applySelect(cases, filt, false);
  for (const [k, v] of Object.entries(filt)) if (v.length) selectorDesc.push(`${k}=${v.join(',')}`);
}
if (!selectorDesc.length) die('Give at least one selector, e.g. --suite smoke or --module boards. See the header of this file.');

// Pull in dependencies that aren't selected (they run first)
if (!args['no-deps']) {
  const byId = new Map(allCases(modules).map(c => [c.id, c]));
  const have = new Set(cases.map(c => c.id));
  const queue = [...cases];
  while (queue.length) {
    const c = queue.shift();
    for (const d of c.depends) if (!have.has(d) && byId.has(d)) { have.add(d); const dc = byId.get(d); cases.push(dc); queue.push(dc); }
  }
}

// Expand to rows (one per role unless multi-actor)
const roleFilter = split(args.role);
let rows = [];
for (const c of cases) {
  const roleSets = c.multiActor ? [c.roles] : c.roles.map(r => [r]);
  for (const roles of roleSets) {
    if (roleFilter.length && !roles.some(r => roleFilter.includes(r))) continue;
    rows.push({
      row: c.multiActor ? c.id : `${c.id}@${roles[0]}`,
      id: c.id, title: c.title, module: c.module, file: c.file,
      priority: c.priority, type: c.type, role: roles[0], actors: roles,
      route: c.route, destructive: c.destructive, depends: c.depends, legacy: c.legacy,
      moduleOrder: c.moduleOrder,
    });
  }
}
if (roleFilter.length) selectorDesc.push(`role=${roleFilter.join(',')}`);

// Order: module order, then priority, then id — then make sure dependencies come first.
if (!keepOrder) {
  const pr = { P0: 0, P1: 1, P2: 2, P3: 3 };
  rows.sort((a, b) => a.moduleOrder - b.moduleOrder || pr[a.priority] - pr[b.priority] || a.id.localeCompare(b.id));
}
rows = topoSort(rows);

// Shard
if (args.shard) {
  const [k, n] = String(args.shard).split('/').map(Number);
  if (!(k >= 1 && n >= 1 && k <= n)) die('--shard must look like 2/4');
  // Keep dependency chains on one shard: shard by root case of each chain.
  const root = id => { const r = rows.find(x => x.id === id); return r && r.depends.length ? root(r.depends[0]) : id; };
  const chains = [...new Set(rows.map(r => root(r.id)))];
  const mine = new Set(chains.filter((_, i) => i % n === k - 1));
  rows = rows.filter(r => mine.has(root(r.id)));
  selectorDesc.push(`shard=${k}/${n}`);
}

// Pre-skip destructive rows on protected envs
const accounts = loadAccounts();
const results = {};
for (const r of rows) {
  const res = { status: 'not_run', attempts: 0, notes: [], evidence: [] };
  if (r.destructive && !allowDestructive) {
    res.status = 'skipped';
    res.notes.push(`auto: destructive case, ${targetEnv} not in ALLOW_DESTRUCTIVE_ON`);
  }
  results[r.row] = res;
}

const neededRoles = [...new Set(rows.flatMap(r => r.actors))].filter(r => r !== 'anonymous');
const missing = neededRoles.filter(r => !accounts?.[r]?.email);

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const label = (args.suite || filt.modules[0] || filt.tags[0] || (args.changed ? 'changed' : 'custom')).toString().replace(/[^a-z0-9-]/gi, '');
const runIdArg = args['run-id'];
if (runIdArg && !/^[A-Za-z0-9._-]+$/.test(runIdArg)) die('--run-id may only contain letters, digits, . _ -');
const runId = runIdArg || `${stamp}-${label}${args.shard ? `-s${String(args.shard).replace('/', 'of')}` : ''}`;

const plan = {
  runId, createdAt: new Date().toISOString(), env: targetEnv, baseUrl, allowDestructive,
  selector: selectorDesc.join(' · '), prefix: `${env.DATA_PREFIX}-${runId.slice(0, 13)}`,
  counts: { cases: new Set(rows.map(r => r.id)).size, rows: rows.length, autoSkipped: Object.values(results).filter(r => r.status === 'skipped').length },
  rolesNeeded: neededRoles, rolesMissingAccounts: missing,
  rows,
};

console.log(`\nRun ${runId}`);
console.log(`  env        ${targetEnv} (${baseUrl})${allowDestructive ? '' : '  — destructive cases auto-skipped'}`);
console.log(`  selector   ${plan.selector}`);
console.log(`  rows       ${rows.length} (${plan.counts.cases} cases), ${plan.counts.autoSkipped} auto-skipped`);
console.log(`  roles      ${neededRoles.join(', ') || '(anonymous only)'}`);
console.log(`  data prefix ${plan.prefix}   (use wherever a case says {run})`);
if (missing.length) console.log(`  ! no account in config/accounts.local.json for: ${missing.join(', ')} → those rows will be blocked`);

if (args.dry) { for (const r of rows) console.log(`  ${r.row.padEnd(28)} ${r.priority} ${r.title}`); process.exit(0); }

const dir = runDir(runId);
if (fs.existsSync(path.join(dir, 'plan.json'))) die(`Run ${runId} already exists.`);
fs.mkdirSync(path.join(dir, 'evidence'), { recursive: true });
writeJSON(path.join(dir, 'plan.json'), plan);
writeJSON(path.join(dir, 'results.json'), results);
writeJSON(path.join(dir, 'context.json'), {});
fs.writeFileSync(path.join(dir, 'proposed-cases.md'), `# Proposed new cases from run ${runId}\n\nUse the format in protocol/test-case-format.md. A human reviews these and moves good ones into test-cases/.\n`);
console.log(`\nWrote runs/${runId}/  → next: execute rows in plan.json order, record with tools/record.mjs`);

// ---------- helpers ----------
function applySelect(list, sel, exclude) {
  const test = c =>
    (!sel.modules?.length || sel.modules.includes(c.module)) &&
    (!sel.tags?.length || sel.tags.some(t => c.tags.includes(t))) &&
    (!sel.priority?.length || sel.priority.includes(c.priority)) &&
    (!sel.types?.length || sel.types.includes(c.type)) &&
    (!sel.ids?.length || sel.ids.includes(c.id));
  // An exclude block with only some keys excludes cases matching ANY given key.
  if (exclude) {
    const hits = c =>
      (sel.modules?.length && sel.modules.includes(c.module)) ||
      (sel.tags?.length && sel.tags.some(t => c.tags.includes(t))) ||
      (sel.priority?.length && sel.priority.includes(c.priority)) ||
      (sel.types?.length && sel.types.includes(c.type)) ||
      (sel.ids?.length && sel.ids.includes(c.id));
    return list.filter(c => !hits(c));
  }
  return list.filter(test);
}

function topoSort(list) {
  const out = []; const placed = new Set(); const ids = new Set(list.map(r => r.id));
  const visit = (r, stack = new Set()) => {
    if (placed.has(r.row)) return;
    if (stack.has(r.row)) return; // cycle: keep current order
    stack.add(r.row);
    for (const d of r.depends) if (ids.has(d)) for (const dr of list.filter(x => x.id === d)) visit(dr, stack);
    placed.add(r.row); out.push(r);
  };
  list.forEach(r => visit(r));
  return out;
}

function gitChangedFiles(repo, ref) {
  if (!repo) die('Set APP_REPO in config/env.json (path to your app checkout) or use --changed-files.');
  if (!/^[\w./~^@{}-]+$/.test(ref)) die(`Refusing suspicious git ref: ${ref}`);
  const tries = [];
  const wsl = repo.match(/^\\\\wsl(?:\.localhost|\$)\\([^\\]+)\\(.*)$/i);
  if (wsl) tries.push(['wsl', ['-d', wsl[1], '--', 'git', '-C', `/${wsl[2].replace(/\\/g, '/')}`, 'diff', '--name-only', ref]]);
  tries.push(['git', ['-C', repo, 'diff', '--name-only', ref]]);
  for (const [cmd, a] of tries) {
    try {
      return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean);
    } catch { /* try next */ }
  }
  die(`Could not run "git diff --name-only ${ref}" in ${repo}. Save the list yourself and use --changed-files.`);
}

function die(msg) { console.error(msg); process.exit(1); }
