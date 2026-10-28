// Shared Playwright fixtures for every project's e2e specs.
//
//   import { test, expect } from '../../../tools/e2e/fixtures.mjs';
//
// Fixtures:
//   target    { project, envName, baseURL, allowDestructive, env }
//   health    collects 5xx responses and uncaught page errors for the test; call health.assertClean()
//   approver  { email, password } of the standing approver account (from secrets), or null
//   runTag    unique prefix for data created by this run, e.g. "AGT-m3k2x9"
//
// Known, already-reported server errors can be listed per project in projects/<p>/e2e/known-issues.json:
//   [{ "pattern": "/api-sileo/v1/hqzen/todo/filter/", "status": 500, "issue": "HR-001" }]
// They are reported as annotations instead of failing the test, so only NEW errors fail.
import fs from 'node:fs';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { resolveTarget } from './targets.mjs';
import { loadAccounts, P } from '../lib/cases.mjs';

export { expect };

const target = resolveTarget();
const knownFile = P('projects', target.project, 'e2e', 'known-issues.json');
const KNOWN = fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')) : [];
const isKnown = (url, status) => KNOWN.find(k => url.includes(k.pattern) && (!k.status || k.status === status));
const IGNORE_URL = /google-analytics|googletagmanager|\/g\/collect|hotjar|sentry|favicon/i;

export const RUN_TAG = `AGT-${Date.now().toString(36)}`;

// Approver: a standing account allowed to approve/promote inside flows.
// Read ONLY from environment (GitHub secrets) or the private accounts file - never from code.
function approverCreds() {
  const email = process.env.AGT_APPROVER_EMAIL;
  const password = process.env.AGT_APPROVER_PASSWORD;
  if (email && password) return { email, password };
  const acc = loadAccounts();
  const role = process.env.AGT_APPROVER_ROLE || 'org_exec';
  return acc[role]?.email && acc[role]?.password ? { email: acc[role].email, password: acc[role].password } : null;
}

export const test = base.extend({
  target: async ({}, use) => { await use(target); },
  runTag: async ({}, use) => { await use(RUN_TAG); },
  approver: async ({}, use) => { await use(approverCreds()); },
  health: async ({ page }, use, testInfo) => {
    const errors = [];
    const known = [];
    page.on('response', r => {
      const s = r.status();
      const url = r.url().replace(/[?#].*/, '');
      if (s < 500 || IGNORE_URL.test(url)) return;
      const k = isKnown(url, s);
      (k ? known : errors).push(`${s} ${r.request().method()} ${new URL(url).pathname}${k ? ` (known: ${k.issue})` : ''}`);
    });
    page.on('pageerror', e => errors.push(`pageerror: ${String(e.message).slice(0, 200)}`));
    const api = {
      errors, known,
      // Fails the test if any NEW 5xx or uncaught error happened so far.
      assertClean: (msg = 'no new 5xx responses or uncaught page errors') => expect([...new Set(errors)], msg).toEqual([]),
    };
    await use(api);
    for (const k of new Set(known)) testInfo.annotations.push({ type: 'known-issue', description: k });
  },
});

// Helpers usable from any spec
export async function gotoAndSettle(page, url, { timeout = 20000 } = {}) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}
export function lettersOnly(n = 6) {
  return Array.from({ length: n }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
}
export const REPO_ROOT = path.resolve(P());
