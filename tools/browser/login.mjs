#!/usr/bin/env node
// Signs the test Chrome in as a role. The password is read from config/accounts.local.json or
// AGT_ACCOUNT_<ROLE>_PASSWORD and is never printed; the email is masked in the output.
// Selectors come from env.LOGIN in config/env.json.
//
//   node tools/browser/login.mjs <role>
import { createRequire } from 'node:module';
import { loadEnv, loadAccounts, baseUrl, maskEmail, ROOT } from '../lib/cases.mjs';

const role = process.argv[2];
const acct = loadAccounts()[role];
if (!acct?.email || !acct?.password) { console.error(`No login for role "${role}" (config/accounts.local.json or AGT_ACCOUNT_${String(role).toUpperCase()}_EMAIL/_PASSWORD).`); process.exit(1); }

const env = loadEnv();
const L = { path: '/login', usernameSelector: 'input[type=email], input[name=username], #username', passwordSelector: 'input[type=password]', submitText: 'Sign in', ...(env.LOGIN || {}) };
const base = baseUrl(env);
const require = createRequire(`${ROOT}/package.json`);
const { chromium } = require('playwright-core');
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${process.env.AGT_CDP_PORT || 9333}`, { slowMo: 80 });
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes(new URL(base).host)) || context.pages()[0] || await context.newPage();
await page.bringToFront();

// Start clean: drop the previous role's session.
await context.clearCookies();
await page.goto(`${base}${L.path}`);
await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ } });
await page.goto(`${base}${L.path}`);
await page.locator(L.usernameSelector).first().fill(acct.email);
await page.locator(L.passwordSelector).first().fill(acct.password);
await page.getByRole('button', { name: L.submitText }).first().click();
await page.waitForURL(u => !u.pathname.startsWith(L.path), { timeout: 20000 }).catch(() => {});
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

const url = page.url();
const ok = !new URL(url).pathname.startsWith(L.path);
const err = ok ? null : ((await page.innerText('body')).match(/(wrong|invalid|incorrect|locked|blocked)[^\n]{0,80}/i)?.[0] || 'still on login page');
console.log(JSON.stringify({ role, account: maskEmail(acct.email), signedIn: ok, path: new URL(url).pathname, title: await page.title(), error: err }, null, 2));
await browser.close();
process.exit(ok ? 0 : 2);
