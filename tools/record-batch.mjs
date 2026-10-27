#!/usr/bin/env node
// Records many results at once from a JSON file:
//   [{ "row": "...", "status": "...", "note": "...", "sev": "S3", "evidence": "a.png", "bugTitle": "...", "sameAs": "ROW" }]
//   node tools/record-batch.mjs <runId|latest> results.json
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './lib/cases.mjs';

const [runId, file] = process.argv.slice(2);
if (!runId || !file) { console.error('Usage: node tools/record-batch.mjs <runId|latest> results.json'); process.exit(1); }
const items = JSON.parse(fs.readFileSync(file, 'utf8'));
let failed = 0;
for (const it of items) {
  const a = [path.join(ROOT, 'tools', 'record.mjs'), runId, it.row, it.status];
  if (it.note) a.push('--note', it.note);
  if (it.sev) a.push('--sev', it.sev);
  if (it.evidence) a.push('--evidence', it.evidence);
  if (it.bugTitle) a.push('--bug-title', it.bugTitle);
  if (it.sameAs) a.push('--same-as', it.sameAs);
  if (it.repro) a.push('--repro', it.repro);
  const r = spawnSync(process.execPath, a, { encoding: 'utf8' });
  process.stdout.write(r.stdout.replace(/\n$/, '') + (r.stderr ? `  !! ${r.stderr.trim()}` : '') + '\n');
  if (r.status) failed++;
}
process.exit(failed ? 1 : 0);
