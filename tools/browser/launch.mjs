#!/usr/bin/env node
// Opens a visible Chrome window that agents drive (tools/browser/run.mjs) while a human watches.
// Uses your installed Chrome with a throwaway profile in .browser-profile/ — your normal profile is never touched.
// The control port listens on 127.0.0.1 only.
//
//   node tools/browser/launch.mjs [url]          env: CHROME_PATH, AGT_CDP_PORT (default 9333)
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, loadEnv, baseUrl } from '../lib/cases.mjs';

const PORT = Number(process.env.AGT_CDP_PORT || 9333);
const url = process.argv[2] || `${baseUrl(loadEnv())}/`;

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const chrome = candidates.find(p => fs.existsSync(p));
if (!chrome) { console.error('Chrome not found. Set CHROME_PATH.'); process.exit(1); }

const up = async () => { try { return (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok; } catch { return false; } };
if (await up()) { console.log(`Test Chrome already open (port ${PORT}).`); process.exit(0); }

const profile = path.join(ROOT, '.browser-profile');
fs.mkdirSync(profile, { recursive: true });
spawn(chrome, [
  `--remote-debugging-port=${PORT}`, '--remote-debugging-address=127.0.0.1',
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--disable-sync', '--password-store=basic', '--window-size=1400,950', url,
], { detached: true, stdio: 'ignore' }).unref();

for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 500));
  if (await up()) { console.log(`Test Chrome opened at ${url} (port ${PORT}, profile .browser-profile/)`); process.exit(0); }
}
console.error('Chrome started but the control port did not come up.');
process.exit(1);
