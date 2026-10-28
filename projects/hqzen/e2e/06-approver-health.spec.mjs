// The approver's key pages load without NEW server errors (known ones are annotated, not failed).
// Agentic cases: HOME-001, HOME-004, QUAL-001, HR-001, NAV-003.
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';
import { signIn, sessionInfo } from './support/accounts.mjs';
import { DENIED_PATH } from './support/checks.mjs';

test.describe.serial('approver page health @regression @health', () => {
  let ids;
  test.beforeEach(async ({ approver }) => { test.skip(!approver, 'approver secret not configured'); });

  test('approver home loads', async ({ page, approver, health }) => {
    await signIn(page, approver);
    await gotoAndSettle(page, '/home/home-page');
    await expect(page).toHaveTitle(/Home - HQZen/);
    const info = await sessionInfo(page);
    ids = { company: info.companyId, workforce: info.workforceIds[0] };
    health.assertClean();
  });

  const pages = [
    ['milestones', '/milestones'], ['forms', '/forms'], ['recruitment', '/recruitment'],
    ['administration', '/administration/'], ['departments', '/administration/departments'],
    ['schedule templates', '/administration/schedule-templates'], ['payrolls', '/administration/payrolls'],
    ['partners', '/executive/partners'], ['tags', '/tags/'], ['shared board', '/workforce-board'],
  ];
  for (const [name, sub] of pages) {
    test(`approver opens ${name} without new server errors`, async ({ page, approver, health }) => {
      test.skip(!ids?.workforce, 'no workforce id from the approver session');
      await signIn(page, approver);
      await gotoAndSettle(page, `/company/${ids.company}/workforce/${ids.workforce}${sub}`);
      expect(new URL(page.url()).pathname).not.toMatch(DENIED_PATH);
      health.assertClean();
    });
  }
});
