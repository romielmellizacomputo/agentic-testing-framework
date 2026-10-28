// Resolves which app and environment a scripted (Playwright) run targets, and enforces the host allowlist.
//
//   AGT_PROJECT  project folder under projects/ (default: active project, else demo)
//   AGT_ENV      environment name from the project's env file (default: its TARGET_ENV)
//
// SAFETY: only hosts in ALLOWED_HOSTS (plus AGT_EXTRA_ALLOWED_HOSTS, comma-separated) can be targeted.
// Production can never be added: anything without a develop/staging/local/demo marker is refused.
import { loadEnv, activeProject } from '../lib/cases.mjs';

export const ALLOWED_HOSTS = [
  'develop-hqzen.cxrole.com',
  'staging-hqzen.cxrole.com',
  'demo.playwright.dev',
  'localhost',
  '127.0.0.1',
];
const TEST_HOST = /(^|[.-])(develop|staging|dev|qa|test|local|demo)([.-]|$)|^localhost$|^127\.0\.0\.1$/i;

export function allowedHosts() {
  const extra = (process.env.AGT_EXTRA_ALLOWED_HOSTS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const h of extra) if (!TEST_HOST.test(h)) throw new Error(`AGT_EXTRA_ALLOWED_HOSTS: "${h}" does not look like a test host (needs develop/staging/dev/qa/test/local in the name).`);
  return new Set([...ALLOWED_HOSTS, ...extra]);
}

export function resolveTarget() {
  const project = process.env.AGT_PROJECT || activeProject();
  process.env.AGT_PROJECT = project;
  const env = loadEnv();
  const envName = process.env.AGT_ENV || env.TARGET_ENV;
  if ((env.NEVER_RUN_ON || []).includes(envName)) throw new Error(`Refusing to run against "${envName}".`);
  const url = env.ENVIRONMENTS?.[envName];
  if (!url) throw new Error(`Project "${project}" has no environment "${envName}". Known: ${Object.keys(env.ENVIRONMENTS || {}).join(', ')}`);
  const host = new URL(url).hostname.toLowerCase();
  if (!allowedHosts().has(host)) {
    throw new Error(`Host ${host} is not in the test-host allowlist (tools/e2e/targets.mjs). ` +
      'Add it with AGT_EXTRA_ALLOWED_HOSTS only if it is a test environment.');
  }
  // AGT_NO_ACCOUNTS=1 (workflow input) turns off anything that creates accounts or data.
  const allowDestructive = (env.ALLOW_DESTRUCTIVE_ON || []).includes(envName) && process.env.AGT_NO_ACCOUNTS !== '1';
  return { project, envName, baseURL: url.replace(/\/$/, ''), host, env, allowDestructive };
}
