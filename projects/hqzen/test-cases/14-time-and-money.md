# Time & money (schedules, timelogs, payroll)

- module: time-money
- prefix: TM
- source-paths: src/components/schedules/, src/pages/schedules/, src/store/timelog/, src/store/payroll/, src/store/timezone/, src/store/timezoneSchedule/, src/store/scheduled-tasks/, src/store/allowances/, src/store/task-summary/, src/router/printable/, src/router/internal/employment/
- legacy-markers: ADMIN_SCHTMP, ADMIN_ST_EI, ADMIN_PAY, ADMIN_PAY_EP, ADMIN_SCHTSK, ADMIN_SCHTSK_VIEW, WE_ADMIN_SCHTSK_VIEW, OE_S_B, TL_ARQ, TL_LOG, TL_ISS, MGR_ORQ, SVR_ORQ, PIS_ORG, PIT_ORG
- base-route: {ws}/administration/schedule-templates

Money is involved. Read-only checks are fine anywhere; anything that changes schedules or payroll runs only on `local`/`develop` with test partners.

### TM-001 · Schedule templates list, search, filter
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: {ws}/administration/schedule-templates
- destructive: no
- legacy: ADMIN_SCHTMP_00, ADMIN_SCHTMP_01, ADMIN_SCHTMP_03, ADMIN_SCHTMP_04, ADMIN_SCHTMP_07

**Steps:**
1. Open schedule templates; search; filter; open a template and search inside it.

**Expected:**
- Title `Schedule Templates - HQZen`; details list assigned partners.

### TM-002 · Create fixed, flexible and multi-schedule templates
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- route: {ws}/administration/create-schedule
- destructive: yes
- legacy: ADMIN_SCHTMP_09, ADMIN_SCHTMP_10, ADMIN_SCHTMP_11, ADMIN_SCHTMP_13

**Data:** names `{run} fixed`, `{run} flex`, `{run} multi`

**Steps:**
1. Create a fixed schedule (Mon–Fri 09:00–18:00, timezone Asia/Manila). Create a flexible one (8 h/day). Create one template with two schedules.
2. Try end time before start time; overlapping schedules.

**Expected:**
- Title `Create Schedule - HQZen`; saved templates show timezone; invalid inputs rejected.

### TM-003 · Custom break duration
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: OE_S_B_04

**Steps:**
1. Edit `{run} fixed` (`{ws}/administration/edit-schedule/:scheduleGroupId`), add a custom 45-min break.

**Expected:**
- Title `Edit Schedule - HQZen`; break saved and shown in total hours.

### TM-004 · Move partners between schedules; delete schedule
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: ADMIN_SCHTMP_05, ADMIN_SCHTMP_08

**Steps:**
1. Move a test partner from their schedule to `{run} fixed`, then back. Delete `{run} flex` and `{run} multi`.

**Expected:**
- Partner's schedule updates in their career page; deletion with assigned partners is blocked or asks to reassign.

### TM-005 · Scheduled tasks views
- priority: P1
- type: functional
- roles: org_exec, workforce_exec
- tags: regression
- route: {ws}/administration/scheduled-tasks
- destructive: yes
- legacy: ADMIN_SCHTSK_02, ADMIN_SCHTSK_VIEW_01, ADMIN_SCHTSK_VIEW_06, WE_ADMIN_SCHTSK_VIEW_01

**Steps:**
1. Search partners tab; open a partner's tasks; switch weekly ↔ daily; create a task `{run} task` for today and one for next week.

**Expected:**
- Titles `Scheduled Tasks - HQZen` / `Partner Scheduled Tasks - HQZen`; tasks appear on the right days.

**Cleanup:** Delete `{run}` tasks.

### TM-006 · Edit partner career rules and schedule
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: ADMIN_ST_EI_04, ADMIN_ST_EI_06

**Steps:**
1. On a test partner's employee information edit career rules and schedule; revert.

**Expected:**
- Changes persist then revert.

### TM-007 · Payrolls list and filter
- priority: P0
- type: functional
- roles: org_exec, payroll_supervisor
- tags: smoke, regression
- route: {ws}/administration/payrolls
- destructive: no
- legacy: ADMIN_PAY_00, ADMIN_PAY_01

**Steps:**
1. Open payrolls; filter by period/status.

**Expected:**
- Title `Payrolls - HQZen`; totals are numbers with currency.

### TM-008 · Payroll period details and CSV
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/administration/payrolls/employee-payrolls/:payroll_period_id
- destructive: no
- legacy: ADMIN_PAY_EP_00, ADMIN_PAY_EP_02

**Steps:**
1. Open a period; check one employee row; download CSV (ask the user before downloading, per your agent's download rules).

**Expected:**
- Title `Payroll Period - HQZen`; CSV rows count = table rows; totals match.

### TM-009 · Payroll blocked without permission
- priority: P0
- type: rbac
- roles: supervisor
- tags: smoke, rbac
- destructive: no

**Steps:**
1. As a supervisor **without** `can_view_payroll` open `{ws}/administration/payrolls`.

**Expected:**
- Access denied (guard `canViewPayrolls`).

### TM-010 · Employee timelog page
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression
- route: {ws}/career/:employment_id/timelog
- destructive: no

**Steps:**
1. Open timelog; open the current period's logs, payslip, activity and screenshots tabs.

**Expected:**
- Titles `Timelogs - HQZen`, `Payslip - HQZen`, `Activity - HQZen`, `Screenshots - HQZen`; times shown in the employee's timezone.

### TM-011 · File and review a timelog issue
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: TL_LOG_02, TL_LOG_03, TL_ISS_03

**Data:** reason = `{run} missed clock-in`

**Steps:**
1. From a log entry file a timelog issue. Open it.

**Expected:**
- Title `Timelog Issue - HQZen`; status pending; supervisor sees it (SM-006).

### TM-012 · File a schedule issue and cancel issues
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: TL_LOG_05, TL_ISS_06, TL_ISS_11

**Steps:**
1. File a schedule issue `{run}`. Cancel it. Cancel the timelog issue from TM-011 (if still pending and SM-006 isn't planned).

**Expected:**
- Cancelled issues show *cancelled* and can't be approved.

### TM-013 · Allowance request
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: TL_ARQ_03

**Steps:**
1. Request an allowance with amount and note `{run}`. Try negative and zero amounts.

**Expected:**
- Title `Allowance - HQZen`; valid request pending; invalid amounts rejected.

### TM-014 · Overtime requests
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: {ws}/career/:employment_id/overtime
- destructive: yes

**Steps:**
1. File an overtime request `{run}`.

**Expected:**
- Title `Overtime - HQZen`; listed as pending; supervisor sees it (SM-007).

### TM-015 · Payroll/schedule issue lists (exec)
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: no
- legacy: PIS_ORG_01, PIS_ORG_02, PIT_ORG_01, PIT_ORG_02

**Steps:**
1. Open executive schedule issues and timelog issues; filter pending; search a partner.

**Expected:**
- Lists filter correctly; `{run}` issues from this run appear.

### TM-016 · Printable payslip and leave
- priority: P2
- type: functional
- roles: employee
- route: /print-payslip/id/:payrollId/
- destructive: no

**Steps:**
1. From payslip click print (or open `/print-payslip/id/:payrollId/`). Same for a leave (`/print-leave/id/:leaveId/`).
2. Change `:payrollId` to another number.

**Expected:**
- Print layout renders (titles `Payslip - HQZEN`, `Leave Details - HQZEN`); someone else's payslip is **not** shown (else sev:S1).

### TM-017 · Timezone correctness
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: no

**Steps:**
1. Compare a timelog entry time with the same entry seen by org_exec whose account timezone differs (if available); compare with the browser timezone changed (emulate a different timezone).

**Expected:**
- Times are converted consistently; dates near midnight don't jump a day incorrectly.
