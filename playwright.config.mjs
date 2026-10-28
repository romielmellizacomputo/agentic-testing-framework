// Scripted (Playwright) runs. Pick the app and environment with env vars:
//   AGT_PROJECT=hqzen AGT_ENV=develop npx playwright test            (all specs of the project)
//   AGT_PROJECT=hqzen AGT_ENV=develop npx playwright test --grep @smoke
// Specs live in projects/<project>/e2e/*.spec.mjs. Hosts are restricted by tools/e2e/targets.mjs.
//
// PRIVACY: screenshots, videos and traces are OFF by default because they can capture real data
// from shared test environments. Set AGT_ARTIFACTS=1 locally to keep them for failures only.
import { defineConfig, devices } from '@playwright/test';
import { resolveTarget } from './tools/e2e/targets.mjs';

const t = resolveTarget();
const artifacts = process.env.AGT_ARTIFACTS === '1';
const ci = !!process.env.CI;

export default defineConfig({
  testDir: `projects/${t.project}/e2e`,
  testMatch: /.*\.spec\.mjs$/,
  // AGT_GREP="@smoke|@isolation" selects suites by tag (handy in CI and on Windows shells).
  ...(process.env.AGT_GREP ? { grep: new RegExp(process.env.AGT_GREP) } : {}),
  outputDir: 'reports/e2e/artifacts',
  timeout: 90_000,
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
    headless: process.env.AGT_HEADED !== '1',
    viewport: { width: 1400, height: 900 },
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    screenshot: artifacts ? 'only-on-failure' : 'off',
    video: 'off',
    trace: artifacts ? 'retain-on-failure' : 'off',
    ignoreHTTPSErrors: false,
    ...(process.env.AGT_CHANNEL ? { channel: process.env.AGT_CHANNEL } : {}),
  },
  projects: [{ name: `${t.project}-${t.envName}`, use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } } }],
  metadata: { project: t.project, environment: t.envName },
});
