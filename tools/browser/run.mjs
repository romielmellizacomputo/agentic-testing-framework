#!/usr/bin/env node
// Runs a snippet of Playwright code against the visible test Chrome (start it with launch.mjs).
//
//   node tools/browser/run.mjs -e "await page.goto(base + '/'); return await page.title()"
//   node tools/browser/run.mjs steps.js         (file containing an async function body)
//
// Snippet scope: page, context, browser, base (target env URL, no trailing slash), log(...), sleep(ms).
// Prints JSON: result, current URL/title, console errors and failed requests (status >= 400) seen during the snippet.
// Only run snippets you wrote or reviewed: they execute with full access to the test browser session.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { loadEnv, baseUrl, ROOT } from '../lib/cases.mjs';

const require = createRequire(`${ROOT}/package.json`);
const { chromium } = require('playwright-core');
const PORT = Number(process.env.AGT_CDP_PORT || 9333);
const base = baseUrl(loadEnv());

const args = process.argv.slice(2);
const code = args[0] === '-e' ? args[1] : args[0] && fs.readFileSync(args[0], 'utf8');
if (!code) { console.error('Usage: run.mjs -e "<code>" | run.mjs file.js'); process.exit(1); }

const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`, { slowMo: Number(process.env.AGT_SLOWMO || 120) });
const context = browser.contexts()[0];
const host = new URL(base).host;
const page = context.pages().find(p => p.url().includes(host)) || context.pages()[0] || await context.newPage();
await page.bringToFront();

const consoleErrors = []; const failed = [];
const onConsole = m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); };
const onPageError = e => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`);
const onResponse = r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.request().method()} ${r.url().replace(/[?#].*/, '').slice(0, 200)}`); };
page.on('console', onConsole); page.on('pageerror', onPageError); page.on('response', onResponse);

const logs = [];
const log = (...a) => logs.push(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

let result, error;
try { result = await new AsyncFunction('page', 'context', 'browser', 'base', 'log', 'sleep', code)(page, context, browser, base, log, sleep); }
catch (e) { error = String(e.message || e).split('\n').slice(0, 6).join('\n'); }

const current = context.pages().includes(page) ? page : context.pages().at(-1);
console.log(JSON.stringify({ url: current?.url(), title: await current?.title().catch(() => null), result, error, logs,
  consoleErrors: [...new Set(consoleErrors)], failedRequests: [...new Set(failed)] }, null, 2));
await browser.close().catch(() => {}); // disconnects only; the window stays open
process.exit(error ? 2 : 0);
