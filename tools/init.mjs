#!/usr/bin/env node
// First-time setup for the active project: creates its private config from the committed examples (never overwrites).
//   node tools/init.mjs                (active project)
//   AGT_PROJECT=myapp node tools/init.mjs
import fs from 'node:fs';
import { projectPath, activeProject } from './lib/cases.mjs';

const project = activeProject();
const pairs = [
  ['env.example.json', 'env.json'],
  ['accounts.example.json', 'accounts.local.json'],
];
for (const [from, to] of pairs) {
  const src = projectPath('config', from);
  const dst = projectPath('config', to);
  if (fs.existsSync(dst)) { console.log(`keep    projects/${project}/config/${to} (already exists)`); continue; }
  if (!fs.existsSync(src)) { console.log(`skip    projects/${project}/config/${from} not found`); continue; }
  fs.copyFileSync(src, dst);
  console.log(`created projects/${project}/config/${to}`);
}
console.log(`
Next (project "${project}"):
  1. projects/${project}/config/env.json           - real environment URLs (never production), login selectors.
  2. projects/${project}/config/accounts.local.json - TEST accounts per role, or AGT_ACCOUNT_<ROLE>_EMAIL/_PASSWORD env vars.
  3. Optional: projects/${project}/config/roles.md  - private copy of roles if they differ from roles.example.md.
These files are gitignored and blocked by tools/check-secrets.mjs. Check with: node tools/project.mjs status`);
