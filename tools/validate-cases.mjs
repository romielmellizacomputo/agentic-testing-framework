#!/usr/bin/env node
// Checks every test case file for format errors. Exit code 1 on errors.
// Usage: node tools/validate-cases.mjs
import fs from 'node:fs';
import { loadModules, PRIORITIES, TYPES, roleNames, readJSON, P, expandRoute } from './lib/cases.mjs';

const roles = new Set(roleNames());
const routes = readJSON(P('inventory', 'routes.json'), { routes: [] }).routes.map(r => r.url);
const routeSet = new Set(routes);
const errors = [];
const warnings = [];
const ids = new Map();
const modules = loadModules();
const prefixes = new Map();

for (const m of modules) {
  const where = m.file;
  if (!m.module) errors.push(`${where}: missing "- module:" header`);
  if (!m.prefix) errors.push(`${where}: missing "- prefix:" header`);
  if (prefixes.has(m.prefix)) errors.push(`${where}: prefix ${m.prefix} also used in ${prefixes.get(m.prefix)}`);
  prefixes.set(m.prefix, where);
  if (!m.sourcePaths.length) warnings.push(`${where}: no source-paths (diff-based planning can't select it)`);
  for (const c of m.cases) {
    if (c.parseError) { errors.push(`${where}: ${c.parseError}`); continue; }
    const at = `${where} ${c.id}`;
    if (ids.has(c.id)) errors.push(`${at}: duplicate id (also in ${ids.get(c.id)})`);
    ids.set(c.id, where);
    if (!c.id.startsWith(`${m.prefix}-`)) errors.push(`${at}: id should start with ${m.prefix}-`);
    if (!PRIORITIES.includes(c.priority)) errors.push(`${at}: priority "${c.priority}" not in ${PRIORITIES}`);
    if (!TYPES.includes(c.type)) errors.push(`${at}: type "${c.type}" not in ${TYPES}`);
    if (!c.roles.length) errors.push(`${at}: no roles`);
    for (const r of c.roles) if (!roles.has(r)) errors.push(`${at}: unknown role "${r}" (see config/roles.md)`);
    if (!['yes', 'no'].includes(c.destructiveRaw)) errors.push(`${at}: destructive must be yes/no`);
    if (!c.steps) errors.push(`${at}: missing **Steps:**`);
    if (!c.expected) errors.push(`${at}: missing **Expected:**`);
    // A destructive case should leave no trace: a Cleanup section, {run}-named data, or steps that undo themselves.
    const selfCleaning = /\{run\}|revert|remove|delete|revoke|cancel|undo|back again|test partner/i.test(`${c.data}${c.steps}${c.preconditions}`);
    if (c.destructive && !c.cleanup && !selfCleaning && c.type !== 'e2e')
      warnings.push(`${at}: destructive without Cleanup, {run} data, or undo steps`);
    if (c.route && routes.length) {
      const full = expandRoute(c.route);
      if (!routeSet.has(full) && !routeSet.has(full.replace(/\/$/, '')) && !routeSet.has(`${full}/`))
        warnings.push(`${at}: route not in inventory/routes.json: ${c.route}`);
    }
  }
}
for (const m of modules) for (const c of m.cases) for (const d of c.depends || [])
  if (!ids.has(d)) errors.push(`${m.file} ${c.id}: depends on unknown case ${d}`);

for (const s of fs.readdirSync(P('suites')).filter(f => f.endsWith('.json'))) {
  const suite = readJSON(P('suites', s));
  for (const id of suite.select?.ids || []) if (!ids.has(id)) errors.push(`suites/${s}: unknown id ${id}`);
}

const total = [...ids.keys()].length;
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${modules.length} modules, ${total} cases, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
