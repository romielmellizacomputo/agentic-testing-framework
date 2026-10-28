// Public pages: no account needed. Agentic cases: PUB-001, PUB-005, PUB-006, AUTH-014.
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';

test.describe('public site @smoke', () => {
  test('PUB-001 landing page loads with working images', async ({ page, health }) => {
    await gotoAndSettle(page, '/');
    await expect(page).toHaveTitle(/HQZen/);
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
    const broken = await page.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth === 0 && i.src).length);
    expect(broken, 'broken images on landing').toBe(0);
    health.assertClean();
  });

  test('PUB-005 jobs portal lists postings and handles an empty search', async ({ page, health }) => {
    await gotoAndSettle(page, '/jobs');
    await expect(page).toHaveTitle(/Job Postings/);
    const details = page.getByRole('button', { name: /view details/i });
    await expect(details.first()).toBeVisible();
    const search = page.getByPlaceholder(/search for a company or job/i);
    await search.fill('zzqqxx-no-such-job');
    await search.press('Enter');
    await expect(page.getByText(/no results found/i)).toBeVisible();
    health.assertClean();
  });

  test('PUB-006 Apply now while signed out asks the visitor to create an account', async ({ page }) => {
    await gotoAndSettle(page, '/jobs');
    // "View details" calls window.open(); capture the URL it opens and load it in this tab.
    await page.evaluate(() => { window.__agtOpened = null; window.open = u => { window.__agtOpened = String(u); return null; }; });
    await page.getByRole('button', { name: /view details/i }).first().click();
    await expect.poll(() => page.evaluate(() => window.__agtOpened)).toBeTruthy();
    const jobUrl = await page.evaluate(() => window.__agtOpened);
    expect(jobUrl).toMatch(/\/jobs\/job-post\/\d+/);
    await gotoAndSettle(page, jobUrl);
    await page.getByRole('button', { name: /apply now/i }).first().click();
    const modal = page.locator('.modal:visible').first();
    await expect(modal).toContainText(/set up your account/i);
    await expect(modal.getByPlaceholder('Enter email address')).toBeVisible();
  });

  for (const path of ['/access-denied', '/not-found', '/404', '/link-expired', '/agt-no-such-page']) {
    test(`AUTH-014 error page renders: ${path}`, async ({ page }) => {
      await gotoAndSettle(page, path);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.getByRole('button', { name: /go to home/i }).or(page.getByRole('link', { name: /home|sign in/i })).first()).toBeVisible();
    });
  }
});
