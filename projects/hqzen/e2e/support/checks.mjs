import { expect, gotoAndSettle } from '../../../../tools/e2e/fixtures.mjs';

export const DENIED_PATH = /\/(access-denied|404|not-found|signin)(\/|$|\?)/;
export const DENIED_TEXT = /access denied|you do not have permission|page you requested is not available|sign in to your account/i;

// Opens `path` and asserts the user is kept out: redirected to a denied/sign-in page or shown a denial message.
export async function expectDenied(page, path, why = '') {
  await gotoAndSettle(page, path);
  await page.waitForTimeout(1500); // route guards resolve after the first render
  const finalPath = new URL(page.url()).pathname;
  const head = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 600); // pages embed extra <body> frames
  // The router also keeps users out by sending them back to their OWN workforce.
  const wanted = path.match(/\/workforce\/(\d+)/)?.[1];
  const landed = finalPath.match(/\/workforce\/(\d+)/)?.[1];
  const bouncedToOwnWorkforce = !!(wanted && landed && wanted !== landed);
  const denied = DENIED_PATH.test(finalPath) || DENIED_TEXT.test(head) || bouncedToOwnWorkforce;
  expect(denied, `expected ${path} to be denied${why ? ` (${why})` : ''}, but it opened at ${finalPath}`).toBe(true);
}

export async function expectOpens(page, path, { title } = {}) {
  await gotoAndSettle(page, path);
  await page.waitForTimeout(1000);
  const finalPath = new URL(page.url()).pathname;
  expect(finalPath, `expected ${path} to open`).not.toMatch(DENIED_PATH);
  if (title) await expect(page).toHaveTitle(title);
}

export const ws = (companyId, workforceId) => `/company/${companyId}/workforce/${workforceId}`;
