#!/usr/bin/env node
// Scans files that git would commit for credentials, tokens, private keys and personal data.
// Exit 1 if anything is found. Runs in CI and as a pre-commit hook (tools/install-hooks.mjs).
//
//   node tools/check-secrets.mjs            # files tracked or staged by git (falls back to all non-ignored files)
//   node tools/check-secrets.mjs --all      # every file in the folder except node_modules/.git
//
// Allow a deliberate example on one line with the marker:  agt-allow-secret
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib/cases.mjs';

const RULES = [
  ['AWS access key', /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['AWS secret key', /aws(.{0,20})?(secret|private)?.{0,20}['"][A-Za-z0-9/+=]{40}['"]/i],
  ['Private key', /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Stripe key', /\b(sk|rk)_(live|test)_[0-9a-zA-Z]{20,}\b/],
  ['OpenAI/Anthropic key', /\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/],
  ['Mapbox token', /\bpk\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['Password value', /"password"\s*:\s*"[^"]{3,}"|\bpassword\s*=\s*['"][^'"]{3,}['"]/i],
  ['Basic auth in URL', /https?:\/\/[^\s/:@]+:[^\s/:@]+@/],
  ['Email address', /\b[A-Za-z0-9._%+-]+@(?!example\.(com|org|net)\b|users\.noreply\.github\.com\b|anthropic\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
];
// Files that must never be committed, whatever they contain.
const FORBIDDEN = [/^config\/accounts\.local\.json$/, /^config\/env\.json$/, /^\.browser-profile\//, /(^|\/)\.env(\.|$)/, /\.(pem|key|p12|pfx)$/];
const SKIP = [/^node_modules\//, /^\.git\//, /package-lock\.json$/, /\.(png|jpe?g|gif|webp|ico|pdf|zip|woff2?)$/i];

const all = process.argv.includes('--all');
let files;
if (!all) {
  try {
    const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    files = out.split(/\r?\n/).filter(Boolean);
  } catch { /* not a git repo yet */ }
}
if (!files) {
  files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
      const rel = d ? `${d}/${e.name}` : e.name;
      if (e.isDirectory()) { if (!['node_modules', '.git', '.browser-profile'].includes(e.name)) walk(rel); }
      else files.push(rel);
    }
  })('');
}

const findings = [];
for (const f of files) {
  const rel = f.replace(/\\/g, '/');
  if (FORBIDDEN.some(re => re.test(rel))) { findings.push(`${rel}: file must not be committed (private config / credentials)`); continue; }
  if (SKIP.some(re => re.test(rel))) continue;
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs) || fs.statSync(abs).size > 2_000_000) continue;
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes('agt-allow-secret')) return;
    for (const [name, re] of RULES) if (re.test(line)) findings.push(`${rel}:${i + 1}: ${name}`);
  });
}

if (findings.length) {
  console.error(`Possible secrets or personal data found (${findings.length}):\n  ${findings.join('\n  ')}`);
  console.error('\nRemove them, move them to gitignored config, or mark a deliberate example line with "agt-allow-secret".');
  process.exit(1);
}
console.log(`check-secrets: ${files.length} files clean.`);
