// Sign-in, sign-out and signed-out access. Agentic cases: AUTH-001, AUTH-002, AUTH-003, AUTH-006, SEC-002.
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';
import { signIn, signOut } from './support/accounts.mjs';
import { expectDenied } from './support/checks.mjs';

test.describe('authentication @smoke', () => {
  test('AUTH-002 wrong password shows a generic error and stays on sign-in', async ({ page, runTag }) => {
    await gotoAndSettle(page, '/signin');
    await page.locator('#username').fill(`${runTag.toLowerCase()}-nobody@example.com`);
    await page.locator('#password').fill('Definitely-Wrong-1!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/wrong username or password|invalid username/i)).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });

  test('AUTH-001 approver can sign in and sign out', async ({ page, approver, health }) => {
    test.skip(!approver, 'approver secret not configured (AGT_APPROVER_EMAIL / AGT_APPROVER_PASSWORD)');
    await signIn(page, approver);
    await expect(page).not.toHaveURL(/\/signin/);
    health.assertClean();
    await signOut(page);
    await expectDenied(page, '/home/home-page', 'signed out');
  });

  for (const path of ['/home/home-page', '/personal/personal-board', '/profile/user-profile', '/notifications', '/organization/career-policies']) {
    test(`SEC-002 signed-out visitor is sent to sign-in: ${path}`, async ({ page }) => {
      await expectDenied(page, path, 'not signed in');
    });
  }
});
