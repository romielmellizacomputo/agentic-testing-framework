// HQZen account factory: creates FRESH accounts through the product's own sign-up flows,
// so tests never depend on (or expose) existing people's accounts.
//
//   createBusinessExec(browser)   Business sign-up -> new user + new workforce in the test company,
//                                 user is that workforce's executive. No email needed (works today).
//   createApplicant(browser, job) Job "Apply now" sign-up -> applicant. Needs email delivery to a
//                                 disposable inbox (set AGT_EMAIL_DELIVERY=1 once develop/staging deliver
//                                 to the mail.tm domain). Otherwise the calling test is skipped.
//   signIn(page, creds)           UI sign-in (works for fresh accounts and the approver).
//
// Every created name carries the run tag (AGT-xxxx) so data is easy to find and clean up.
// Credentials of created accounts live only in memory for the duration of the run.
import { createInbox, strongPassword, waitForMessage, extractLink, extractCode } from '../../../../tools/lib/mailbox.mjs';
import { RUN_TAG, lettersOnly, gotoAndSettle } from '../../../../tools/e2e/fixtures.mjs';

export const EMAIL_DELIVERY = process.env.AGT_EMAIL_DELIVERY === '1';

export async function signIn(page, { email, password }) {
  await page.context().clearCookies();
  await gotoAndSettle(page, '/signin');
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ } });
  await gotoAndSettle(page, '/signin');
  await page.locator('#username').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(u => !u.pathname.startsWith('/signin'), { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
}

export async function signOut(page) {
  await page.context().clearCookies();
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ } });
}

// Reads ids from the signed-in user's Vue store (no network calls of our own).
export async function sessionInfo(page) {
  return page.evaluate(() => {
    const s = document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store;
    const up = s?.state?.auth?.user?.user_profile || {};
    const m = location.pathname.match(/company\/(\d+)\/workforce\/(\d+)/);
    return {
      userId: s?.state?.auth?.user?.pk ?? null,
      companyId: up.company?.pk ?? (m ? Number(m[1]) : null),
      workforceIds: up.workforce_ids || [],
      isOrgExec: !!up.is_organizational_exec,
      isWorkforceExec: !!up.is_workforce_exec,
      verified: !!up.is_fully_verified,
      urlCompanyId: m ? Number(m[1]) : null,
      urlWorkforceId: m ? Number(m[2]) : null,
    };
  });
}

// Business sign-up: returns { email, password, company, workforceId, companyId, boardPath }
export async function createBusinessExec(browser, label = 'exec') {
  const box = await createInbox(`agt${label.replace(/[^a-z]/gi, '').slice(0, 6).toLowerCase()}`);
  const password = strongPassword();
  const company = `${RUN_TAG} ${label} ${lettersOnly(4)}`;
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await gotoAndSettle(page, '/signup/business/');
    await page.locator('.form-title').first().click();
    await page.keyboard.type(company);
    await page.getByPlaceholder('Enter first name').fill('Agt');
    await page.getByPlaceholder('Enter last name').fill(`Tester${lettersOnly(5)}`);
    await page.getByPlaceholder('Enter email address').fill(box.address);
    const pw = page.getByPlaceholder(/Enter password/);
    await pw.nth(0).fill(password);
    await pw.nth(1).fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByText('We sent you an email').waitFor({ timeout: 60000 });

    // Account is usable before email verification: sign in and read the new workforce.
    await signIn(page, { email: box.address, password });
    const info = await sessionInfo(page);
    return {
      email: box.address, password, inbox: box, company,
      companyId: info.urlCompanyId ?? info.companyId,
      workforceId: info.urlWorkforceId ?? info.workforceIds[0] ?? null,
      landingPath: new URL(page.url()).pathname,
    };
  } finally {
    await context.close();
  }
}

// Applicant via a public job posting. Requires email delivery (see EMAIL_DELIVERY).
export async function createApplicant(browser, jobPath, { resumePath } = {}) {
  if (!EMAIL_DELIVERY) throw new Error('Email delivery to disposable inboxes is not enabled (AGT_EMAIL_DELIVERY=1).');
  const box = await createInbox('agtapp');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await gotoAndSettle(page, jobPath);
    await page.getByRole('button', { name: /apply now/i }).first().click();
    const modal = page.locator('.modal:visible').first();
    await modal.getByPlaceholder('Enter first name').fill('Agt');
    await modal.getByPlaceholder('Enter last name').fill(`Applicant${lettersOnly(5)}`);
    await modal.getByPlaceholder('Enter email address').fill(box.address);
    await modal.getByRole('button', { name: 'Next' }).click();
    if (resumePath) await page.locator('.modal:visible input[type=file]').first().setInputFiles(resumePath);
    await page.locator('.modal:visible').getByRole('button', { name: 'Submit' }).click();
    const mail = await waitForMessage(box, { timeoutMs: 180000 });
    return { email: box.address, inbox: box, link: extractLink(mail, /password|verify|token|signup/i), code: extractCode(mail) };
  } finally {
    await context.close();
  }
}
