#!/usr/bin/env node
// Manage the apps under test. Each lives in projects/<name>/.
//
//   node tools/project.mjs list              # all projects, the active one marked with *
//   node tools/project.mjs use <name>        # make <name> active (writes .agt-project, gitignored)
//   node tools/project.mjs new <name>        # scaffold projects/<name>/ from projects/_template/
//   node tools/project.mjs status            # what the active project has configured (no secrets shown)
//
// You can also pick a project per command: AGT_PROJECT=<name> node tools/... or plan-run.mjs --project <name>.
import fs from 'node:fs';
import path from 'node:path';
import { P, listProjects, activeProject, readJSON, loadAccounts, loadEnv, roleNames, projectPath } from './lib/cases.mjs';

const [cmd = 'list', name] = process.argv.slice(2);
const valid = n => /^[a-z0-9][a-z0-9_-]*$/.test(n || '');

if (cmd === 'list') {
  let active = null; try { active = activeProject(); } catch { /* none */ }
  for (const p of listProjects()) {
    const n = fs.readdirSync(P('projects', p, 'test-cases')).filter(f => f.endsWith('.md') && !f.startsWith('_')).length;
    console.log(`${p === active ? '*' : ' '} ${p.padEnd(20)} ${n} module file(s)`);
  }
} else if (cmd === 'use') {
  if (!valid(name) || !fs.existsSync(P('projects', name))) { console.error(`Unknown project "${name}". Known: ${listProjects().join(', ')}`); process.exit(1); }
  fs.writeFileSync(P('.agt-project'), `${name}\n`);
  console.log(`Active project: ${name}`);
} else if (cmd === 'new') {
  if (!valid(name)) { console.error('Project names: lowercase letters, digits, - and _.'); process.exit(1); }
  const dest = P('projects', name);
  if (fs.existsSync(dest)) { console.error(`projects/${name} already exists.`); process.exit(1); }
  fs.cpSync(P('projects', '_template'), dest, { recursive: true });
  const envEx = path.join(dest, 'config', 'env.example.json');
  const env = readJSON(envEx, {});
  env.APP_NAME = name;
  fs.writeFileSync(envEx, `${JSON.stringify(env, null, 2)}\n`);
  console.log(`Created projects/${name}/. Next:
  node tools/project.mjs use ${name}
  node tools/init.mjs           # private config for this project (gitignored)
  then write test cases in projects/${name}/test-cases/ (see _TEMPLATE.md).`);
} else if (cmd === 'status') {
  const p = activeProject();
  const env = loadEnv();
  const acc = loadAccounts();
  const roles = roleNames();
  const has = f => fs.existsSync(projectPath('config', f));
  console.log(`Project: ${p}
  private env.json        ${has('env.json') ? 'yes' : 'no (using env.example.json)'}
  environments            ${Object.keys(env.ENVIRONMENTS).join(', ') || '(none)'}   target: ${env.TARGET_ENV}
  roles                   ${roles.length}
  accounts configured     ${roles.filter(r => acc[r]?.email && acc[r]?.password).join(', ') || '(none)'}
  accounts missing        ${roles.filter(r => r !== 'anonymous' && !(acc[r]?.email && acc[r]?.password)).join(', ') || '(none)'}
  route inventory         ${fs.existsSync(projectPath('inventory', 'routes.json')) ? 'yes' : 'no'}`);
} else {
  console.error('Usage: node tools/project.mjs list | use <name> | new <name> | status');
  process.exit(1);
}
