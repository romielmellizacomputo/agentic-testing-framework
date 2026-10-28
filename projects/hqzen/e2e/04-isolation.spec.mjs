// Cross-workforce isolation with two FRESH executives (A and B) plus the approver.
// Agentic cases: SEC-001, SEC-003, BOARD-029, ADM-020, SM-018 (scoped-role leak area).
// Accounts are created once per worker; each check is independent so one failure doesn't hide the others.
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';
import { createBusinessExec, signIn } from './support/accounts.mjs';
import { expectDenied, expectOpens, ws } from './support/checks.mjs';

let A; let B; let boardA;

test.describe('workforce isolation @security @isolation', () => {
  test.beforeAll(async ({ browser }, testInfo) => {
    const { resolveTarget } = await import('../../../tools/e2e/targets.mjs');
    test.skip(!resolveTarget().allowDestructive, 'creating accounts is not allowed on this environment');
    testInfo.setTimeout(300_000);
    if (A && B && boardA) return;
    A = await createBusinessExec(browser, 'isoa');
    B = await createBusinessExec(browser, 'isob');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await signIn(page, A);
    await gotoAndSettle(page, `${ws(A.companyId, A.workforceId)}/board/-1`);
    boardA = new URL(page.url()).pathname;
    await ctx.close();
  });

  test('A opens its own workforce board and departments', async ({ page }) => {
    expect(boardA).toMatch(/\/board\/\d+$/);
    await signIn(page, A);
    await expectOpens(page, boardA);
    await expectOpens(page, `${ws(A.companyId, A.workforceId)}/administration/departments`);
  });

  for (const [name, sub] of [
    ['board', null],
    ['administration', '/administration/'],
    ['departments', '/administration/departments'],
    ['payrolls', '/administration/payrolls'],
    ['executive partners', '/executive/partners'],
    ['executive 201 files', '/executive/201-files'],
    ['recruitment', '/recruitment'],
    ['forms', '/forms'],
  ]) {
    test(`B (exec of another workforce) is denied A's ${name}`, async ({ page }) => {
      await signIn(page, B);
      await expectDenied(page, sub ? `${ws(A.companyId, A.workforceId)}${sub}` : boardA, 'B is not a member of workforce A');
    });
  }

  test('signed-out visitor is denied A\'s workforce pages', async ({ page }) => {
    await expectDenied(page, boardA, 'signed out');
    await expectDenied(page, `${ws(A.companyId, A.workforceId)}/administration/departments`, 'signed out');
  });

  test('approver (org executive) can oversee A\'s new workforce', async ({ page, approver }) => {
    test.skip(!approver, 'approver secret not configured');
    await signIn(page, approver);
    await expectOpens(page, `${ws(A.companyId, A.workforceId)}/administration/`);
    await expectOpens(page, `${ws(A.companyId, A.workforceId)}/executive/partners`);
  });
});
