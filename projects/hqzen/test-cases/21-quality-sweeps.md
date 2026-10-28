# Quality sweeps (console, network, titles, responsive, accessibility, performance)

- module: quality
- prefix: QUAL
- source-paths: src/components/_generics/, src/stylesheets/, src/mixins/, src/directives/, src/composables/, src/pages/root/, index.html, vite.config.js, package.json
- legacy-markers: –
- base-route: /

Sweeps walk many pages at once using `inventory/ROUTE_MAP.md`. They catch the bugs nobody wrote a case for. Use `node tools/sweep-urls.mjs <runId> pages --role <role>` to get the resolved URL list (`runs/<runId>/sweep-pages-<role>.json`).

### QUAL-001 · Console & network error sweep
- priority: P0
- type: ui
- roles: org_exec, employee
- tags: smoke, sweep, nightly
- destructive: no

**Steps:**
1. For each URL in `sweep-pages-<role>.json`: open it, wait for idle, record console errors and failed requests (status ≥ 400 or network error).

**Expected:**
- Zero uncaught errors and zero 5xx across the sweep (ignore `protocol/known-noise.md`). Note: `url | error | count`.

### QUAL-002 · Page title sweep
- priority: P2
- type: ui
- roles: org_exec
- tags: sweep, nightly
- destructive: no

**Steps:**
1. During QUAL-001, compare `document.title` with the route title in `inventory/routes.json`.

**Expected:**
- They match. Empty titles (e.g. `/personal/ticket-tracker`) and typos (`Forced Termmination`) are sev:S4 findings.

### QUAL-003 · Responsive sweep (mobile)
- priority: P1
- type: ui
- roles: employee
- tags: responsive, nightly
- destructive: no

**Steps:**
1. At 375×812 open the 15 most used pages: home, personal board, a board, card details, forms, leaves, timelog, payslip, notifications, profile, account info, memorandums, accountabilities, jobs, landing.

**Expected:**
- No horizontal scroll; navigation reachable; modals fit the screen; buttons at least ~40 px tall.

### QUAL-004 · Accessibility basics
- priority: P2
- type: a11y
- roles: anonymous, employee
- tags: a11y, nightly
- destructive: no

**Steps:**
1. On sign-in, landing, board, card details, create form, leave request form: tab through the page with keyboard only; read the accessibility tree.

**Expected:**
- Every input has a label; buttons have names; focus visible and in a logical order; modals trap focus and close with Esc; images have alt text. Note each issue with page + element.

### QUAL-005 · Performance budget
- priority: P2
- type: performance
- roles: org_exec
- tags: performance, nightly
- destructive: no

**Steps:**
1. For landing, sign-in, home, main board, recruitment, payrolls: hard reload and read Navigation Timing (`performance.getEntriesByType('navigation')`) and LCP if available. Note JS transferred.

**Expected:**
- Landing LCP < 2.5 s, internal pages usable < 4 s on the test env. Record numbers in the note even on pass — trends matter.

### QUAL-006 · Empty, loading and error states
- priority: P2
- type: ui
- roles: other_company_employee
- tags: nightly
- destructive: no

**Steps:**
1. With a near-empty account open lists (boards, forms, leaves, memos, notifications).

**Expected:**
- Friendly empty states, not blank areas or spinners forever.

### QUAL-007 · Double-submit protection
- priority: P2
- type: functional
- roles: employee
- tags: nightly
- destructive: yes

**Steps:**
1. On create-card, file leave, submit form: double-click the submit button quickly.

**Expected:**
- Exactly one record created.

**Cleanup:** Remove `{run}` records.

### QUAL-008 · Long text and special characters
- priority: P3
- type: validation
- roles: employee
- tags: nightly
- destructive: yes

**Data:** 300-character title; `Ñoño 漢字 😀 "quotes" & <amp>`

**Steps:**
1. Use the data as card title, comment and memo search.

**Expected:**
- Saved and displayed correctly; long text truncates with ellipsis, layout intact.

**Cleanup:** Remove `{run}` records.
