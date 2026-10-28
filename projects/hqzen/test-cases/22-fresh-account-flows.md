# Fresh-account flows (no existing users)

- module: fresh-accounts
- prefix: ACC
- source-paths: src/pages/auth/signup/, src/components/auth/signup/, src/store/auth/, src/store/business-signup/
- legacy-markers: -
- base-route: /signup/business/

Every flow here starts from accounts created during the run, so nothing depends on (or exposes) existing people's accounts. The only standing account is the **approver** (org executive), whose credentials come from secrets. Scripted versions live in `projects/hqzen/e2e/03-account-factory.spec.mjs` and `04-isolation.spec.mjs`.

### ACC-001 · Business sign-up creates a new executive and workforce
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, accounts
- route: /signup/business/
- destructive: yes

**Data:** company = `{run} factory`, email = a fresh mail.tm inbox, strong random password

**Steps:**
1. Open `/signup/business/`. Type the company name in the title field, fill first name, last name (letters only), email and both passwords. Click **Sign Up**.
2. Sign in with the new email and password.

**Expected:**
- "We sent you an email" confirmation appears.
- Sign-in works before verification and lands on a board inside a new workforce named after the company.
- The user is a workforce executive of exactly one workforce and not an organizational executive.

**Cleanup:** Workforce names carry `{run}`; list them in run notes for periodic clean-up.

### ACC-002 · Unverified business account limits
- priority: P1
- type: functional
- roles: anonymous
- tags: regression, accounts
- destructive: yes
- depends: ACC-001

**Steps:**
1. As the fresh executive, open the board, administration, recruitment and forms of the new workforce.
2. Try **New board**.

**Expected:**
- Pages of the own workforce open.
- Record which actions are disabled until verification (today: New board). Each disabled action is listed in `docs/DEV-REQUESTS.md`.

**Cleanup:** None.

### ACC-003 · Verification email reaches a disposable inbox
- priority: P1
- type: e2e
- roles: anonymous
- tags: regression, email
- destructive: yes
- depends: ACC-001

**Steps:**
1. Poll the fresh inbox for up to 3 minutes; open the verification link.

**Expected:**
- The email arrives and the link verifies the account (`is_fully_verified` true). Today develop does not deliver to disposable domains — keep `blocked` with that note.

### ACC-004 · Two fresh executives are isolated from each other
- priority: P0
- type: security
- roles: anonymous
- tags: smoke, rbac, security, isolation
- destructive: yes

**Steps:**
1. Create executives A and B (ACC-001 twice).
2. As B, open A's board, administration, departments, payrolls, executive partners, executive 201 files, recruitment and forms by URL.

**Expected:**
- Every page is denied for B (access-denied / not-found) and no A data is rendered. Any page that opens is sev:S1.

**Cleanup:** None.

### ACC-005 · Approver can oversee a fresh workforce
- priority: P1
- type: rbac
- roles: org_exec
- tags: regression, rbac
- destructive: no
- depends: ACC-001

**Steps:**
1. As the approver, open the fresh workforce's administration and executive partners pages.

**Expected:**
- Both open (the approver is an organizational executive of the test company).

### ACC-006 · Approver promotes a fresh executive (org-level invite)
- priority: P2
- type: e2e
- roles: org_exec
- tags: regression, approver
- destructive: yes
- depends: ACC-001

**Steps:**
1. As the approver open Organization → Executives and invite the fresh executive's (disposable) email as organizational executive.
2. As the fresh executive accept (needs email delivery), then open `/organization/executives`.

**Expected:**
- Invite listed as pending; after acceptance the fresh executive can open organization pages.

**Cleanup:** Revoke the invite / remove the promotion.

### ACC-007 · Applicant through a public job posting
- priority: P1
- type: e2e
- roles: anonymous
- tags: regression, email
- destructive: yes

**Steps:**
1. Open a job posting, **Apply now**, fill step 1 with a fresh inbox, step 2 with a test PDF resume and location, submit.
2. Set the password from the emailed link.

**Expected:**
- Application submitted; the applicant can sign in and sees the application. Needs email delivery (blocked on develop today).
