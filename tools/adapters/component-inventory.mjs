#!/usr/bin/env node
// ADAPTER (any JS/TS front end): lists UI component files and whether a matching unit-test file exists.
// READ-ONLY on your app repo.
//
//   node tools/adapters/component-inventory.mjs [--repo <path>] [--src src] [--ext .vue,.tsx,.jsx,.svelte]
// Output: inventory/components.json and inventory/COMPONENTS.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const envPath = ['env.json', 'env.example.json'].map(f => path.join(ROOT, 'config', f)).find(f => fs.existsSync(f));
const env = envPath ? JSON.parse(fs.readFileSync(envPath, 'utf8')) : {};
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const repo = opt('repo', env.APP_REPO);
const SRC = opt('src', 'src');
const EXT = opt('ext', '.vue,.tsx,.jsx,.svelte').split(',');
if (!repo || !fs.existsSync(repo)) {
  console.error(`App repo not found: ${repo} (set APP_REPO or --repo)`);
  process.exit(1);
}

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', 'images', 'assets', 'public']);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(path.join(repo, SRC)).map(f => path.relative(repo, f).replace(/\\/g, '/'));
const specs = files.filter(f => /\.(spec|test)\.[cm]?[jt]sx?$/.test(f));
const specNames = new Set(specs.map(s => path.basename(s).replace(/\.(spec|test)\.[cm]?[jt]sx?$/, '')));
const vue = files.filter(f => EXT.some(e => f.endsWith(e)) && !/\.(spec|test)\./.test(f));

const routes = (() => {
  const p = path.join(ROOT, 'inventory', 'routes.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).routes : [];
})();
const pageToRoutes = {};
for (const r of routes) if (r.component) (pageToRoutes[r.component] ||= []).push(r.url);

const components = vue.map(f => {
  const name = path.basename(f).replace(/\.[^.]+$/, '');
  const parts = f.split('/');
  const kind = parts[1]; // components | pages
  const area = parts[2]?.endsWith('.vue') ? '(root)' : parts[2];
  return { file: f, name, kind, area, hasSpec: specNames.has(name), routes: pageToRoutes[f] || [] };
});

const byArea = {};
for (const c of components) {
  const key = `${c.kind}/${c.area}`;
  (byArea[key] ||= { total: 0, tested: 0, untested: [] });
  byArea[key].total++;
  if (c.hasSpec) byArea[key].tested++;
  else byArea[key].untested.push(c.name);
}

fs.mkdirSync(path.join(ROOT, 'inventory'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'inventory', 'components.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), total: components.length, specFiles: specs.length, components }, null, 2));

const tested = components.filter(c => c.hasSpec).length;
let md = `# Component inventory\n\nGenerated ${new Date().toISOString()}. Regenerate with \`node tools/adapters/component-inventory.mjs\`.\n\n`;
md += `- Component files: **${components.length}**\n- With a matching Jest spec: **${tested}** (${Math.round(100 * tested / components.length)}%)\n- Spec files in src: **${specs.length}**\n\n`;
md += `Use this to pick unit-test gaps (see playbooks/unit-test-gaps.md) and to know which components a UI test case touches.\n\n`;
md += `| Area | Files | With spec | Coverage |\n|---|---:|---:|---:|\n`;
const keys = Object.keys(byArea).sort((a, b) => byArea[b].total - byArea[a].total);
for (const k of keys) {
  const a = byArea[k];
  md += `| ${k} | ${a.total} | ${a.tested} | ${Math.round(100 * a.tested / a.total)}% |\n`;
}
md += `\n## Untested components by area\n\n`;
for (const k of keys) {
  const a = byArea[k];
  if (!a.untested.length) continue;
  md += `<details><summary>${k} — ${a.untested.length} untested</summary>\n\n${a.untested.sort().join(', ')}\n\n</details>\n\n`;
}
fs.writeFileSync(path.join(ROOT, 'inventory', 'COMPONENTS.md'), md);
console.log(`Inventoried ${components.length} components (${tested} with specs) in ${keys.length} areas.`);
