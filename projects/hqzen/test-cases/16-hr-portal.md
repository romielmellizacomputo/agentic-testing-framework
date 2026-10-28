# HR portal

- module: hr-portal
- prefix: HR
- source-paths: src/components/hr-portal/, src/pages/hr-portal/, src/store/hr-portal/, src/router/internal/hr-portal/
- legacy-markers: HRPLC_HR, HRPLR_HR, HRPLD_HR, HRPAccIU_HR, HRPAccR_HR
- base-route: /company/:company_id/hr-portal

### HR-001 · HR portal access
- priority: P0
- type: rbac
- roles: hr_admin, org_exec, employee
- tags: smoke, rbac
- route: /company/:company_id/hr-portal
- destructive: no

**Steps:**
1. Open the HR portal URL.

**Expected:**
- hr_admin and org_exec: title `HR Portal - HQZen`, content loads. employee: denied.

### HR-002 · Leave credits tab
- priority: P1
- type: functional
- roles: hr_admin
- tags: regression
- destructive: no
- legacy: HRPLC_HR_00, HRPLC_HR_01, HRPLC_HR_02, HRPLC_HR_04, HRPLC_HR_05, HRPLC_HR_06, HRPLC_HR_07, HRPLC_HR_08, HRPLC_HR_09

**Steps:**
1. Leaves → Leave Credits. Search partner; sort Partner column; expand a row; filter by workforce, department, team; filter last-edited by day and by range.

**Expected:**
- Each control changes the table correctly; clearing filters restores it.

### HR-003 · Leave requests tab: sort, filter, paginate
- priority: P1
- type: functional
- roles: hr_admin
- tags: regression
- destructive: no
- legacy: HRPLR_HR_00, HRPLR_HR_02, HRPLR_HR_03, HRPLR_HR_04, HRPLR_HR_05, HRPLR_HR_06, HRPLR_HR_07, HRPLR_HR_08, HRPLR_HR_09, HRPLR_HR_10, HRPLR_HR_11, HRPLR_HR_12, HRPLR_HR_15, HRPLR_HR_16, HRPLR_HR_17, HRPLR_HR_18

**Steps:**
1. Leave Requests tab. Search. Sort each column (Partner, Date Filed, Type, Category, Duration, Starting Date) asc/desc. Filter by workforce/department/team and each status (Pending, Approved, Rejected, Cancelled). Go to page 2 and back.

**Expected:**
- Sorting is correct for dates and text; status filter shows only that status; pagination keeps filters.

### HR-004 · Leave request details: approve, reject, signature, archive
- priority: P0
- type: e2e
- roles: hr_admin
- tags: smoke, regression
- destructive: yes
- legacy: HRPLD_HR_00, HRPLD_HR_01, HRPLD_HR_02, HRPLD_HR_04, HRPLD_HR_05, HRPLD_HR_09
- depends: CAR-003

**Steps:**
1. Open the `{run}` pending leave. Approve it; view the signature; archive. For a second `{run}` leave reject then archive.

**Expected:**
- Statuses and archive state persist; signature image renders.

### HR-005 · Accountabilities in use
- priority: P1
- type: functional
- roles: hr_admin
- tags: regression
- destructive: yes
- legacy: HRPAccIU_HR_00, HRPAccIU_HR_01, HRPAccIU_HR_02, HRPAccIU_HR_03, HRPAccIU_HR_04, HRPAccIU_HR_06, HRPAccIU_HR_07, HRPAccIU_HR_08, HRPAccIU_HR_09, HRPAccIU_HR_13, HRPAccIU_HR_14, HRPAccIU_HR_19

**Steps:**
1. Accountabilities → In Use. Check the pending counter; select a career policy; search; sort Items, Quantity, Total Price, Date Taken; paginate; filter In Use and Overdue; delete a `{run}` accountability.

**Expected:**
- Counter equals rows with pending status; numeric sorts are numeric (10 after 9); delete asks for confirmation.

### HR-006 · Accountabilities returned
- priority: P2
- type: functional
- roles: hr_admin
- destructive: no
- legacy: HRPAccR_HR_01

**Steps:**
1. Returned tab; select workforce.

**Expected:**
- Only returned items shown.

### HR-007 · HR sees partner details only within permission
- priority: P1
- type: rbac
- roles: hr_admin
- tags: rbac, regression
- destructive: no

**Steps:**
1. From the HR portal open a partner's details with an HR account that lacks contract/compensation permissions.

**Expected:**
- Contract and compensation sections hidden; API responses don't include salary fields.
