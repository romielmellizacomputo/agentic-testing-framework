// Public pages of Scalema (scalema.com). Runs only if the host is allowlisted (see tools/e2e/targets.mjs).
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';

const PAGES = [["/","Home"],["/about","About"],["/business","Business"],["/faqs","FAQs"],["/privacy-policy","Privacy policy"],["/terms-and-conditions","Terms"],["/data-retention-policy","Data retention"]];

test.describe('scalema public pages @smoke', () => {
  for (const [path, name] of PAGES) {
    test(`${name} (${path}) loads without server errors`, async ({ page, health }) => {
      await gotoAndSettle(page, path);
      await expect(page.locator('body')).not.toBeEmpty();
      const broken = await page.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth === 0 && i.src).length);
      expect(broken, 'broken images').toBe(0);
      health.assertClean();
    });
  }
});
