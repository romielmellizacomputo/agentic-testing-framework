# Authentication & account access

- module: auth
- prefix: AUTH
- source-paths: src/components/auth/, src/pages/auth/, src/store/auth/, src/router/external/auth/, src/router/redirect/, src/lib/encryption/
- legacy-markers: login_page, security_tests
- base-route: /signin

Sign in, sign up funnels, password recovery, executive verification, session handling and the error pages (access denied, not found, link expired).

### AUTH-001 · Sign in with valid email and password
- priority: P0
- type: functional
- roles: org_exec, employee, applicant
- tags: smoke, regression
- route: /signin
- destructive: no
- legacy: test_login_page

**Preconditions:** Signed out, cookies cleared.

**Steps:**
1. Open `/signin`.
2. Enter the role's email and password. Click **Sign in**.

**Expected:**
- User lands on their default page (exec/employee: home or a board inside `{ws}`; applicant: personal/jobs area).
- Navbar shows the user's avatar/name.
- No error toast; no console errors.
- Page title changes from `Sign in - HQZen`.

### AUTH-002 · Sign in rejects a wrong password
- priority: P0
- type: negative
- roles: anonymous
- tags: smoke, regression
- route: /signin
- destructive: no

**Data:** email = org_exec email, password = `WrongPass!123`

**Steps:**
1. Open `/signin`, enter the data, click **Sign in**.

**Expected:**
- An error message says the credentials are invalid (it must not reveal whether the email exists).
- User stays on `/signin`; password field is cleared or still masked.
- No 5xx response.

### AUTH-003 · Sign in with an unknown email
- priority: P1
- type: negative
- roles: anonymous
- tags: regression
- route: /signin
- destructive: no

**Data:** email = `agt-nobody-{run}@example.com`, password = `Whatever!123`

**Steps:**
1. Submit the sign-in form with the data.

**Expected:**
- Same generic error as AUTH-002 (no user enumeration: wording must be identical).

### AUTH-004 · Sign-in form validation
- priority: P2
- type: validation
- roles: anonymous
- tags: regression
- route: /signin
- destructive: no

**Steps:**
1. Click **Sign in** with both fields empty.
2. Enter `not-an-email` as email and any password; submit.
3. Enter a valid email with an empty password; submit.

**Expected:**
- Each attempt shows an inline validation message; no request is sent for obviously invalid input, or the server error is shown cleanly.
- The button is not stuck in a loading state.

### AUTH-005 · Password field is masked and toggle works
- priority: P3
- type: ui
- roles: anonymous
- route: /signin
- destructive: no

**Steps:**
1. Type a password. 2. Click the show/hide (eye) icon if present, twice.

**Expected:**
- Password is masked by default; toggle reveals then hides it.

### AUTH-006 · Sign out ends the session
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- destructive: no
- legacy: SignoutFunctionalities

**Steps:**
1. Signed in, open the avatar menu → **Sign out**.
2. Press browser Back.
3. Paste a previously visited internal URL (e.g. the board URL) into the address bar.

**Expected:**
- After sign out you land on the landing or sign-in page.
- Back / pasted URL does not show internal data; you are sent to sign in or access denied.

### AUTH-007 · Session persists on reload and new tab
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: no

**Steps:**
1. Sign in. Reload the page.
2. Open the same URL in a new tab.

**Expected:**
- Still signed in in both tabs, same company/workforce selected.

### AUTH-008 · Deep link redirects to sign in and back
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/milestones
- destructive: no

**Steps:**
1. Signed out, open a deep internal URL (e.g. milestones page with real IDs from context.json).
2. Sign in when prompted.

**Expected:**
- You are asked to sign in (not shown a blank page or JS error).
- After signing in you end up on the requested page, or on home with no error (note which).

### AUTH-009 · Password reset request
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /password-reset
- destructive: no

**Data:** an allowed test email (from accounts.local.json `_allowed_email_domains`)

**Steps:**
1. From `/signin` click **Forgot password** (or open `/password-reset`).
2. Enter the email and submit.
3. Repeat with an unknown email.

**Expected:**
- Page title `Recover Your Account - HQZen`.
- A neutral confirmation ("if the account exists, we sent an email") for both emails.
- No 5xx.

### AUTH-010 · Password change page rejects missing/invalid token
- priority: P2
- type: security
- roles: anonymous
- route: /password-change
- destructive: no

**Steps:**
1. Open `/password-change` with no query string.
2. Open `/password-change?token=AGT-invalid-token`.

**Expected:**
- The page does not let you set a password without a valid token: it shows an error or redirects to `/link-expired`.

### AUTH-011 · Business sign-up funnel loads
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /signup/get-started
- destructive: no

**Steps:**
1. Open `/signup/get-started`, then `/signup/business/`, `/signup/ai-funnel`, `/signup/explore`, `/signup/hqzen`.
2. On each, check the form renders and required-field validation triggers when you click the primary button with empty fields.

**Expected:**
- Titles: `Get Started - HQZen`, `Business Sign Up - HQZen`, `Sign Up - HQZen`, `Explore - HQZen`, `Registration - HQZen`.
- No console errors; validation messages appear; nothing is submitted.

### AUTH-012 · Business sign-up end to end (creates a company)
- priority: P2
- type: e2e
- roles: anonymous
- tags: nightly
- route: /signup/business/
- destructive: yes

**Data:** email = `agt-{run}@example.com`, company = `{run} Co`

**Preconditions:** Only on `local` / `develop`. Ask a human before running on staging.

**Steps:**
1. Complete the business sign-up with the data.
2. Follow the verification step (open the disposable mail.tm inbox if the env delivers email; otherwise note "verification email not checked").

**Expected:**
- Account is created and the user reaches the new-business onboarding (allowed routes only: home-page, overview-page, profile, help center, account-information).
- Trying another internal URL redirects to the board/overview as the router guard defines.

**Cleanup:** Report the created company name in the note so a human can remove it.

### AUTH-013 · Executive verification page rejects bad links
- priority: P2
- type: security
- roles: anonymous
- route: /executive-verification
- destructive: no

**Steps:**
1. Open `/executive-verification` without parameters, then with a made-up token.

**Expected:**
- Title `Set Password - HQZen`. The form cannot be submitted successfully; an expired/invalid message or `/link-expired` is shown.

### AUTH-014 · Error pages render
- priority: P1
- type: ui
- roles: anonymous, employee
- tags: smoke
- destructive: no

**Steps:**
1. Open `/access-denied`, `/not-found`, `/404`, `/link-expired`, and `/agt-this-page-does-not-exist`.

**Expected:**
- Each shows a friendly page with a way back (home/sign-in link); no blank screen or stack trace.
- The unknown path renders the not-found page.

### AUTH-015 · Google sign-in redirect handler is safe
- priority: P2
- type: security
- roles: anonymous
- route: /google/authorized
- destructive: no

**Steps:**
1. Open `/google/authorized` with no params, then `/google/authorized?code=AGT&state=AGT`.

**Expected:**
- No crash; user is told sign-in failed or is sent to `/signin`. No token or error dump is displayed.

### AUTH-016 · Open-redirect check on /redirect
- priority: P1
- type: security
- roles: org_exec
- tags: rbac
- route: /redirect
- destructive: no

**Steps:**
1. Signed in, open `/redirect?next=https://example.com`, `/redirect?url=https://example.com`, `/redirect?to=//example.com`.

**Expected:**
- The app never navigates to `example.com`. It stays on an HQZen host. (Leaving to an external host = sev:S1.)

### AUTH-017 · Locked user cannot use the app
- priority: P1
- type: rbac
- roles: blocked_partner
- tags: rbac
- destructive: no
- depends: ORG-016

**Preconditions:** The blocked_partner account is currently blocked (see ORG-016).

**Steps:**
1. Sign in as blocked_partner. Try to open their board and career pages.

**Expected:**
- Board routes show access denied (router checks `is_locked`). A message explains the account is blocked and how to request unblocking.

### AUTH-018 · Brute-force protection
- priority: P2
- type: security
- roles: anonymous
- tags: security
- destructive: no

**Data:** the `non_exec` email with wrong passwords

**Steps:**
1. Submit 8 wrong passwords in a row for the same email.

**Expected:**
- After several attempts the app throttles, shows a CAPTCHA, or locks temporarily. If nothing changes after 8 attempts, record `fail` sev:S3 with note "no throttling observed". Do not exceed 8 attempts.

**Cleanup:** Sign in once with the correct password to confirm the account is not permanently locked; if it is, tell a human.
