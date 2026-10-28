// What a fresh workforce executive does first: boards and cards. Agentic cases: BOARD-001, BOARD-002, BOARD-012.
import { test, expect, gotoAndSettle } from '../../../tools/e2e/fixtures.mjs';
import { createBusinessExec, signIn } from './support/accounts.mjs';
import { ws } from './support/checks.mjs';

test.describe.serial('executive workflows @regression', () => {
  let A;

  test.beforeAll(async ({ browser }, testInfo) => {
    const { resolveTarget } = await import('../../../tools/e2e/targets.mjs');
    test.skip(!resolveTarget().allowDestructive, 'creating data is not allowed on this environment');
    testInfo.setTimeout(180_000);
    A = await createBusinessExec(browser, 'flow');
  });

  test('BOARD-002 create a board with the default columns', async ({ page, runTag, health }) => {
    await signIn(page, A);
    await gotoAndSettle(page, `${ws(A.companyId, A.workforceId)}/board/-1`);
    const name = `${runTag} board`;
    const newBoard = page.getByRole('button', { name: /new board/i });
    await newBoard.waitFor();
    test.skip(await newBoard.isDisabled(), 'New board is disabled for unverified business accounts; needs email verification (docs/DEV-REQUESTS.md)');
    await newBoard.click();
    const modal = page.locator('[class*=modal]:visible').first();
    await modal.getByPlaceholder('Enter a board name').fill(name);
    await modal.getByRole('button', { name: 'Create' }).click();
    await page.waitForURL(/\/board\/\d+$/);
    await page.reload();
    await expect(page.getByText(name).filter({ visible: true }).first()).toBeVisible();
    for (const col of ['Important', 'To Do', 'Doing', 'For Review', 'Done']) await expect(page.getByText(col, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    health.assertClean();
  });

  test('BOARD-012 create a card and it persists after reload', async ({ page, runTag, health }) => {
    await signIn(page, A);
    await gotoAndSettle(page, `${ws(A.companyId, A.workforceId)}/board/-1`);
    const title = `${runTag} card`;
    // The "+" next to the "To Do" column title. Unverified business accounts don't get it.
    const add = page.locator('button.iconic.rounded.primary:visible').first();
    const hasAdd = await add.waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
    test.skip(!hasAdd || await add.isDisabled(), 'Add card is not available to unverified business accounts; needs email verification (docs/DEV-REQUESTS.md)');
    await add.click();
    await page.keyboard.type(title);
    await page.keyboard.press('Enter');
    await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
    health.assertClean();
  });
});
