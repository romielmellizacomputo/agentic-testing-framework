#!/usr/bin/env node
// ADAPTER (Vue Router): builds inventory/routes.json + inventory/ROUTE_MAP.md by statically reading your router files.
// READ-ONLY on your app repo. Other stacks: write inventory/routes.json yourself or add an adapter
// ({"routes":[{"url":"/path/:id","name":"...","title":"...","area":"..."}]}).
//
//   node tools/adapters/vue-router-routes.mjs [--repo <path>] [--entry src/router/index.js] [--routes-var routes] [--alias source=src,@=src]
// Needs "acorn" resolvable from your app repo (most Vite/webpack projects have it) or installed here.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { loadEnv, projectPath } from '../lib/cases.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const repo = opt('repo', readEnv().APP_REPO);
const ENTRY = opt('entry', 'src/router/index.js');
const ROUTES_VAR = opt('routes-var', 'routes');
const ALIASES = Object.fromEntries(opt('alias', 'source=src,@=src').split(',').map(s => s.split('=')).filter(a => a.length === 2));
if (!repo || !fs.existsSync(repo)) {
  console.error(`App repo not found: ${repo}\nSet APP_REPO in config/env.json or pass --repo.`);
  process.exit(1);
}

// Borrow acorn from the app's node_modules (read-only), else from this repo.
let acorn;
try { acorn = createRequire(path.join(repo, 'package.json'))('acorn'); }
catch { try { acorn = createRequire(path.join(ROOT, 'package.json'))('acorn'); } catch { console.error('acorn not found: npm i -D acorn'); process.exit(1); } }

const SRC = path.join(repo, 'src');
const cache = new Map();

function readEnv() {
  return loadEnv();
}

function resolveImport(fromFile, spec) {
  let base;
  const alias = Object.keys(ALIASES).find(a => spec === a || spec.startsWith(a + '/'));
  if (alias) base = path.join(repo, ALIASES[alias], spec.slice(alias.length + 1));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const c of [base, `${base}.js`, path.join(base, 'index.js')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function parseFile(file) {
  if (cache.has(file)) return cache.get(file);
  const code = fs.readFileSync(file, 'utf8');
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true });
  const imports = {};
  const locals = {};
  let defaultExport = null;
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      for (const s of node.specifiers) {
        if (s.type === 'ImportDefaultSpecifier') imports[s.local.name] = node.source.value;
      }
    } else if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) if (d.id.type === 'Identifier' && d.init) locals[d.id.name] = d.init;
    } else if (node.type === 'ExportDefaultDeclaration') {
      defaultExport = node.declaration;
    }
  }
  const info = { file, imports, locals, defaultExport };
  cache.set(file, info);
  return info;
}

function prop(obj, key) {
  return obj.properties.find(p => p.type === 'Property' && (p.key.name === key || p.key.value === key));
}
function str(node) {
  if (!node) return null;
  if (node.type === 'Literal') return String(node.value);
  if (node.type === 'TemplateLiteral') return node.quasis.map(q => q.value.cooked).join('${}');
  return null;
}

// Turn an AST node (array / object / identifier) into a list of route records.
function collect(node, ctx, depth = 0) {
  if (!node || depth > 40) return [];
  if (node.type === 'ArrayExpression') {
    return node.elements.flatMap(el => {
      if (!el) return [];
      if (el.type === 'SpreadElement') return collect(el.argument, ctx, depth + 1);
      return collect(el, ctx, depth + 1);
    });
  }
  if (node.type === 'Identifier') {
    if (ctx.locals[node.name]) return collect(ctx.locals[node.name], ctx, depth + 1);
    const spec = ctx.imports[node.name];
    if (spec) {
      const target = resolveImport(ctx.file, spec);
      if (target) {
        const sub = parseFile(target);
        return collect(sub.defaultExport, sub, depth + 1);
      }
    }
    return [];
  }
  if (node.type === 'ObjectExpression') {
    const p = prop(node, 'path');
    if (!p) return [];
    const meta = prop(node, 'meta');
    const metaObj = meta && meta.value.type === 'ObjectExpression' ? meta.value : null;
    const flags = {};
    if (metaObj) {
      for (const mp of metaObj.properties) {
        if (mp.type === 'Property' && mp.value.type === 'Literal' && typeof mp.value.value === 'boolean') {
          flags[mp.key.name || mp.key.value] = mp.value.value;
        }
      }
    }
    const be = prop(node, 'beforeEnter');
    const comp = prop(node, 'component');
    let component = null;
    if (comp) {
      const m = fs.readFileSync(ctx.file, 'utf8').slice(comp.value.start, comp.value.end).match(/import\(\s*['"`]([^'"`]+)['"`]/);
      if (m) { const a = Object.keys(ALIASES).find(k => m[1].startsWith(k + '/')); component = a ? m[1].replace(a + '/', ALIASES[a] + '/') : m[1]; }
    }
    const children = prop(node, 'children');
    return [{
      path: str(p.value),
      name: str(prop(node, 'name')?.value),
      title: metaObj ? str(prop(metaObj, 'title')?.value) : null,
      guard: be ? (be.value.type === 'Identifier' ? be.value.name : 'inline') : null,
      redirect: !!prop(node, 'redirect'),
      component,
      flags,
      file: path.relative(repo, ctx.file).replace(/\\/g, '/'),
      children: children ? collect(children.value, ctx, depth + 1) : [],
    }];
  }
  return [];
}

function join(parent, child) {
  if (!child) return parent;
  if (child.startsWith('/')) return child;
  return `${parent.replace(/\/$/, '')}/${child}`.replace(/\/{2,}/g, '/');
}

function flatten(records, parent = '', parentGuards = [], out = []) {
  for (const r of records) {
    const full = join(parent, r.path) || '/';
    const guards = r.guard ? [...parentGuards, r.guard] : parentGuards;
    out.push({
      url: full, name: r.name, title: r.title, guards, redirect: r.redirect,
      component: r.component, flags: r.flags, file: r.file,
      area: areaOf(r.file),
    });
    flatten(r.children, full, guards, out);
  }
  return out;
}

function areaOf(file) {
  const m = file.match(/src\/router\/(?:(internal|external)\/)?([^/]+)/);
  if (!m) return 'root';
  if (m[2] === 'index.js') return m[1] || 'root';
  return m[2];
}

const entry = parseFile(path.join(repo, ENTRY));
const tree = collect(entry.locals[ROUTES_VAR] || entry.defaultExport, entry);
const flat = flatten(tree);

const outDir = projectPath('inventory');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify({ generatedAt: new Date().toISOString(), count: flat.length, routes: flat }, null, 2));

const byArea = {};
for (const r of flat) (byArea[r.area] ||= []).push(r);
let md = `# Route map\n\nGenerated ${new Date().toISOString()} from \`src/router\`. ${flat.length} routes.\n\n`;
md += `Regenerate with \`node tools/adapters/vue-router-routes.mjs\`. Do not edit by hand.\n\n`;
md += `\`:params\` must be filled with real IDs from the test session (runs/<runId>/context.json).\n\n`;
for (const area of Object.keys(byArea).sort()) {
  md += `## ${area}\n\n| URL | Route name | Page title | Guards |\n|---|---|---|---|\n`;
  for (const r of byArea[area]) {
    md += `| \`${r.url}\` | ${r.name || ''} | ${r.title || ''} | ${r.guards.join(', ')} |\n`;
  }
  md += '\n';
}
fs.writeFileSync(path.join(outDir, 'ROUTE_MAP.md'), md);
console.log(`Wrote ${flat.length} routes across ${Object.keys(byArea).length} areas to inventory/`);
