# Administration (workforce-level)

- module: administration
- prefix: ADM
- source-paths: src/router/internal/admin/, src/components/department/, src/components/employers/, src/pages/employers/, src/store/departments/, src/store/teams/, src/store/workforce/, src/store/template/, src/store/platform-settings/, src/store/staff-configuration/, src/store/exit-interviews/, src/store/permissions/, src/store/payment-dues/, src/store/onboarding/, src/store/hr-onboarding/, src/components/client-setup/
- legacy-markers: AD_ORG, ADD_ORG, DTD_ORG, CW_ORG, CW_WF, WA_ORG, AWPT_ORG, AWEP_ORG, AWEE_WF, WAEX_ORG, WT_ORG, ST_ORG, AT_ORG, PFS_ORG, PFS_GEN_ORG, PFS_CFG_ORG, PP_ORG, APSEWSS_ORG, APSEWSWE_ORG, APSVCS_ORG, APSVCWE_ORG, APSVSWE_ORG, EI_WF, SR_ORG, administration_page
- base-route: {ws}/administration/

### ADM-001 · Administrator dashboard
- priority: P0
- type: functional
- roles: org_exec, workforce_exec
- tags: smoke, regression
- route: {ws}/administration/
- destructive: no

**Steps:**
1. Open Administration. Click every tile/menu entry once.

**Expected:**
- Title `Administrator - HQZen`; every entry opens without 404.

### ADM-002 · Create a workforce
- priority: P1
- type: functional
- roles: org_exec, workforce_exec
- tags: regression, crud
- route: {ws}/administration/workforces
- destructive: yes
- legacy: CW_ORG_00, CW_ORG_01, CW_ORG_06, CW_ORG_07, CW_ORG_12, CW_WF_01, CW_WF_03, CW_WF_05, CW_WF_07, CW_WF_14

**Data:** name = `{run} workforce`

**Steps:**
1. Create a workforce: add and remove an image, set the name, search and add an executive, add one partner.

**Expected:**
- Workforce shows in the switcher (NAV-002) with the chosen members.

**Cleanup:** Archive/remove the workforce or report its name for manual removal.

### ADM-003 · Edit workforce, partners and executives tabs
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/administration/workforce
- destructive: yes
- legacy: WA_ORG_01, AWPT_ORG_00, AWPT_ORG_01, AWEP_ORG_05, AWEE_WF_01, WAEX_ORG_00

**Steps:**
1. Open workforce details. Partners tab: filter by department; open the people picker and search. Executives tab: search. Edit the workforce name of `{run} workforce`.

**Expected:**
- Title `Workforce Details - HQZen`; filters/search work; rename persists.

### ADM-004 · Single employee onboarding
- priority: P1
- type: e2e
- roles: org_exec
- tags: regression
- route: {ws}/administration/workforce/single-onboarding
- destructive: yes

**Data:** employee email = `agt-emp-{run}@example.com`

**Steps:**
1. Walk through employee information → contract configuration → summary → done.
2. Go Back from summary to change a field.

**Expected:**
- Each step validates; Back keeps entered data; done page confirms; the person appears as invited/onboarding.

### ADM-005 · Batch onboarding CSV
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/administration/workforce/batch-onboarding
- destructive: yes

**Data:** a CSV with 2 rows of `agt-batch-{run}-N@example.com` (use the template the page offers to download — ask before downloading), plus a CSV with one bad row (missing email).

**Steps:**
1. Upload the good CSV → review uploaded data → contract configuration → summary.
2. Upload the bad CSV.

**Expected:**
- Review shows both rows; bad CSV highlights the bad row and blocks continuing.

### ADM-006 · Departments CRUD and membership
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression, crud
- route: {ws}/administration/departments
- destructive: yes
- legacy: AD_ORG_02, AD_ORG_06, AD_ORG_07, AD_ORG_09, AD_ORG_10, AD_ORG_11, AD_ORG_12, AD_ORG_13, AD_ORG_14, ADD_ORG_00

**Data:** department = `{run} dept`

**Steps:**
1. Search departments. Create the department. Add a manager and a member. Remove the manager and **Undo**. Remove the member. Edit the name. Delete it.

**Expected:**
- Titles `Departments - HQZen` / `Department Details - HQZen`; every change persists; undo restores the manager.

### ADM-007 · Teams inside a department
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: DTD_ORG_02, DTD_ORG_04, DTD_ORG_05, DTD_ORG_06, DTD_ORG_07, DTD_ORG_09

**Steps:**
1. In `{run} dept` create team `{run} team` with 2 members. Rename it. Promote a member to supervisor. Remove a member. Delete the team.

**Expected:**
- Team employees page `Employees - HQZen` reflects each change.

### ADM-008 · Templates tabs and search
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/administration/templates
- destructive: no
- legacy: WT_ORG_01, WT_ORG_02, ST_ORG_02, AT_ORG_01, AT_ORG_03, test_templates_page

**Steps:**
1. Open each tab (`?tab=myTemplates|companyTemplates|systemTemplates|archivedTemplates`). Filter by type; search; sort category in Archived.
2. Open `?tab=agtInvalid`.

**Expected:**
- Title `Templates - HQZen`; each tab loads; invalid tab → page-not-found (router validates the tab).

### ADM-009 · Create templates (contract, memo, job description)
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- route: {ws}/administration/templates/:action/
- destructive: yes
- legacy: WT_ORG_15, WT_ORG_16, WT_ORG_17, WT_ORG_19, WT_ORG_22, WT_ORG_43

**Steps:**
1. In Template Maker create `{run} JD` (job description) and `{run} memo tpl` (memorandum) using field search to insert placeholders. Copy an existing template as `{run} copy`.

**Expected:**
- Title `Template Maker - HQZen`; templates saved under My Templates; placeholders render.

**Cleanup:** Archive `{run}` templates.

### ADM-010 · View archived template details by type
- priority: P2
- type: functional
- roles: org_exec
- destructive: no
- legacy: AT_ORG_04, AT_ORG_05, AT_ORG_06, AT_ORG_07

**Steps:**
1. In Archived open a Contract, Memorandum, NDA and Job Description template.

**Expected:**
- Each detail view renders its document.

### ADM-011 · Platform settings templates
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/administration/platform-settings
- destructive: yes
- legacy: PFS_GEN_ORG_02, PFS_GEN_ORG_04, PFS_ORG_23, PFS_CFG_ORG_02, PFS_CFG_ORG_08

**Steps:**
1. Search templates. Create `{run} platform` configuring Desktop and Mobile. Copy it. Delete the copy.
2. Open `?tab=partners` and `?foo=bar`.

**Expected:**
- Create/Edit pages titled `Create Platform Settings - HQZen` / `Edit Platform Settings - HQZen`; unknown query param → page-not-found.

### ADM-012 · Platform settings: partners tab
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: PFS_ORG_25, PFS_ORG_26, PFS_ORG_27, PFS_ORG_28, PFS_ORG_31, PFS_ORG_33, PFS_ORG_34, PFS_ORG_56, PFS_ORG_57

**Steps:**
1. Filter by department, team, template status; search a partner; open their details.
2. Edit a test partner's Desktop and Mobile config; add and delete an IP address.

**Expected:**
- Filters work; edits persist; invalid IP rejected.

### ADM-013 · Page permissions (grant/revoke)
- priority: P0
- type: rbac
- roles: org_exec, workforce_exec
- tags: smoke, rbac, regression
- route: {ws}/administration/permissions-settings
- destructive: yes
- legacy: PP_ORG_03, PP_ORG_07, PP_ORG_11, PP_ORG_46, APSEWSWE_ORG_00

**Steps:**
1. As org_exec grant a page permission (e.g. View Screenshots) to `workforce_exec`. Sign in as workforce_exec and open that page. Revoke and recheck.

**Expected:**
- Access appears after grant and disappears after revoke (no stale cache beyond one reload).

### ADM-014 · Edit work schedule / view compensation / view screenshots permissions
- priority: P1
- type: rbac
- roles: org_exec
- tags: rbac, regression
- route: {ws}/administration/permissions-settings/edit-work-schedule
- destructive: yes
- legacy: APSEWSS_ORG_01, APSEWSS_ORG_03, APSEWSS_ORG_06, APSEWSWE_ORG_01, APSEWSWE_ORG_02, APSEWSWE_ORG_04, APSVCS_ORG_01, APSVCWE_ORG_00, APSVCWE_ORG_01, APSVCWE_ORG_04, APSVSWE_ORG_01, APSVSWE_ORG_04

**Steps:**
1. For each permission page: Supervisors tab and Workforce Executive tab → search, filter, grant to the test supervisor, then revoke.

**Expected:**
- Title `Edit Work Schedule - HQZen` (etc.); grants/revokes persist and take effect for the supervisor.

### ADM-015 · Contracts, separations, exit interviews
- priority: P1
- type: functional
- roles: org_exec, workforce_exec
- tags: regression
- route: {ws}/administration/exit-interviews
- destructive: no
- legacy: EI_WF_01, EI_WF_02, EI_WF_08, SR_ORG_07

**Steps:**
1. Open contracts; open separations → filter "Pending Manager Action"; open exit interviews → filter department/team, search partner, open one.

**Expected:**
- Titles `Contracts - HQZen`, `Separations - HQZen`, `Exit Interviews - HQZen`, `Exit Interviews Details - HQZen`.

### ADM-016 · Staff configuration
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/administration/staff-configuration
- destructive: yes

**Steps:**
1. Create `{run} staff config`; edit; delete.

**Expected:**
- Titles `Staff Configuration - HQZen` / `Staff Configuration Create - HQZen`.

### ADM-017 · Onboarding settings
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/administration/onboarding-settings
- destructive: yes

**Steps:**
1. Tabs `?tab=configurations` and `?tab=members`; create `{run} onb config`; update it; open details. Try `?tab=agtInvalid`.

**Expected:**
- Pages load; invalid tab → page-not-found.

### ADM-018 · Shared board & organization settings
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/administration/workforce-settings
- destructive: yes

**Steps:**
1. Open workforce settings and organization settings; toggle a harmless setting; save; revert.

**Expected:**
- Titles `Shared Board Settings - HQZen`, `Settings - HQZen`; values persist and revert.

### ADM-019 · Payment dues and invoice details
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/administration/payment-dues
- destructive: no

**Steps:**
1. Open payment dues; open one invoice.

**Expected:**
- Amounts formatted with currency; invoice details render. **Never pay.**

### ADM-020 · Administration denied to non-executives
- priority: P0
- type: rbac
- roles: manager, supervisor, employee
- tags: smoke, rbac
- destructive: no

**Steps:**
1. Open `{ws}/administration/`, `{ws}/administration/departments`, `{ws}/administration/platform-settings`, `{ws}/administration/payrolls`.

**Expected:**
- All denied.
