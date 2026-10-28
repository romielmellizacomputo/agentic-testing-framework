// Public pages of BPOSeats (bposeats.com). Runs only if the host is allowlisted (see tools/e2e/targets.mjs).
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';

const PAGES = [["/","Home"],["/offices","Offices"],["/buildings","Buildings"],["/bpo","BPO"],["/offshore","Offshore"],["/outsourcing","Outsourcing"],["/staffing","Staffing"],["/hiring","Hiring"],["/features","Features"],["/contact","Contact"],["/release-notes","Release notes"],["/terms-and-conditions","Terms"]];

test.describe('bposeats public pages @smoke', () => {
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
