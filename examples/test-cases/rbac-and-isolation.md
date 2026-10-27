# Permissions and data isolation (template)

- module: security
- prefix: SEC
- source-paths: src/router/, src/auth/, src/permissions/
- legacy-markers: -
- base-route: /

Sweeps the whole app per role. `config/roles.md` is the truth table. Any leak of another user's or tenant's data is sev:S1.

### SEC-001 · Direct-URL sweep per role
- priority: P0
- type: rbac
- roles: member, manager, viewer
- tags: smoke, rbac, sweep
- destructive: no

**Steps:**
1. Sign in as admin once and save its IDs in `runs/<runId>/context.json`.
2. `node tools/sweep-urls.mjs <runId> rbac --role <role>` and open every URL as the role.
3. Compare each result with `config/roles.md`.

**Expected:**
- Every `N` cell is denied in the UI **and** the related API calls return 401/403/404. Record mismatches as `url | expected | actual`.

### SEC-002 · Signed-out sweep
- priority: P0
- type: rbac
- roles: anonymous
- tags: smoke, rbac, sweep
- destructive: no

**Steps:**
1. Signed out, open every non-public route (filled with admin IDs).

**Expected:**
- All redirect to login or show access denied; no data rendered; APIs return 401/403.

### SEC-003 · Tenant isolation
- priority: P0
- type: security
- roles: other_tenant_user
- tags: smoke, rbac, security
- destructive: no

**Steps:**
1. As a user of another tenant, open the test tenant's URLs (dashboards, settings, people, a record detail).

**Expected:**
- All denied; no API response with status 200 contains the test tenant's data.

### SEC-004 · Scoped-role check (role in one group, regular user in another)
- priority: P0
- type: security
- roles: manager
- tags: rbac, security
- destructive: no

**Preconditions:** A test account that has an elevated role in group A but is a regular member in group B.

**Steps:**
1. Open group B's admin/staff pages directly.

**Expected:**
- Denied. Elevated rights from group A must not apply in group B (a global "is manager anywhere" check is a common bug).

### SEC-005 · ID tampering on detail pages
- priority: P1
- type: security
- roles: member
- tags: rbac, security
- destructive: no

**Steps:**
1. On 5 detail pages you legitimately see, change the numeric/uuid ID to a neighbour's and to a random value.

**Expected:**
- You never see a record that isn't yours; not-found or denied otherwise.

### SEC-006 · Stored XSS in text fields
- priority: P1
- type: security
- roles: member
- tags: security, nightly
- destructive: yes

**Data:** `{run}<img src=x onerror=alert(1)>`

**Steps:**
1. Put the payload into names, titles, comments and descriptions; view every place it is displayed.

**Expected:**
- No script runs anywhere. Execution = sev:S1.

**Cleanup:** Remove every payload.

### SEC-007 · Secrets in the shipped front end
- priority: P1
- type: security
- roles: anonymous
- tags: security
- destructive: no

**Steps:**
1. Search the loaded JavaScript for key patterns (`AKIA`, `sk_live_`, `-----BEGIN`, `secret`).

**Expected:**
- No server-side secrets in client code. Found = sev:S1 and rotate the key (do not copy its value into the report).
