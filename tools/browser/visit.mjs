#!/usr/bin/env node
// Visits paths in the test Chrome and prints one health line per page:
// title, load time, denied/redirect, bad text (undefined/NaN), stuck loaders, failed requests, console errors.
//
//   node tools/browser/visit.mjs /dashboard "{team}/settings" --role member
// Route aliases (env.ROUTE_ALIASES) and :params are filled from the latest run's context.json for --role (default admin).
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { latestRunId, runDir, readJSON, parseArgs, expandRoute, ROOT } from '../lib/cases.mjs';

const args = parseArgs(process.argv.slice(2));
const role = args.role && args.role !== true ? args.role : 'admin';
const runId = latestRunId();
const ctx = runId ? (readJSON(path.join(runDir(runId), 'context.json'), {})[role] || {}) : {};
const fill = p => expandRoute(p).replace(/:([a-zA-Z_]+)/g, (m, k) => (ctx[k] != null ? encodeURIComponent(ctx[k]) : m));
const paths = args._.map(fill);
if (!paths.length) { console.error('Usage: visit.mjs <path> [...paths] [--role r]'); process.exit(1); }

const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/browser/run.mjs'), path.join(ROOT, 'tools/browser/visit.js')], {
  env: { ...process.env, AGT_PATHS: JSON.stringify(paths) }, encoding: 'utf8', maxBuffer: 20e6,
});
const data = JSON.parse(r.stdout || '{}');
if (data.error) console.log('ERROR', data.error);
for (const p of data.result || []) {
  const flags = [p.denied && 'DENIED', p.bad.length && `BAD:${p.bad.join('/')}`, p.status !== 'ok' && p.status, p.spinners && `loaders:${p.spinners}`].filter(Boolean).join(' ');
  console.log(`\n${p.path}${p.final !== '=' ? `  ->  ${p.final}` : ''}\n  "${p.title}" ${p.ms}ms ${flags}\n  ${p.head}`);
  if (p.failed.length) console.log(`  failed: ${p.failed.join(' | ')}`);
  if (p.errors.length) console.log(`  console: ${p.errors.join(' | ')}`);
}
