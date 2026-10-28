# Career page (employee self-service) & acknowledgements

- module: career
- prefix: CAR
- source-paths: src/components/employment/, src/pages/employment/, src/store/employment/, src/store/contract/, src/router/internal/employment/, src/components/acknowledgements/, src/pages/acknowledgements/, src/router/internal/acknowledgements/, src/pages/memorandums/, src/router/internal/memorandums/
- legacy-markers: L_PTNR, MEMO_PTNR, ACCT_PTNR, EMP_ACT
- base-route: {ws}/career/:employment_id

### CAR-001 · Career page and about
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression
- route: {ws}/career/:employment_id
- destructive: no

**Steps:**
1. Open the career page and the About tab.

**Expected:**
- Titles `Career - HQZen`, `About career - HQZen`; position, start date, policy shown.

### CAR-002 · Own 201 files
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/career/:employment_id/201-files
- destructive: yes

**Steps:**
1. Open 201 files; upload a test PDF to a requirement; view it.

**Expected:**
- Upload shows in the list with status pending review.

**Cleanup:** Delete the uploaded test PDF if the UI allows; otherwise note the requirement in the run notes.

### CAR-003 · File a leave request
- priority: P0
- type: e2e
- roles: employee
- tags: smoke, regression
- route: {ws}/career/:employment_id/leaves
- destructive: yes
- legacy: L_PTNR_00, L_PTNR_15

**Data:** reason = `{run} leave`, a date 2+ weeks ahead

**Steps:**
1. Open Leaves. File a leave with the data. Try: date in the past, end before start, more days than credits.

**Expected:**
- Title `Leaves - HQZen`; valid leave pending; invalid inputs rejected with clear messages; credits shown.

### CAR-004 · Cancel a leave request
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: L_PTNR_27

**Steps:**
1. File a second `{run}` leave and cancel it from its details page.

**Expected:**
- Title `Leave Details - HQZen`; status *cancelled*; supervisor can no longer approve it.

### CAR-005 · Leave history
- priority: P2
- type: functional
- roles: employee
- route: {ws}/career/:employment_id/leave-history
- destructive: no

**Steps:**
1. Open leave history.

**Expected:**
- Title `Leave History - HQZen`; this run's leaves listed.

### CAR-006 · Memorandums: view, search, filter, acknowledge
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/career/:employment_id/memorandums
- destructive: yes
- legacy: MEMO_PTNR_00, MEMO_PTNR_02, MEMO_PTNR_03, MEMO_PTNR_08
- depends: ORG-009

**Steps:**
1. Search for `{run} memo`; filter; open it; acknowledge.

**Expected:**
- Acknowledged state persists; org_exec sees the acknowledgement.

### CAR-007 · Incident reports and disciplinary actions (view)
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/career/:employment_id/incident-reports
- destructive: no
- depends: SM-010

**Steps:**
1. Open incident reports; open `{run} incident`. Open disciplinary actions.

**Expected:**
- Titles `Incident Reports - HQZen`, `Incident Report Details - HQZen`, `Disciplinary Actions - HQZen`.

### CAR-008 · Accountabilities: list, search, filter, acknowledge
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/career/:employment_id/accountabilities
- destructive: yes
- legacy: ACCT_PTNR_00, ACCT_PTNR_01, ACCT_PTNR_03, ACCT_PTNR_09, EMP_ACT_01, EMP_ACT_04
- depends: SM-012

**Steps:**
1. Search; filter; acknowledge `{run} laptop`.

**Expected:**
- Status *acknowledged*; supervisor sees it.

### CAR-009 · Personnel change notices
- priority: P2
- type: functional
- roles: employee
- route: {ws}/career/:employment_id/personnel-change-notices
- destructive: no

**Steps:**
1. Open PCNs.

**Expected:**
- Title `Personnel Change Notices - HQZen`; list or empty state.

### CAR-010 · Acknowledgements (document & signatory)
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/acknowledgements
- destructive: yes

**Steps:**
1. Open Acknowledgements; open a pending one; view document and signatory tabs; sign/acknowledge.

**Expected:**
- Title `Acknowledgements - HQZen`; signed state persists.

**Cleanup:** Only sign acknowledgements created for this run (e.g. `{run} memo`); never sign real company documents.

### CAR-011 · Workforce memorandums page
- priority: P2
- type: functional
- roles: employee
- route: {ws}/memorandums/
- destructive: no

**Steps:**
1. Open `{ws}/memorandums/` and one memo.

**Expected:**
- Title `Memorandums - HQZen` / `Memorandum - HQZen`.

### CAR-012 · Cannot open another employee's career page
- priority: P0
- type: rbac
- roles: employee
- tags: smoke, rbac, security
- destructive: no

**Steps:**
1. Change `:employment_id` in your career URL to a colleague's id (get it from org_exec's partner list) — try `/timelog`, `/leaves`, `/accountabilities`.

**Expected:**
- Denied; no data of the other person (leak = sev:S1).
