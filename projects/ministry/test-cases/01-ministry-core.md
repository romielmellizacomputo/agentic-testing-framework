# Ministry / CentralBPO internal admin (ministry-vuejs)

- module: ministry
- prefix: MIN
- source-paths: src/components/, src/pages/, src/router/, src/store/
- legacy-markers: -
- base-route: /

Public pages, sign-in and core flows. Fresh accounts only; the standing approver comes from secrets.

### MIN-001 · Login page and wrong password
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /
- destructive: no

**Steps:**
1. Submit a wrong password.

**Expected:**
- Generic error; no account enumeration.

### MIN-002 · Dashboard loads
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /dashboard
- destructive: no

**Steps:**
1. Sign in and open the dashboard.

**Expected:**
- Widgets load; no 5xx.

### MIN-003 · Applicants list and search
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /applicants
- destructive: no

**Steps:**
1. Search for an AGT-created applicant.

**Expected:**
- Search filters results; detail opens.

### MIN-004 · Bookings and buildings
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /bookings
- destructive: no

**Steps:**
1. Open bookings and buildings; open one of each.

**Expected:**
- Lists and details load.

### MIN-005 · Company and client related pages
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /company-related
- destructive: no

**Steps:**
1. Open company-related and client-related pages.

**Expected:**
- Pages load; filters work.

### MIN-006 · HR admin accounts
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /hr-admin-accounts
- destructive: no

**Steps:**
1. Open HR admin accounts list.

**Expected:**
- List loads; no personal data beyond what the role allows.

### MIN-007 · Verification codes page is restricted
- priority: P1
- type: rbac
- roles: ministry_viewer
- tags: regression, rbac
- route: /verification-codes
- destructive: no

**Steps:**
1. As a non-admin open verification codes.

**Expected:**
- Denied (codes are sensitive). As admin: codes for AGT test accounts only are visible.

### MIN-008 · Ticketing
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /ticketing
- destructive: no

**Steps:**
1. Open tickets; filter by status.

**Expected:**
- Tickets load and filter.

### MIN-009 · Settings and tax codes (view only)
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /settings
- destructive: yes

**Steps:**
1. Open settings and tax codes; change nothing.

**Expected:**
- Pages render; no save happens.

**Cleanup:** Use `{run}`-named data and remove or revert it.

### MIN-010 · Trusted partners
- priority: P1
- type: functional
- roles: ministry_admin
- tags: regression
- route: /trusted-partners
- destructive: no

**Steps:**
1. Open trusted partners.

**Expected:**
- List loads.

### MIN-011 · Signed-out visitor cannot open internal pages
- priority: P1
- type: rbac
- roles: anonymous
- tags: regression, rbac
- route: /dashboard
- destructive: no

**Steps:**
1. Open dashboard, applicants, verification-codes signed out.

**Expected:**
- All redirect to login.
