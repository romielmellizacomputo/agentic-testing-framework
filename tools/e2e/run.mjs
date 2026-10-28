#!/usr/bin/env node
// Easiest way to run the scripted tests. Asks what you want, or takes flags:
//
//   node tools/e2e/run.mjs                                     # asks: project, environment, suite, mode
//   node tools/e2e/run.mjs --project hqzen --env develop --suite smoke --mode watch
//
// Modes:   watch       a visible browser window you can follow (slowed down; --slow <ms> to change)
//          background  headless and fast
//          ui          Playwright's UI: pick tests, watch each step, replay the timeline
// Suites:  smoke | isolation | regression | full | <any tag or test id, e.g. ACC-001>
//
// Credentials: the approver comes from AGT_APPROVER_EMAIL/_PASSWORD or the private accounts file.
// Uses your installed Google Chrome when available (no download needed), else Playwright's Chromium.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import { listProjects, parseArgs, P } from '../lib/cases.mjs';

const SUITES = {
  smoke: '@smoke',
  isolation: '@isolation',
  regression: '@regression',
  full: '@smoke|@isolation|@regression|@security',
};
const MODES = ['watch', 'background', 'ui'];
const args = parseArgs(process.argv.slice(2));
const val = k => (args[k] && args[k] !== true ? String(args[k]) : null);

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
async function choose(label, options, preset, fallback) {
  if (preset) return preset;
  if (!rl) return fallback;
  console.log(`\n${label}:`);
  options.forEach((o, i) => console.log(`  ${i + 1}) ${o}${o === fallback ? '  (default)' : ''}`));
  const a = (await rl.question('> ')).trim();
  return options[Number(a) - 1] || options.find(o => o === a) || a || fallback;
}

const projects = listProjects().filter(p => fs.existsSync(P('projects', p, 'e2e')));
const project = await choose('Project', projects, val('project'), projects.includes('hqzen') ? 'hqzen' : projects[0]);
const env = await choose('Environment', ['develop', 'staging'], val('env'), 'develop');
const suite = await choose('Suite', Object.keys(SUITES), val('suite'), 'smoke');
const mode = await choose('Mode (watch = see the browser)', MODES, val('mode'), 'watch');
rl?.close();
if (!MODES.includes(mode)) { console.error(`Unknown mode "${mode}". Use: ${MODES.join(', ')}`); process.exit(1); }

const hasChrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/opt/google/chrome/chrome',
].some(p => p && fs.existsSync(p));

const env2 = {
  ...process.env,
  AGT_PROJECT: project,
  AGT_ENV: env,
  AGT_GREP: SUITES[suite] || suite,
  ...(mode === 'watch' ? { AGT_HEADED: '1', AGT_SLOWMO: val('slow') || process.env.AGT_SLOWMO || '400' } : {}),
  ...(hasChrome && !process.env.AGT_CHANNEL ? { AGT_CHANNEL: 'chrome' } : {}),
};
const pwArgs = ['playwright', 'test', ...(mode === 'ui' ? ['--ui'] : [])];
console.log(`\nRunning ${project} / ${env} / ${suite} in ${mode} mode${mode === 'watch' ? ' - a browser window will open' : ''}...\n`);
const child = spawn('npx', pwArgs, { stdio: 'inherit', env: env2, shell: process.platform === 'win32' });
child.on('exit', code => {
  if (mode !== 'ui') console.log('\nSummary: node tools/e2e/summary.mjs   (JUnit: reports/e2e/junit.xml)');
  process.exit(code ?? 1);
});
