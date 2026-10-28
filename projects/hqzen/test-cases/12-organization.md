# Organization (company-level settings)

- module: organization
- prefix: ORG
- source-paths: src/pages/organization/, src/pages/memorandums/, src/store/policies/, src/store/memo/, src/store/company/, src/store/permissions/, src/router/internal/organization/, src/router/internal/memorandums/
- legacy-markers: OE_ORG, OEP_ORG, OLP_ORG, ORG_EP, OM_ORG, EXEC_UN_BLKA, EXEC_UN_BLKB, APP_UN_BLKB, test_organization_page, test_memorandums_page
- base-route: /organization

Org-exec only. Everything here affects the whole company — always use `{run}` names and clean up.

### ORG-001 · Organization page loads
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: /organization
- destructive: no
- legacy: test_organization_page

**Steps:**
1. Open `/organization`; open each tab/sub-page.

**Expected:**
- Title `Organization - HQZen`; sub-pages load: Executives, Workforce Facilities, Career Policies, HR Admins, Memorandums, Company Rules.

### ORG-002 · Executives list and invite
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: /organization/executives
- destructive: yes
- legacy: OE_ORG_01, OE_ORG_03

**Data:** invitee = an allowed test email from `accounts.local.json` (never a real colleague)

**Steps:**
1. Search the executives list. Invite the test email as org executive. Cancel/revoke the invite.

**Expected:**
- Title `Executives - HQZen`; invite listed as pending; revoke removes it.

### ORG-003 · Career policies list and search
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: /organization/career-policies
- destructive: no
- legacy: OEP_ORG_00, OEP_ORG_01

**Steps:**
1. Open career policies; search; open a policy.

**Expected:**
- Title `Career Policies - HQZen`; detail title `HR Policy - HQZen`.

### ORG-004 · Create a career (employment) policy
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- route: /organization/create-career-policy
- destructive: yes
- legacy: ORG_EP_03

**Data:** name = `{run} policy`

**Steps:**
1. Create a policy with the data; complete required sections; save.

**Expected:**
- Policy appears in the list; amendment summary page available after edits.

### ORG-005 · Payroll policy configuration
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: OEP_ORG_35

**Steps:**
1. In `{run} policy` configure payroll (cut-off, frequency, rates). Save.
2. Try invalid values (negative rate, cut-off day 0 or 32).

**Expected:**
- Valid config saved; invalid rejected.

### ORG-006 · Leave policies from presets
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: OLP_ORG_01

**Steps:**
1. Add a leave policy from a preset to `{run} policy`; adjust credits; save.

**Expected:**
- Leave types listed with credits; employees on this policy would see them (not verified here).

### ORG-007 · Policy offenses
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: OEP_ORG_39

**Steps:**
1. Add an offense with sanctions to `{run} policy`.

**Expected:**
- Offense listed; selectable when filing an incident report / DAF.

### ORG-008 · HR admins
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: /organization/organization-hr-admins
- destructive: yes
- legacy: OEP_ORG_15

**Steps:**
1. Search HR admins; add the `hr_admin` test account to `{run} policy` if not present; remove again.

**Expected:**
- Title `HR Admins - HQZen`; changes persist; HR portal access follows (HR-001).

### ORG-009 · Memorandums: plain text
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- route: /organization/memorandums
- destructive: yes
- legacy: OM_ORG_02, OM_ORG_08, test_memorandums_page

**Data:** subject = `{run} memo`

**Steps:**
1. Search memos. Create a plain-text memo addressed only to the `employee` test account. Publish.

**Expected:**
- Title `Memorandums - HQZen`; memo listed; detail page `Memorandum Details - HQZen`; employee sees it (CAR-006).

### ORG-010 · Memorandums: template-based
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: OM_ORG_19

**Steps:**
1. Create a memo from a memorandum template; fill placeholders.

**Expected:**
- Placeholders replaced in preview and final document.

**Cleanup:** Archive or delete the `{run}` memo.

### ORG-011 · Memo recipient search across workforces
- priority: P2
- type: functional
- roles: org_exec
- tags: regression
- destructive: no

**Steps:**
1. In the memo recipient picker select a workforce with many partners. Compare the count with the workforce page.

**Expected:**
- All partners of the workforce are listed.

### ORG-012 · Company rules
- priority: P2
- type: functional
- roles: org_exec
- route: /organization/company-rules
- destructive: no

**Steps:**
1. Open company rules.

**Expected:**
- Title `Company Rules - HQZen`; rules render.

### ORG-013 · Workforce facilities
- priority: P3
- type: functional
- roles: org_exec
- route: /organization/workforce-facilities
- destructive: no

**Steps:**
1. Open workforce facilities.

**Expected:**
- Title `Workforce Facilities - HQZen`; facilities list loads.

### ORG-014 · Exit interview details (org)
- priority: P3
- type: functional
- roles: org_exec
- route: /organization/exit-interviews/details/:id
- destructive: no

**Steps:**
1. From an exit interview link open its details.

**Expected:**
- Title `Exit Interviews Details - HQZen`; answers shown.

### ORG-015 · Non-org-exec cannot open organization pages
- priority: P0
- type: rbac
- roles: workforce_exec, manager, employee
- tags: smoke, rbac
- destructive: no

**Steps:**
1. Open `/organization`, `/organization/career-policies`, `/organization/executives` directly.

**Expected:**
- Denied for every role listed.

### ORG-016 · Block and unblock a partner account
- priority: P1
- type: e2e
- roles: org_exec, blocked_partner
- tags: regression
- destructive: yes
- legacy: EXEC_UN_BLKA_01, EXEC_UN_BLKA_02, EXEC_UN_BLKB_00, APP_UN_BLKB_01

**Steps:**
1. As org_exec block `blocked_partner` (staff page or blocked partners page).
2. As blocked_partner sign in → see blocked state → request unblock.
3. As org_exec see the unblock request notification; unblock.

**Expected:**
- Blocked user can't use internal pages (AUTH-017); request notification arrives; after unblock access returns.

**Cleanup:** Make sure the account ends **unblocked**.
