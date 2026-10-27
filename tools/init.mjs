#!/usr/bin/env node
// First-time setup: creates your private config files from the committed examples (never overwrites).
//   node tools/init.mjs
import fs from 'node:fs';
import { P } from './lib/cases.mjs';

const pairs = [
  ['config/env.example.json', 'config/env.json'],
  ['config/accounts.example.json', 'config/accounts.local.json'],
  ['config/roles.example.md', 'config/roles.md'],
];
for (const [from, to] of pairs) {
  if (fs.existsSync(P(to))) { console.log(`keep    ${to} (already exists)`); continue; }
  fs.copyFileSync(P(from), P(to));
  console.log(`created ${to}`);
}
console.log(`
Next:
  1. Edit config/env.json      - your app's environments (never production), login selectors, route aliases.
  2. Edit config/accounts.local.json - TEST accounts per role (or use AGT_ACCOUNT_<ROLE>_EMAIL/_PASSWORD env vars).
  3. Edit config/roles.md      - your roles and who may access what.
  4. Copy examples/test-cases/*.md into test-cases/ and adapt them, then: node tools/validate-cases.mjs
These files are gitignored; keep them out of commits.`);
