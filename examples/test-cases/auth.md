# Authentication (template)

- module: auth
- prefix: AUTH
- source-paths: src/auth/, src/pages/login/
- legacy-markers: -
- base-route: /login

Copy into `test-cases/` and adjust routes, labels and roles to your app. Uses roles from `config/roles.example.md`.

### AUTH-001 · Sign in with valid credentials
- priority: P0
- type: functional
- roles: admin, member
- tags: smoke, regression
- route: /login
- destructive: no

**Steps:**
1. Open the login page, enter the role's test credentials, submit.

**Expected:**
- Lands on the role's default page; the user menu shows they are signed in; no console errors.

### AUTH-002 · Wrong password is rejected without revealing whether the account exists
- priority: P0
- type: negative
- roles: anonymous
- tags: smoke, security
- route: /login
- destructive: no

**Data:** a real test email with a wrong password; then an unknown email `nobody-{run}@example.com`

**Steps:**
1. Submit each combination.

**Expected:**
- Both show the **same** generic error message (different messages allow account enumeration, sev:S3).
- The user stays on the login page; no 5xx.

### AUTH-003 · Sign out ends the session
- priority: P0
- type: security
- roles: member
- tags: smoke, security
- destructive: no

**Steps:**
1. Sign out. Press Back. Paste a previously visited private URL.

**Expected:**
- No private data is shown; you are sent to the login page; authenticated API calls return 401/403.

### AUTH-004 · Brute-force protection
- priority: P2
- type: security
- roles: anonymous
- tags: security
- destructive: no

**Steps:**
1. Submit 8 wrong passwords for one dedicated test account. Do not exceed 8.

**Expected:**
- Throttling, CAPTCHA or temporary lock appears. No change after 8 attempts = sev:S3.

**Cleanup:** Sign in once correctly to confirm the account is not permanently locked.

### AUTH-005 · Password reset does not leak account existence
- priority: P1
- type: security
- roles: anonymous
- tags: regression, security
- route: /forgot-password
- destructive: no

**Steps:**
1. Request a reset for a test email and for `nobody-{run}@example.com`.

**Expected:**
- The same neutral confirmation for both.

### AUTH-006 · Open-redirect check
- priority: P1
- type: security
- roles: member
- tags: security
- destructive: no

**Steps:**
1. Try the app's redirect/next parameters with `https://example.com` and `//example.com` (e.g. `/login?next=...`).

**Expected:**
- The app never navigates off its own host (leaving = sev:S1).
