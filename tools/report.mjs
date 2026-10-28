#!/usr/bin/env node
// Builds the run report and bug drafts.
//   node tools/report.mjs [runId|latest]
//
// Output:
//   reports/<runId>/report.md     summary, per-module table, failures, blocked, not run, run notes
//   reports/<runId>/junit.xml     for GitLab / CI test reports
//   reports/<runId>/evidence/     copies of every evidence file the report links to
//   reports/INDEX.md              one line per run (newest first)
//   bugs/<runId>/<ROW>.md         one ready-to-file bug draft per failed row
//   bugs/<runId>/evidence/        copies of the evidence those bugs link to
//   bugs/INDEX.md                 every bug from every run, most severe first
// Raw run data (plan, results, context, all evidence) stays in runs/<runId>/.
// Free-text notes for the report go in runs/<runId>/run-notes.md (kept across regenerations).
import fs from 'node:fs';
import path from 'node:path';
import { loadRun, latestRunId, parseArgs, allCases, STATUSES, P, readJSON, redact } from './lib/cases.mjs';
// Everything written below passes through redact(): emails are masked and token-like strings removed.

const args = parseArgs(process.argv.slice(2));
let runId = args._[0] || 'latest';
if (runId === 'latest') runId = latestRunId();
const { dir, plan, results } = loadRun(runId);
const caseById = new Map(allCases().map(c => [c.id, c]));

const reportDir = P('reports', runId);
const bugDir = P('bugs', runId);
fs.mkdirSync(path.join(reportDir, 'evidence'), { recursive: true });
fs.rmSync(bugDir, { recursive: true, force: true }); // rebuilt from results each time
fs.mkdirSync(path.join(bugDir, 'evidence'), { recursive: true });

const rows = plan.rows.map(r => ({ ...r, res: results[r.row] || { status: 'not_run', notes: [], evidence: [] } }));
const count = s => rows.filter(r => r.res.status === s).length;
const executed = rows.filter(r => !['not_run', 'skipped'].includes(r.res.status));
const passRate = executed.length ? Math.round(100 * (count('pass') + count('flaky')) / executed.length) : 0;
const sevOrder = { S1: 0, S2: 1, S3: 2, S4: 3 };
const fails = rows.filter(r => r.res.status === 'fail').sort((a, b) => (sevOrder[a.res.severity] ?? 9) - (sevOrder[b.res.severity] ?? 9));
const verdict = fails.some(r => ['S1', 'S2'].includes(r.res.severity)) || rows.some(r => r.priority === 'P0' && r.res.status === 'fail')
  ? 'NOT READY — P0 or S1/S2 failures'
  : count('not_run') ? 'INCOMPLETE — rows not executed'
  : fails.length ? 'READY WITH KNOWN ISSUES' : 'READY';

// A failed row with sameAs is a duplicate: it gets no file of its own and is listed inside the primary bug.
const primaryOf = r => {
  let cur = r; const seen = new Set();
  while (cur.res.sameAs && !seen.has(cur.row)) { seen.add(cur.row); cur = rows.find(x => x.row === cur.res.sameAs) || cur; }
  return cur;
};
const bugFile = r => `${primaryOf(r).row.replace(/[@/]/g, '_')}.md`;
const bugTitleOf = r => primaryOf(r).res.bugTitle || `${primaryOf(r).title} — FAILED`;
const copyEvidence = (files, toDir) => {
  for (const e of files || []) {
    const src = path.join(dir, 'evidence', e);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(toDir, 'evidence', e));
  }
};
const ev = r => (r.res.evidence || []).map(e => `[${e}](evidence/${encodeURIComponent(e)})`).join(', ');
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

// ---------- report ----------
let md = `# Test run ${runId}\n\n**Verdict: ${verdict}**\n\n`;
const nBugs = fails.filter(r => primaryOf(r) === r).length;
md += `| | |\n|---|---|\n| Project | ${plan.project || '-'} |\n| Environment | ${plan.env} (${plan.baseUrl}) |\n| Selector | ${esc(plan.selector)} |\n| Planned | ${plan.createdAt} |\n| Report | ${new Date().toISOString()} |\n| Rows | ${rows.length} (${plan.counts.cases} cases) |\n| Pass rate (executed) | ${passRate}% |\n| Bugs | [${nBugs} bugs from ${fails.length} failed rows](../../bugs/${runId}/) |\n\n`;
md += `| ${STATUSES.join(' | ')} |\n|${STATUSES.map(() => '---:').join('|')}|\n| ${STATUSES.map(count).join(' | ')} |\n\n`;

const notesFile = path.join(dir, 'run-notes.md');
if (fs.existsSync(notesFile)) md += `${fs.readFileSync(notesFile, 'utf8').trim()}\n\n`;

const mods = [...new Set(rows.map(r => r.module))];
md += `## By module\n\n| Module | Rows | Pass | Fail | Blocked | Needs update | Skipped | Not run |\n|---|---:|---:|---:|---:|---:|---:|---:|\n`;
for (const m of mods) {
  const mr = rows.filter(r => r.module === m);
  const c = s => mr.filter(r => r.res.status === s).length;
  md += `| ${m} | ${mr.length} | ${c('pass') + c('flaky')} | ${c('fail')} | ${c('blocked')} | ${c('needs_update')} | ${c('skipped')} | ${c('not_run')} |\n`;
}

const section = (title, list, withSev, withBug) => {
  if (!list.length) return '';
  let s = `\n## ${title} (${list.length})\n\n| Row | ${withSev ? 'Sev | ' : ''}Title | Note | Evidence |\n|---|${withSev ? '---|' : ''}---|---|---|\n`;
  for (const r of list) {
    const rowCell = withBug ? `[${r.row}](../../bugs/${runId}/${bugFile(r)})` : r.row;
    s += `| ${rowCell} | ${withSev ? `${r.res.severity || 'unrated'} | ` : ''}${esc(r.title)} | ${esc((r.res.notes || []).join(' / '))} | ${ev(r)} |\n`;
  }
  return s;
};
md += section('Failures', fails, true, true);
md += section('Flaky', rows.filter(r => r.res.status === 'flaky'), true);
md += section('Test cases to update', rows.filter(r => r.res.status === 'needs_update'));
md += section('Blocked', rows.filter(r => r.res.status === 'blocked'));
md += section('Skipped', rows.filter(r => r.res.status === 'skipped'));
md += section('Not run', rows.filter(r => r.res.status === 'not_run'));
md += section('Passed', rows.filter(r => r.res.status === 'pass'));

const proposed = path.join(dir, 'proposed-cases.md');
const nProposed = fs.existsSync(proposed) ? (fs.readFileSync(proposed, 'utf8').match(/^### /gm) || []).length : 0;
if (nProposed) {
  fs.writeFileSync(path.join(reportDir, 'proposed-cases.md'), redact(fs.readFileSync(proposed, 'utf8')));
  md += `\n## Proposed new cases\n\nSee [proposed-cases.md](proposed-cases.md) — ${nProposed} proposals to review.\n`;
}
for (const r of rows) copyEvidence(r.res.evidence, reportDir);
fs.writeFileSync(path.join(reportDir, 'report.md'), redact(md));

// ---------- bug drafts ----------
const primaries = fails.filter(r => primaryOf(r) === r);
for (const r of primaries) {
  const c = caseById.get(r.id) || {};
  const dups = fails.filter(d => d !== r && primaryOf(d) === r);
  const worst = [r, ...dups].map(x => x.res.severity).filter(Boolean).sort((a, b) => sevOrder[a] - sevOrder[b])[0];
  const allEvidence = [...new Set([r, ...dups].flatMap(x => x.res.evidence || []))];
  const body = `## [${r.module}] ${bugTitleOf(r)}\n\n` +
    `**Severity:** ${worst || '(set S1–S4)'}\n` +
    `**Status:** draft (not filed yet)\n` +
    `**Environment:** ${plan.env}\n` +
    `**Role:** ${r.actors.join(' + ')}\n` +
    `**Test case:** ${r.id} — ${r.title} (${c.file || ''})\n` +
    `**Agent run:** ${runId} — [report](../../reports/${runId}/report.md)\n` +
    (c.legacy?.length ? `**Related scripted tests:** ${c.legacy.join(', ')}\n` : '') +
    (r.res.repro
      ? `\n### Steps to reproduce\n${r.res.repro.trim()}\n\n`
      : `\n### Steps to reproduce\n${c.preconditions ? `Preconditions: ${c.preconditions}\n\n` : ''}${(c.steps || '').trim()}\n\n`) +
    `### Expected (from test case ${r.id})\n${(c.expected || '').trim()}\n\n` +
    `### Actual\n${(r.res.notes || []).join('\n\n')}\n\n` +
    (dups.length ? `### Also seen in\n${dups.map(d => `- **${d.row}** (${d.res.severity || 'unrated'}) — ${d.title}: ${(d.res.notes || []).join(' ')}`).join('\n')}\n\n` : '') +
    `### Evidence\n${allEvidence.map(e => `- [${e}](evidence/${encodeURIComponent(e)})`).join('\n') || '- (none attached)'}\n`;
  fs.writeFileSync(path.join(bugDir, bugFile(r)), redact(body));
  copyEvidence(allEvidence, bugDir);
}
if (!fs.readdirSync(path.join(bugDir, 'evidence')).length) fs.rmSync(path.join(bugDir, 'evidence'), { recursive: true });
if (!fails.length) fs.rmSync(bugDir, { recursive: true, force: true });

// ---------- JUnit ----------
const x = s => String(s ?? '').replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]));
let junit = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites name="agentic ${x(runId)}" tests="${rows.length}" failures="${count('fail')}" skipped="${count('skipped') + count('not_run')}">\n`;
for (const m of mods) {
  const mr = rows.filter(r => r.module === m);
  junit += `  <testsuite name="${x(m)}" tests="${mr.length}" failures="${mr.filter(r => r.res.status === 'fail').length}">\n`;
  for (const r of mr) {
    junit += `    <testcase classname="${x(m)}" name="${x(`${r.row} ${r.title}`)}">`;
    const note = x((r.res.notes || []).join(' / '));
    if (r.res.status === 'fail') junit += `<failure message="${x(r.res.severity || 'unrated')}">${note}</failure>`;
    else if (['skipped', 'not_run', 'blocked', 'needs_update'].includes(r.res.status)) junit += `<skipped message="${x(r.res.status)}: ${note}"/>`;
    junit += `</testcase>\n`;
  }
  junit += `  </testsuite>\n`;
}
fs.writeFileSync(path.join(reportDir, 'junit.xml'), redact(`${junit}</testsuites>\n`));

// ---------- indexes across runs ----------
const runIds = fs.readdirSync(P('runs')).filter(d => fs.existsSync(P('runs', d, 'plan.json'))).sort().reverse();
let rIdx = `# Reports\n\nOne folder per agent run. Newest first. Regenerated by \`node tools/report.mjs\`.\n\n| Run | Project | Env | Selector | Verdict | Pass | Fail | Blocked | Not run |\n|---|---|---|---|---|---:|---:|---:|---:|\n`;
let bIdx = `# Bugs\n\nDraft bug reports from agent runs, most severe first. One file per defect (duplicate failures are listed inside it under "Also seen in"). Each file is ready to paste into your tracker; change **Status** once filed.\n\n| Sev | Bug | Project | Run | Env | Test case rows |\n|---|---|---|---|---|---|\n`;
const allBugs = [];
for (const id of runIds) {
  const pl = readJSON(P('runs', id, 'plan.json'));
  const rs = readJSON(P('runs', id, 'results.json'), {});
  const st = s => pl.rows.filter(r => (rs[r.row]?.status || 'not_run') === s).length;
  const hasReport = fs.existsSync(P('reports', id, 'report.md'));
  const anyFail = pl.rows.some(r => rs[r.row]?.status === 'fail' && ['S1', 'S2'].includes(rs[r.row]?.severity));
  const v = anyFail ? 'NOT READY' : st('not_run') ? 'INCOMPLETE' : st('fail') ? 'KNOWN ISSUES' : 'READY';
  rIdx += `| ${hasReport ? `[${id}](${id}/report.md)` : id} | ${pl.project || '-'} | ${pl.env} | ${esc(pl.selector)} | ${v} | ${st('pass') + st('flaky')} | ${st('fail')} | ${st('blocked')} | ${st('not_run')} |\n`;
  for (const r of pl.rows) {
    const res = rs[r.row];
    if (res?.status !== 'fail' || res.sameAs) continue; // duplicates live inside their primary bug
    const file = `${r.row.replace(/[@/]/g, '_')}.md`;
    if (!fs.existsSync(P('bugs', id, file))) continue;
    const dupRows = pl.rows.filter(d => rs[d.row]?.status === 'fail' && rs[d.row]?.sameAs === r.row).map(d => d.row);
    const sev = [res.severity, ...dupRows.map(d => rs[d].severity)].filter(Boolean).sort((a, b) => sevOrder[a] - sevOrder[b])[0] || 'unrated';
    allBugs.push({ sev, title: `[${r.module}] ${res.bugTitle || r.title}`, file: `${id}/${file}`, run: id, project: pl.project || '-', env: pl.env, row: [r.row, ...dupRows].join(', ') });
  }
}
allBugs.sort((a, b) => (sevOrder[a.sev] ?? 9) - (sevOrder[b.sev] ?? 9) || b.run.localeCompare(a.run));
for (const b of allBugs) bIdx += `| ${b.sev} | [${esc(b.title)}](${b.file}) | ${b.project} | ${b.run} | ${b.env} | ${b.row} |\n`;
fs.writeFileSync(P('reports', 'INDEX.md'), redact(rIdx));
fs.writeFileSync(P('bugs', 'INDEX.md'), redact(bIdx));

console.log(`${verdict}\nPass rate ${passRate}% · fail ${count('fail')} · blocked ${count('blocked')} · needs_update ${count('needs_update')} · not run ${count('not_run')}`);
console.log(`Report: reports/${runId}/report.md (+ junit.xml)\nBugs:   bugs/${runId}/ (${primaries.length} bugs from ${fails.length} failed rows) · indexes: reports/INDEX.md, bugs/INDEX.md`);
