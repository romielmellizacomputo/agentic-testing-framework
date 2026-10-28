# Security & role-based access (cross-cutting)

- module: security
- prefix: SEC
- source-paths: src/router/, src/store/auth/, src/store/permissions/, src/lib/encryption/, src/lib/sileo/, src/lib/plex/, vite.config.js, index.html
- legacy-markers: security_tests
- base-route: /

Module-level RBAC cases live in each module (tag `rbac`). These cases sweep the whole app. Use `config/roles.md` as the truth table. Any data leak is sev:S1.

### SEC-001 · RBAC route sweep per role
- priority: P0
- type: rbac
- roles: employee, supervisor, manager, workforce_exec, applicant
- tags: smoke, rbac, sweep
- destructive: no
- legacy: test_security_tests

**Steps:**
1. Run `node tools/sweep-urls.mjs <runId> rbac --role <role>`; it writes `runs/<runId>/sweep-rbac-<role>.json` with every internal route, resolved with the IDs in context.json (it uses the org_exec IDs to probe pages the role should NOT reach).
2. For each route open it directly in a fresh tab as the role.
3. Compare with `config/roles.md`.

**Expected:**
- Every "N" route is denied. Record each mismatch as its own line in the note: `url | expected | actual`.

### SEC-002 · Anonymous sweep of internal routes
- priority: P0
- type: rbac
- roles: anonymous
- tags: smoke, rbac, sweep
- destructive: no

**Steps:**
1. Signed out, open every route from `inventory/ROUTE_MAP.md` that starts with `/company/`, `/personal`, `/home`, `/organization`, `/profile`, `/notifications`, `/scalema/` (fill IDs from context.json).

**Expected:**
- All redirect to sign-in / access denied; no internal data in page text or API responses with status 200.

### SEC-003 · Cross-company (tenant) isolation
- priority: P0
- type: security
- roles: other_company_exec, other_company_employee
- tags: smoke, rbac, security
- destructive: no

**Steps:**
1. As the other company's exec, open the test company's URLs with the test company's IDs: board, administration, partner details, payrolls, HR portal, a memo, a form response.

**Expected:**
- All denied. Also check API calls in network: any 200 response containing the test company's data = sev:S1.

### SEC-004 · ID tampering on detail pages
- priority: P1
- type: security
- roles: employee, supervisor
- tags: rbac, security
- destructive: no

**Steps:**
1. On 5 detail pages you legitimately see (leave, timelog issue, accountability, memo, contract) change the numeric id ±1 and to a random large id.

**Expected:**
- You never see a record that isn't yours/your team's; not-found or denied otherwise.

### SEC-005 · Stored XSS in common text fields
- priority: P1
- type: security
- roles: employee
- tags: security, nightly
- destructive: yes

**Data:** payload = `{run}<img src=x onerror=alert('AGT')>` and `{run}<script>alert('AGT')</script>`

**Steps:**
1. Put the payload into: card title, card comment, card description, personal goal, form answer, account nickname.
2. View each place, plus where it appears elsewhere (notifications, activity, search results).

**Expected:**
- No alert dialog ever appears; text is shown escaped or stripped. Any execution = sev:S1.

**Cleanup:** Remove every payload.

### SEC-006 · Secrets in the frontend bundle
- priority: P1
- type: security
- roles: anonymous
- tags: security
- destructive: no

**Steps:**
1. Open `/`. In devtools search loaded JS for `AMAZON_SECRET_ACCESS_KEY`, `AKIA`, `secret`, `password`.
2. Read the build config in the app repo (read-only) for hardcoded secret fallbacks.

**Expected:**
- No cloud secret keys in shipped JS.

### SEC-007 · Security headers
- priority: P2
- type: security
- roles: anonymous
- tags: security
- destructive: no

**Steps:**
1. Read the response headers of the HTML document and one API call.

**Expected:**
- HTTPS only (non-local); `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a `Content-Security-Policy` or `X-Frame-Options`. Note missing ones as sev:S3.

### SEC-008 · Session cookie / token storage
- priority: P2
- type: security
- roles: employee
- tags: security
- destructive: no

**Steps:**
1. After sign-in inspect cookies and localStorage/sessionStorage/IndexedDB keys (names only).

**Expected:**
- Session cookies `Secure` + `HttpOnly` where used; if a token is in localStorage, note it (sev:S3, risk with XSS). Do not record values.

### SEC-009 · File upload type enforcement
- priority: P2
- type: security
- roles: employee
- tags: security
- destructive: yes

**Data:** a text file renamed `agt.pdf`; an `.html` file with a script

**Steps:**
1. Upload both where files are accepted (card attachment, 201 files, resume).
2. Open the uploaded `.html` link.

**Expected:**
- Mismatched types rejected or served as download; HTML never renders as a page on the app's origin.

**Cleanup:** Delete uploads.

### SEC-010 · Logout invalidates API session
- priority: P2
- type: security
- roles: employee
- tags: security
- destructive: no

**Steps:**
1. Note one authenticated API request URL (no headers). Sign out. Replay the same URL in a new tab.

**Expected:**
- 401/403, not data.
