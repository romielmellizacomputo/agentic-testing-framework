#!/usr/bin/env node
// Records one result. The only supported way to change results.json.
//
//   node tools/record.mjs <runId|latest> <ROW> <status> [--note "..."] [--evidence a.png,b.txt] [--sev S2]
//                         [--bug-title "What is broken"] [--same-as <ROW of the primary bug>] [--repro "1. ...\n2. ..."]
//
// ROW is the plan row: "BOARD-012@employee", or just "BOARD-012" when the case has one row.
// status: pass | fail | blocked | skipped | needs_update | flaky
import fs from 'node:fs';
import path from 'node:path';
import { loadRun, latestRunId, parseArgs, writeJSON, STATUSES } from './lib/cases.mjs';

const args = parseArgs(process.argv.slice(2));
let [runId, rowArg, status] = args._;
if (!runId || !rowArg || !status) {
  console.error('Usage: node tools/record.mjs <runId|latest> <ROW> <status> [--note ".."] [--evidence a.png] [--sev S1-S4]');
  process.exit(1);
}
if (runId === 'latest') runId = latestRunId();
const { dir, plan, results } = loadRun(runId);

if (!STATUSES.includes(status) || status === 'not_run') fail(`Status must be one of: ${STATUSES.filter(s => s !== 'not_run').join(', ')}`);

let rows = plan.rows.filter(r => r.row === rowArg);
if (!rows.length) rows = plan.rows.filter(r => r.id === rowArg);
if (!rows.length) fail(`Row ${rowArg} is not in run ${runId}.`);
if (rows.length > 1) fail(`${rowArg} has ${rows.length} rows: ${rows.map(r => r.row).join(', ')}. Pass the full row name.`);
const row = rows[0];

const note = args.note === true ? '' : (args.note || '');
if (['fail', 'blocked', 'needs_update', 'flaky'].includes(status) && !note) fail(`A --note is required for status "${status}".`);
const sev = args.sev && args.sev !== true ? String(args.sev).toUpperCase() : (note.match(/sev:(S[1-4])/i)?.[1]?.toUpperCase() || null);
if (status === 'fail' && !sev) console.warn('warn: no severity given (use --sev S1..S4); report will show "unrated".');

const evidence = args.evidence && args.evidence !== true ? String(args.evidence).split(',').map(s => s.trim()) : [];
for (const e of evidence) if (!fs.existsSync(path.join(dir, 'evidence', e))) console.warn(`warn: evidence file not found yet: evidence/${e}`);

// Bug grouping: --bug-title "Short description of the defect", --same-as <ROW> (duplicate of another failed row's bug).
const bugTitle = args['bug-title'] && args['bug-title'] !== true ? String(args['bug-title']) : undefined;
const sameAs = args['same-as'] && args['same-as'] !== true ? String(args['same-as']) : undefined;
// --repro "1. ... 2. ..." concrete steps for the bug (used instead of the generic case steps).
const repro = args.repro && args.repro !== true ? String(args.repro).replace(/\\n/g, '\n') : undefined;
if (sameAs && !plan.rows.some(r => r.row === sameAs)) fail(`--same-as ${sameAs} is not a row in this run.`);

// Refuse anything that looks like a credential. Emails are masked later in reports.
const SECRET = /password\s*[:=]|passwd|bearer\s+[a-z0-9._-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.|xox[abp]-[A-Za-z0-9-]{10,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}/i;
for (const [k, v] of [['note', note], ['repro', repro || ''], ['bug-title', bugTitle || '']]) if (SECRET.test(v)) fail(`The ${k} looks like it contains a secret. Remove it and try again.`);

const prev = results[row.row] || { attempts: 0, notes: [], evidence: [] };
const sameStatus = prev.status === status;
results[row.row] = {
  status,
  severity: status === 'fail' || status === 'flaky' ? sev : null,
  attempts: (prev.attempts || 0) + 1,
  // Notes carry over only while the status stays the same; a new status starts fresh (old notes go to history).
  notes: sameStatus ? (note ? [...(prev.notes || []), note] : prev.notes || []) : (note ? [note] : []),
  evidence: [...new Set([...(prev.evidence || []), ...evidence])],
  bugTitle: bugTitle ?? (sameStatus ? prev.bugTitle : undefined),
  sameAs: sameAs ?? (sameStatus ? prev.sameAs : undefined),
  repro: repro ?? (sameStatus ? prev.repro : undefined),
  recordedAt: new Date().toISOString(),
  history: [...(prev.history || []), ...(prev.status && prev.status !== 'not_run' ? [{ status: prev.status, at: prev.recordedAt, notes: prev.notes }] : [])],
};
writeJSON(path.join(dir, 'results.json'), results);

const left = plan.rows.filter(r => (results[r.row]?.status || 'not_run') === 'not_run').length;
console.log(`${row.row} → ${status}${sev ? ` (${sev})` : ''}. ${left} rows left.`);

function fail(msg) { console.error(msg); process.exit(1); }
