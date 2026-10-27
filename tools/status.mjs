#!/usr/bin/env node
// Shows progress of a run and the next rows to execute.
//   node tools/status.mjs [runId|latest] [--next 10]
import { loadRun, latestRunId, parseArgs, STATUSES } from './lib/cases.mjs';

const args = parseArgs(process.argv.slice(2));
let runId = args._[0] || 'latest';
if (runId === 'latest') runId = latestRunId();
if (!runId) { console.error('No runs yet. Start one with tools/plan-run.mjs'); process.exit(1); }
const { plan, results } = loadRun(runId);

const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
for (const r of plan.rows) counts[results[r.row]?.status || 'not_run']++;
const done = plan.rows.length - counts.not_run;

console.log(`Run ${runId} · ${plan.env} (${plan.baseUrl}) · ${plan.selector}`);
console.log(`Progress ${done}/${plan.rows.length}  ` + STATUSES.filter(s => counts[s]).map(s => `${s}:${counts[s]}`).join('  '));
console.log(`Data prefix: ${plan.prefix}`);
if (plan.rolesMissingAccounts?.length) console.log(`Missing accounts: ${plan.rolesMissingAccounts.join(', ')}`);

const n = Number(args.next) || 10;
const next = plan.rows.filter(r => (results[r.row]?.status || 'not_run') === 'not_run').slice(0, n);
if (next.length) {
  console.log(`\nNext ${next.length}:`);
  for (const r of next) {
    const blockedDeps = r.depends.filter(d => plan.rows.some(x => x.id === d && ['fail', 'blocked'].includes(results[x.row]?.status)));
    console.log(`  ${r.row.padEnd(30)} ${r.priority} as ${r.actors.join('+').padEnd(22)} ${r.title}${blockedDeps.length ? `   ⚠ depends on failed/blocked ${blockedDeps.join(',')}` : ''}`);
  }
} else console.log('\nAll rows recorded. Run: node tools/report.mjs ' + runId);
