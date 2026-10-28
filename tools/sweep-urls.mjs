#!/usr/bin/env node
// Turns route templates (inventory/routes.json) into concrete URLs for sweep cases.
//
//   node tools/sweep-urls.mjs <runId|latest> pages --role member
//   node tools/sweep-urls.mjs <runId|latest> rbac  --role member
//
// pages: every route, filled with the role's own IDs from runs/<runId>/context.json.
// rbac:  every non-public route, filled with the admin's IDs, to probe pages the role should NOT reach.
// Public routes are matched with env.PUBLIC_ROUTE_PATTERNS. Unfillable routes are listed as "unresolved".
import path from 'node:path';
import { loadRun, latestRunId, parseArgs, readJSON, writeJSON, P, loadEnv, projectPath } from './lib/cases.mjs';

const args = parseArgs(process.argv.slice(2));
let [runId, kind] = args._;
if (!runId || !['pages', 'rbac'].includes(kind)) {
  console.error('Usage: node tools/sweep-urls.mjs <runId|latest> pages|rbac --role <role> [--probe-as admin]');
  process.exit(1);
}
if (runId === 'latest') runId = latestRunId();
const runInfo = loadRun(runId); // switches to the run's project
const env = loadEnv();
const role = args.role && args.role !== true ? args.role : 'admin';
const probeAs = args['probe-as'] && args['probe-as'] !== true ? args['probe-as'] : 'admin';
const { dir, plan } = runInfo;
const ctx = readJSON(path.join(dir, 'context.json'), {});
const routes = readJSON(projectPath('inventory', 'routes.json'), null)?.routes;
if (!routes) { console.error('No projects/<project>/inventory/routes.json. Generate it (see tools/adapters/) or write it by hand: {"routes":[{"url":"/path","title":"..."}]}'); process.exit(1); }

const values = kind === 'rbac' ? { ...(ctx[role] || {}), ...(ctx[probeAs] || {}) } : (ctx[role] || {});
const publicRe = env.PUBLIC_ROUTE_PATTERNS.map(p => new RegExp(p));
const isPublic = u => publicRe.some(re => re.test(u));

const seen = new Set(); const resolved = []; const unresolved = [];
for (const r of routes) {
  if (!r.url || r.url.includes('pathMatch') || r.redirect) continue;
  const pub = isPublic(r.url);
  if (kind === 'rbac' && pub) continue;
  const missing = [];
  const url = r.url
    .replace(/\/:([a-zA-Z_]+)\?/g, '')
    .replace(/:([a-zA-Z_]+)/g, (_, k) => (values[k] != null ? encodeURIComponent(values[k]) : (missing.push(k), `:${k}`)));
  if (seen.has(url)) continue;
  seen.add(url);
  const item = { url: plan.baseUrl.replace(/\/$/, '') + url, path: url, routeName: r.name, expectedTitle: r.title, area: r.area, public: pub };
  if (missing.length) unresolved.push({ ...item, missing: [...new Set(missing)] }); else resolved.push(item);
}

const out = path.join(dir, `sweep-${kind}-${role}.json`);
writeJSON(out, { runId, kind, role, generatedAt: new Date().toISOString(), resolved, unresolved });
console.log(`${resolved.length} URLs ready, ${unresolved.length} need IDs (${[...new Set(unresolved.flatMap(u => u.missing))].slice(0, 15).join(', ')}).`);
console.log(`Wrote ${path.relative(P(), out)}. Add IDs to context.json to resolve more.`);
