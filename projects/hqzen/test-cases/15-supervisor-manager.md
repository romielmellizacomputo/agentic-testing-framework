# Supervisor / manager / executive staff pages

- module: staff
- prefix: SM
- source-paths: src/components/supervisor-manager/, src/pages/supervisor-manager/, src/store/supervisor-manager/, src/store/staff/, src/store/accountabilities/, src/store/administrative-leave/, src/store/pcn/, src/store/issues/, src/router/internal/supervisor-manager/, src/router/internal/staff/
- legacy-markers: E_S, MGR_EL, SM_EL, MGR_IR, PD201_MRG, PD201_SUP, PDRDAF_M, PDRIR_M, LH_S, FC_S, FC_ORG, LR_S, LRDP_S, LR_ORG, LRD_ORG, A_M, A_S, MGR_ORQ, SVR_ORQ, MGR_TIT, SVR_TIT, MGR_SIT, PI_M, EP_ORG, EPD201_ORG, EPDIC_ORG, EPDP_ORG, DOCS_O, IR_ORG, RIR_ORG, OE_DAF, supervisor_manager_page
- base-route: {ws}/:role

`:role` is `executive`, `supervisor` or `manager`. Run each case as every role listed; the URL role must match yours (SM-001).

### SM-001 · Role in URL is rewritten to the real role
- priority: P0
- type: rbac
- roles: supervisor, manager
- tags: smoke, rbac
- route: {ws}/:role/partners
- destructive: no

**Steps:**
1. As supervisor open `{ws}/executive/partners`, then `{ws}/manager/partners`.
2. As manager open `{ws}/executive/partners`.

**Expected:**
- URL is replaced with your own role (`supervisor` / `manager`); data shown is your team's only, never the executive view.

### SM-002 · Partners list, search, date filter, export
- priority: P0
- type: functional
- roles: org_exec, manager, supervisor
- tags: smoke, regression
- route: {ws}/:role/partners
- destructive: no
- legacy: E_S_00, E_S_03, E_S_06, E_S_21, MGR_EL_03, MGR_EL_06, EP_ORG_01

**Steps:**
1. Open Partners. Search a partner. Use the date filter. Filter by department (exec). Export data (ask before downloading).

**Expected:**
- Title `Partners - HQZen`; supervisor/manager see only their people; export rows = table rows.

### SM-003 · Partner details tabs
- priority: P0
- type: functional
- roles: org_exec, supervisor
- tags: smoke, regression
- route: {ws}/:role/partners/details/:employment_id
- destructive: no
- legacy: E_S_12, E_S_18, EPDP_ORG_00, EPDIC_ORG_01, EPDIC_ORG_02, EPDIC_ORG_03, EPDIC_ORG_05, EPDIC_ORG_06, EPDIC_ORG_07, EPDIC_ORG_08

**Steps:**
1. Open a partner. Visit Information, Contracts (search; filter by date range, day, status active/inactive; open one), Payrolls, Reports, Leave history.

**Expected:**
- Title `Partner Details - HQZen`; each tab loads; filters work.
- Users without contract/compensation permission must not see those sections.

### SM-004 · 201 files
- priority: P1
- type: functional
- roles: org_exec, manager, supervisor
- tags: regression
- route: {ws}/:role/201-files
- destructive: yes
- legacy: DOCS_O_00, DOCS_O_01, DOCS_O_02, DOCS_O_03, DOCS_O_04, DOCS_O_05, DOCS_O_06, DOCS_O_08, EPD201_ORG_00, EPD201_ORG_03, PD201_SUP_00, PD201_SUP_03, PD201_SUP_06, PD201_MRG_03

**Steps:**
1. Filter by department, team, status; search a partner; open their document details; view a 201 file.
2. (exec only, test partner only) send a reminder email to that one partner.

**Expected:**
- Title `201 Files - HQZen`; viewer opens the document; email confirmation toast. Do **not** use "email all" except on `local`.

### SM-005 · Facial captures
- priority: P2
- type: functional
- roles: org_exec, supervisor
- destructive: no
- legacy: FC_ORG_00, FC_ORG_01, FC_ORG_02, FC_S_00, FC_S_01

**Steps:**
1. Open facial captures for a partner; filter by day, then by range.

**Expected:**
- Images load with timestamps; filter changes the set.

### SM-006 · Resolve / reject a timelog issue with comments
- priority: P0
- type: e2e
- roles: supervisor, manager
- tags: smoke, regression
- route: {ws}/:role/payroll
- destructive: yes
- legacy: SVR_TIT_03, SVR_TIT_08, SVR_TIT_09, SVR_TIT_11, SVR_TIT_21, MGR_TIT_03, MGR_TIT_08, MGR_TIT_09, MGR_TIT_11, MGR_TIT_21, MGR_SIT_02, PI_M_01
- depends: TM-011

**Steps:**
1. Open Payroll Issues; filter; open the `{run}` timelog issue (`…/payroll/timelog-issue/:issue_id`). Add a comment. Reject with a reason (or resolve).

**Expected:**
- Title `Payroll Issues - HQZen` / `Details - HQZen`; employee sees the comment and outcome; rejection reason visible to both.

### SM-007 · Overtime requests resolve/reject
- priority: P1
- type: e2e
- roles: supervisor, manager
- tags: regression
- destructive: yes
- legacy: SVR_ORQ_02, SVR_ORQ_07, SVR_ORQ_08, MGR_ORQ_07, MGR_ORQ_08, MGR_ORQ_09
- depends: TM-014

**Steps:**
1. Search overtime requests; view comments; reject the `{run}` request.

**Expected:**
- Status updates on both sides.

### SM-008 · Leave requests approve / reject
- priority: P0
- type: e2e
- roles: supervisor, org_exec
- tags: smoke, regression
- route: {ws}/:role/leaves
- destructive: yes
- legacy: LR_S_10, LR_S_11, LRDP_S_02, LRDP_S_03, LR_ORG_01, LR_ORG_10, LRD_ORG_00
- depends: CAR-003

**Steps:**
1. Filter leaves by status Pending; search; open the `{run}` leave (`…/leaves/details/:leave_id`); approve (or reject with reason).

**Expected:**
- Title `Leave Requests - HQZen`; status changes; employee's leave credits update after approval.

### SM-009 · Leave history of a partner
- priority: P2
- type: functional
- roles: supervisor
- destructive: no
- legacy: LH_S_00

**Steps:**
1. Open a partner's leave history.

**Expected:**
- Approved/rejected leaves with dates and types listed.

### SM-010 · File an incident report
- priority: P1
- type: functional
- roles: supervisor, manager
- tags: regression
- route: {ws}/:role/incident-reports
- destructive: yes
- legacy: SM_EL_08, MGR_IR_01, PDRIR_M_05, IR_ORG_01, IR_ORG_02, RIR_ORG_00

**Data:** description = `{run} incident` — **test partner only**

**Steps:**
1. File an incident report for the test employee choosing an offense from the policy. Open its details.

**Expected:**
- Title `Incident Reports - HQZen` / `Details - HQZen`; employee sees it in their career page (CAR-007).

### SM-011 · Disciplinary action form (DAF)
- priority: P2
- type: functional
- roles: org_exec, manager
- destructive: yes
- legacy: OE_DAF_01, OE_DAF_02, PDRDAF_M_00, PDRDAF_M_05
- depends: SM-010

**Steps:**
1. From the `{run}` incident create a DAF; open `…/disciplinary-action-form/:daf_id/details`.

**Expected:**
- Title `Disciplinary Actions - HQZen` / `Details - HQZen`; employee can view/acknowledge it.

### SM-012 · Accountabilities CRUD
- priority: P1
- type: functional
- roles: manager, supervisor
- tags: regression, crud
- route: {ws}/:role/accountabilities
- destructive: yes
- legacy: A_M_00, A_M_09, A_M_10, A_M_19, A_S_08, A_S_14

**Data:** item = `{run} laptop`

**Steps:**
1. Create an accountability for the test employee; add an item; edit it; update status; delete it.

**Expected:**
- Title `Accountabilities - HQZen`; employee sees and can acknowledge it (CAR-008) before deletion.

### SM-013 · Administrative leaves
- priority: P2
- type: functional
- roles: org_exec, manager
- route: {ws}/:role/administrative-leaves
- destructive: no

**Steps:**
1. Open administrative leaves list and one detail.

**Expected:**
- Title `Administrative Leaves - HQZen`; detail loads.

### SM-014 · Separations: resignation, clearance, forced termination
- priority: P2
- type: functional
- roles: org_exec, manager
- route: {ws}/:role/separations
- destructive: no

**Steps:**
1. Open separations; open a resignation, a clearance and a forced termination detail (existing data only — do not create).

**Expected:**
- Titles `Separations - HQZen`, `Resignation Details - HQZen`, `Clearance Details - HQZen`, `Forced Termmination Details - HQZen` (note the typo in the title → sev:S4 finding).

### SM-015 · PCN (personnel change notice) view
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/:role/partners/details/:employment_id/:pcn_id
- destructive: no

**Steps:**
1. Open a partner's PCN.

**Expected:**
- Title `View Partner PCN Details - HQZen`; changes listed old → new.

### SM-016 · Blocked partners list
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/:role/blocked-partners
- destructive: no

**Steps:**
1. Open blocked partners; open a detail.

**Expected:**
- Title `Blocked Partners - HQZen`; blocked_partner listed while blocked (ORG-016).

### SM-017 · Supervisor cannot see other teams' partners
- priority: P0
- type: rbac
- roles: supervisor
- tags: smoke, rbac, security
- destructive: no

**Steps:**
1. As org_exec copy the partner-details URL of someone **outside** the supervisor's team.
2. As supervisor open it.

**Expected:**
- Denied or empty; no salary, contracts or personal data shown (leak = sev:S1).

### SM-018 · Employee cannot open staff pages
- priority: P0
- type: rbac
- roles: employee
- tags: smoke, rbac
- destructive: no

**Steps:**
1. As employee open `{ws}/supervisor/partners`, `{ws}/manager/leaves`, `{ws}/executive/201-files`.

**Expected:**
- All denied.
