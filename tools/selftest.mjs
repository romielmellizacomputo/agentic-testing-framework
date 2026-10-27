#!/usr/bin/env node
// End-to-end check of the tool chain without a browser: validate -> plan -> record -> report -> cleanup.
// Used by CI. Leaves nothing behind.
//   node tools/selftest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { P, readJSON } from './lib/cases.mjs';

const runId = `selftest-${process.pid}`;
const node = (...a) => {
  const r = spawnSync(process.execPath, a, { cwd: P(), encoding: 'utf8' });
  if (r.status !== 0) { console.error(`FAILED: node ${a.join(' ')}\n${r.stdout}\n${r.stderr}`); cleanup(); process.exit(1); }
  return r.stdout;
};
const cleanup = () => {
  for (const d of [P('runs', runId), P('reports', runId), P('bugs', runId)]) fs.rmSync(d, { recursive: true, force: true });
  for (const idx of [P('reports', 'INDEX.md'), P('bugs', 'INDEX.md')]) if (fs.existsSync(idx) && !hasOtherRuns()) fs.rmSync(idx);
};
const hasOtherRuns = () => fs.readdirSync(P('runs')).some(d => d !== runId && fs.existsSync(P('runs', d, 'plan.json')));
const assert = (cond, msg) => { if (!cond) { console.error(`ASSERT: ${msg}`); cleanup(); process.exit(1); } console.log(`ok - ${msg}`); };

node('tools/validate-cases.mjs');
console.log('ok - test cases valid');
node('tools/plan-run.mjs', '--suite', 'smoke', '--run-id', runId);
const plan = readJSON(P('runs', runId, 'plan.json'));
assert(plan.rows.length > 0, `plan has ${plan.rows.length} rows`);

const [first, second] = plan.rows;
node('tools/record.mjs', runId, first.row, 'pass');
if (second) node('tools/record.mjs', runId, second.row, 'fail', '--sev', 'S3', '--note', 'selftest failure for user@example.com', '--bug-title', 'Selftest bug', '--repro', '1. step one\\n2. step two');
const leak = spawnSync(process.execPath, ['tools/record.mjs', runId, first.row, 'pass', '--note', 'password=hunter2'], { cwd: P(), encoding: 'utf8' });
assert(leak.status !== 0, 'record.mjs refuses notes that contain a password');

node('tools/report.mjs', runId);
const report = fs.readFileSync(P('reports', runId, 'report.md'), 'utf8');
assert(report.includes('Verdict'), 'report.md written');
assert(fs.existsSync(P('reports', runId, 'junit.xml')), 'junit.xml written');
if (second) {
  const bug = fs.readFileSync(path.join(P('bugs', runId), `${second.row.replace(/[@/]/g, '_')}.md`), 'utf8');
  assert(bug.includes('Selftest bug') && bug.includes('2. step two'), 'bug file has title and repro steps');
  assert(!bug.includes('user@example.com') && bug.includes('u***@example.com'), 'emails are masked in bug files');
}
cleanup();
console.log('\nselftest passed');
