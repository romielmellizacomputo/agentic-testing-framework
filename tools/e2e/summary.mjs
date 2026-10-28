#!/usr/bin/env node
// Prints a Markdown summary of reports/e2e/results.json (for $GITHUB_STEP_SUMMARY or the terminal).
// Shows test titles, outcomes and known-issue annotations only - never page content.
import fs from 'node:fs';
import { P, redact } from '../lib/cases.mjs';

const file = P('reports', 'e2e', 'results.json');
if (!fs.existsSync(file)) { console.log('No results file (tests did not run).'); process.exit(0); }
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = [];
const walk = (suite, trail = []) => {
  for (const s of suite.suites || []) walk(s, [...trail, s.title].filter(Boolean));
  for (const spec of suite.specs || []) for (const t of spec.tests || []) {
    const last = t.results?.at(-1) || {};
    const status = t.status === 'skipped' ? 'skipped' : last.status === 'passed' ? (t.results.length > 1 ? 'flaky' : 'passed') : last.status || t.status;
    const note = status === 'skipped' ? (t.annotations || []).find(a => a.type === 'skip')?.description
      : (last.error?.message || '').split('\n')[0];
    rows.push({ title: [...trail.slice(1), spec.title].join(' › '), status, note: note || '', known: (t.annotations || []).filter(a => a.type === 'known-issue').map(a => a.description) });
  }
};
walk(data);
const icon = { passed: '✅', failed: '❌', timedOut: '❌', flaky: '⚠️', skipped: '⏭️', interrupted: '⛔' };
const count = s => rows.filter(r => r.status === s).length;
const meta = data.config?.metadata || {};
let out = `## E2E: ${meta.project || ''} / ${meta.environment || ''}\n\n`;
out += `✅ ${count('passed')} passed · ❌ ${count('failed') + count('timedOut')} failed · ⚠️ ${count('flaky')} flaky · ⏭️ ${count('skipped')} skipped\n\n`;
out += `| | Test | Note |\n|---|---|---|\n`;
for (const r of rows) out += `| ${icon[r.status] || r.status} | ${r.title.replace(/\|/g, '/')} | ${redact(r.note).replace(/\|/g, '/').replace(/\x1b\[[0-9;]*m/g, '').slice(0, 160)}${r.known.length ? ` _known: ${[...new Set(r.known)].length}_` : ''} |\n`;
const known = [...new Set(rows.flatMap(r => r.known))];
if (known.length) out += `\n<details><summary>Known server errors seen (${known.length}) — already reported, not failing the run</summary>\n\n${known.map(k => `- ${k}`).join('\n')}\n\n</details>\n`;
console.log(out);
