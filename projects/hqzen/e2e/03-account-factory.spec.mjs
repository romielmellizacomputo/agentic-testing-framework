// Fresh accounts through the product's own sign-up. Agentic cases: AUTH-011, AUTH-012, ACC-001, ACC-002.
import { test, expect } from '../../../tools/e2e/fixtures.mjs';
import { createBusinessExec, signIn, sessionInfo, EMAIL_DELIVERY } from './support/accounts.mjs';

test.describe.serial('account factory @smoke @accounts', () => {
  let exec;

  test('ACC-001 business sign-up creates a new executive and workforce (no email needed)', async ({ browser, target }) => {
    test.skip(!target.allowDestructive, `creating accounts is not allowed on ${target.envName}`);
    exec = await createBusinessExec(browser, 'factory');
    expect(exec.workforceId, 'new workforce id').toBeTruthy();
    expect(exec.landingPath).toMatch(/\/company\/\d+\/workforce\/\d+\//);
  });

  test('ACC-002 the new executive signs in again and owns only the new workforce', async ({ page, health }) => {
    test.skip(!exec, 'ACC-001 did not create an account');
    await signIn(page, exec);
    const info = await sessionInfo(page);
    expect(info.isWorkforceExec).toBe(true);
    expect(info.isOrgExec).toBe(false);
    expect(info.workforceIds).toEqual([exec.workforceId]);
    await expect(page.getByText(exec.company).first()).toBeVisible();
    health.assertClean();
  });

  test('ACC-003 verification email reaches the disposable inbox @email', async () => {
    test.skip(!exec, 'ACC-001 did not create an account');
    test.skip(!EMAIL_DELIVERY, 'email delivery to disposable inboxes not enabled on this environment (AGT_EMAIL_DELIVERY=1)');
    const { waitForMessage } = await import('../../../tools/lib/mailbox.mjs');
    const mail = await waitForMessage(exec.inbox, { timeoutMs: 180000 });
    expect(mail.subject).toBeTruthy();
  });
});
