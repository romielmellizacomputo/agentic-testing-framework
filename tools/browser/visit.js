// Snippet for run.mjs: visit a list of paths and report per page.
// Paths come from env AGT_PATHS (JSON array) — set by tools/browser/visit.mjs.
const paths = JSON.parse(process.env.AGT_PATHS || '[]');
const out = [];
for (const p of paths) {
  const errs = []; const failed = [];
  const onC = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); };
  const onE = e => errs.push('pageerror: ' + String(e.message).slice(0, 160));
  const onR = r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().replace(/[?#].*/, '').replace(/^https:\/\/[^/]+/, '').slice(0, 110)); };
  page.on('console', onC); page.on('pageerror', onE); page.on('response', onR);
  const t0 = Date.now();
  let status = 'ok';
  try {
    await page.goto(base + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { status = 'slow-network'; });
    await sleep(800);
  } catch (e) { status = 'nav-error: ' + String(e.message).slice(0, 80); }
  const text = await page.innerText('body').catch(() => '');
  const finalPath = new URL(page.url()).pathname;
  out.push({
    path: p, final: finalPath === p.replace(/\?.*/, '') ? '=' : finalPath, title: await page.title(), ms: Date.now() - t0, status,
    denied: /access denied|page not found|not found|404/i.test(text.slice(0, 400)) || /access-denied|not-found|404/.test(finalPath),
    bad: [...new Set(text.match(/\bundefined\b|\bNaN\b|\[object Object\]|\{\{/g) || [])],
    spinners: await page.locator('[class*=skeleton],[class*=spinner],[class*=loader]').count().catch(() => 0),
    head: text.replace(/\s+/g, ' ').slice(0, Number(process.env.AGT_HEAD || 160)),
    failed: [...new Set(failed)], errors: [...new Set(errs)].slice(0, 5),
  });
  page.off('console', onC); page.off('pageerror', onE); page.off('response', onR);
}
return out;
