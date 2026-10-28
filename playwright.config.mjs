// Scripted (Playwright) runs. Pick the app and environment with env vars:
//   AGT_PROJECT=hqzen AGT_ENV=develop npx playwright test            (all specs of the project)
//   AGT_PROJECT=hqzen AGT_ENV=develop npx playwright test --grep @smoke
// Specs live in projects/<project>/e2e/*.spec.mjs. Hosts are restricted by tools/e2e/targets.mjs.
//
// Modes (easiest via `node tools/e2e/run.mjs`):
//   background  headless, fastest (default)
//   watch       AGT_HEADED=1: a visible browser window, slowed down (AGT_SLOWMO ms, default 400)
//   ui          `npx playwright test --ui`: step-by-step timeline you can replay
//
// PRIVACY: screenshots, videos and traces are OFF by default because they can capture real data
// from shared test environments. AGT_ARTIFACTS=1 keeps screenshots/traces of failures;
// AGT_VIDEO=on|failures records videos. Keep both local unless you accept who can see them.
import { defineConfig, devices } from '@playwright/test';
import { resolveTarget } from './tools/e2e/targets.mjs';

const t = resolveTarget();
const artifacts = process.env.AGT_ARTIFACTS === '1';
const ci = !!process.env.CI;
const headed = process.env.AGT_HEADED === '1';
const slowMo = Number(process.env.AGT_SLOWMO || (headed ? 400 : 0));
const video = { on: 'on', failures: 'retain-on-failure' }[process.env.AGT_VIDEO] || 'off';

export default defineConfig({
  testDir: `projects/${t.project}/e2e`,
  testMatch: /.*\.spec\.mjs$/,
  // AGT_GREP="@smoke|@isolation" selects suites by tag (handy in CI and on Windows shells).
  ...(process.env.AGT_GREP ? { grep: new RegExp(process.env.AGT_GREP) } : {}),
  outputDir: 'reports/e2e/artifacts',
  timeout: headed || slowMo ? 240_000 : 90_000, // slowed-down runs need more time
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // shared test environment + created accounts: keep runs sequential and predictable
  retries: ci ? 1 : 0,
  forbidOnly: ci,
  reporter: [
    // In CI, failing tests also appear as annotations on the run page (test name + assertion message).
    ...(ci ? [['github']] : []),
    ['list'],
    ['junit', { outputFile: 'reports/e2e/junit.xml' }],
    ['json', { outputFile: 'reports/e2e/results.json' }],
  ],
  use: {
    baseURL: t.baseURL,
    headless: !headed,
    launchOptions: { slowMo },
    viewport: { width: 1400, height: 900 },
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    screenshot: artifacts ? 'only-on-failure' : 'off',
    video: video === 'off' ? 'off' : { mode: video, size: { width: 1280, height: 820 } },
    trace: artifacts ? 'retain-on-failure' : 'off',
    ignoreHTTPSErrors: false,
    ...(process.env.AGT_CHANNEL ? { channel: process.env.AGT_CHANNEL } : {}),
  },
  projects: [{ name: `${t.project}-${t.envName}`, use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } } }],
  metadata: { project: t.project, environment: t.envName },
});
