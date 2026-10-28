#!/usr/bin/env node
// Installs a git pre-commit hook that runs the secret scanner and the test-case validator.
//   node tools/install-hooks.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/cases.mjs';

const hooks = path.join(ROOT, '.git', 'hooks');
if (!fs.existsSync(hooks)) { console.error('Not a git repository (no .git/hooks). Run "git init" first.'); process.exit(1); }
const hook = path.join(hooks, 'pre-commit');
fs.writeFileSync(hook, `#!/bin/sh
# Installed by tools/install-hooks.mjs
node tools/check-secrets.mjs || exit 1
node tools/validate-cases.mjs --all || exit 1
`);
fs.chmodSync(hook, 0o755);
console.log('Installed .git/hooks/pre-commit (secret scan + test-case validation).');
