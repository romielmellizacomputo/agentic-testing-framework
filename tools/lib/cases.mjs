// Shared helpers: config, test-case parsing, run folders, redaction.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const P = (...p) => path.join(ROOT, ...p);

// ---------- Projects ----------
// Each app under test lives in projects/<name>/ (config/, test-cases/, suites/, inventory/).
// Active project: AGT_PROJECT env var > .agt-project file (set by `node tools/project.mjs use <name>`) > "demo".
// Tools that work on an existing run switch to that run's project automatically (see loadRun).
export function listProjects() {
  const dir = P('projects');
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(d => !d.startsWith('_') && fs.existsSync(path.join(dir, d, 'test-cases'))).sort() : [];
}
export function activeProject() {
  const fromEnv = process.env.AGT_PROJECT;
  const fromFile = fs.existsSync(P('.agt-project')) ? fs.readFileSync(P('.agt-project'), 'utf8').trim() : '';
  const name = fromEnv || fromFile || 'demo';
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(name)) throw new Error(`Invalid project name: ${name}`);
  if (!fs.existsSync(P('projects', name))) throw new Error(`Project "${name}" not found. Known: ${listProjects().join(', ')}. Create one with: node tools/project.mjs new ${name}`);
  return name;
}
export const projectPath = (...p) => P('projects', activeProject(), ...p);
// A file from the project's config, preferring the private copy over the committed example.
function configFile(privateName, exampleName) {
  for (const f of [projectPath('config', privateName), projectPath('config', exampleName)]) if (fs.existsSync(f)) return f;
  return null;
}

export const STATUSES = ['not_run', 'pass', 'fail', 'blocked', 'skipped', 'needs_update', 'flaky'];
export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
export const TYPES = ['functional', 'negative', 'rbac', 'validation', 'ui', 'a11y', 'performance', 'security', 'e2e'];

export function readJSON(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); // tolerate a UTF-8 BOM (Windows editors)
}
export function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// projects/<p>/config/env.json is private (gitignored); fall back to the committed env.example.json.
export function loadEnv() {
  const f = configFile('env.json', 'env.example.json');
  const env = f ? readJSON(f, {}) : {};
  env.PROJECT = activeProject();
  env.ENVIRONMENTS ||= {};
  env.ROUTE_ALIASES ||= {};
  env.PUBLIC_ROUTE_PATTERNS ||= [];
  env.DATA_PREFIX ||= 'AGT';
  env.REDACT_EMAILS_IN_REPORTS = env.REDACT_EMAILS_IN_REPORTS !== false;
  return env;
}
export function baseUrl(env = loadEnv(), name = env.TARGET_ENV) {
  const u = env.ENVIRONMENTS[name];
  if (!u) throw new Error(`Unknown environment "${name}". Known: ${Object.keys(env.ENVIRONMENTS).join(', ')}`);
  return u.replace(/\/$/, '');
}

// Accounts: projects/<p>/config/accounts.local.json (gitignored) or environment variables
//   AGT_ACCOUNT_<ROLE>_EMAIL / AGT_ACCOUNT_<ROLE>_PASSWORD   (role upper-cased, e.g. AGT_ACCOUNT_ADMIN_EMAIL)
// Environment variables win, so CI can inject secrets without any file on disk.
// Never reads the committed accounts.example.json for credentials.
export function loadAccounts() {
  const file = readJSON(projectPath('config', 'accounts.local.json'), {}) || {};
  const out = {};
  for (const [k, v] of Object.entries(file)) if (!k.startsWith('_')) out[k] = { ...v };
  for (const [k, v] of Object.entries(process.env)) {
    const m = k.match(/^AGT_ACCOUNT_([A-Z0-9_]+)_(EMAIL|PASSWORD)$/);
    if (!m) continue;
    const role = m[1].toLowerCase();
    out[role] ||= {};
    out[role][m[2] === 'EMAIL' ? 'email' : 'password'] = v;
  }
  return out;
}

export function roleNames() {
  const file = configFile('roles.md', 'roles.example.md');
  if (!file) return [];
  const md = fs.readFileSync(file, 'utf8');
  return [...md.matchAll(/^\| `([a-z0-9_]+)` \|/gm)].map(m => m[1]);
}

// Expand {alias} shorthands from env.ROUTE_ALIASES, e.g. "{ws}" -> "/org/:org_id/team/:team_id".
export function expandRoute(route, env = loadEnv()) {
  let r = route || '';
  for (const [k, v] of Object.entries(env.ROUTE_ALIASES)) r = r.split(k).join(v);
  return r;
}

// Mask emails and obvious secrets before anything is written to reports or bugs.
export function redact(text, env = loadEnv()) {
  let t = String(text ?? '');
  t = t.replace(/AKIA[0-9A-Z]{16}/g, '[redacted-aws-key]')
    .replace(/\b(bearer|token|apikey|api_key|secret|password)\s*[:=]\s*\S+/gi, '$1=[redacted]')
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]');
  if (env.REDACT_EMAILS_IN_REPORTS) t = t.replace(/\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, '$1***@$2');
  return t;
}
export const maskEmail = e => String(e || '').replace(/^(.).*(@.*)$/, '$1***$2');

const list = v => (v || '').split(',').map(s => s.trim()).filter(Boolean);

export function loadModules() {
  const dir = projectPath('test-cases');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();
  return files.map((f, order) => parseModule(path.join(dir, f), order));
}

export function parseModule(file, order = 0) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const parts = text.split(/^### /m);
  const head = parts.shift();
  const meta = {};
  for (const m of head.matchAll(/^- ([a-z-]+): (.*)$/gm)) meta[m[1]] = m[2].trim();
  const module = {
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    order,
    project: path.relative(P('projects'), file).split(path.sep)[0],
    title: (head.match(/^# (.+)$/m) || [])[1] || path.basename(file),
    module: meta.module,
    prefix: meta.prefix,
    sourcePaths: list(meta['source-paths']),
    legacyMarkers: list(meta['legacy-markers']).filter(x => x !== '–' && x !== '-'),
    baseRoute: meta['base-route'],
    cases: [],
  };
  for (const raw of parts) {
    const lines = raw.split('\n');
    const h = lines[0].match(/^([A-Z][A-Z0-9]*-\d{3}) · (.+)$/);
    if (!h) { module.cases.push({ parseError: `Bad case heading: "### ${lines[0]}"` }); continue; }
    const fields = {};
    let i = 1;
    for (; i < lines.length; i++) {
      const m = lines[i].match(/^- ([a-z-]+): (.*)$/);
      if (!m) break;
      fields[m[1]] = m[2].trim();
    }
    const body = lines.slice(i).join('\n');
    const section = name => {
      const m = body.match(new RegExp(`\\*\\*${name}:\\*\\*([\\s\\S]*?)(?=\\n\\*\\*[A-Z][a-zA-Z ]+:\\*\\*|$)`));
      return m ? m[1].trim() : null;
    };
    module.cases.push({
      id: h[1], title: h[2].trim(), module: module.module, moduleTitle: module.title, moduleOrder: order, file: module.file,
      priority: fields.priority, type: fields.type, roles: list(fields.roles), tags: list(fields.tags),
      route: fields.route || null, destructive: fields.destructive === 'yes', destructiveRaw: fields.destructive,
      legacy: list(fields.legacy), depends: list(fields.depends),
      multiActor: fields['multi-actor'] === 'yes' || fields.type === 'e2e',
      preconditions: section('Preconditions'), data: section('Data'), steps: section('Steps'),
      expected: section('Expected'), cleanup: section('Cleanup'), fields,
    });
  }
  return module;
}

export function allCases(modules = loadModules()) {
  return modules.flatMap(m => m.cases.filter(c => !c.parseError));
}

export function runDir(runId) { return P('runs', runId); }
export function loadRun(runId) {
  if (!runId || !/^[A-Za-z0-9._-]+$/.test(runId)) throw new Error(`Invalid run id: ${runId}`);
  const dir = runDir(runId);
  const plan = readJSON(path.join(dir, 'plan.json'), null);
  if (!plan) throw new Error(`Run not found: ${runId}`);
  if (plan.project) process.env.AGT_PROJECT = plan.project; // later config/case lookups use the run's project
  return { dir, plan, results: readJSON(path.join(dir, 'results.json'), {}) };
}
// Latest run, by default of the active project (pass any=true for the latest of all projects).
export function latestRunId(any = false) {
  const dir = P('runs');
  if (!fs.existsSync(dir)) return null;
  let ids = fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'plan.json'))).sort();
  if (!any) {
    let proj = null; try { proj = activeProject(); } catch { /* ignore */ }
    const mine = ids.filter(d => (readJSON(path.join(dir, d, 'plan.json'), {}).project || 'demo') === proj);
    if (mine.length) ids = mine;
  }
  return ids.at(-1) || null;
}
// Suites: the project's own suites/ first, then the shared root suites/.
export function suitePath(name) {
  for (const f of [projectPath('suites', `${name}.json`), P('suites', `${name}.json`)]) if (fs.existsSync(f)) return f;
  return null;
}

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
