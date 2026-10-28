# Milestones & tags

- module: milestones
- prefix: MS
- source-paths: src/components/milestones/, src/pages/milestones/, src/store/milestone/, src/store/tag/, src/router/internal/milestones/, src/router/internal/tags/, src/pages/tags/
- legacy-markers: MS, MS_FM, MS_FMB, MS_FMC, MS_FMD, MS_FME, MS_FMF, MS_GM, M_M, TAGS
- base-route: {ws}/milestones

### MS-001 · Milestones page loads and filters
- priority: P0
- type: functional
- roles: org_exec, employee
- tags: smoke, regression
- route: {ws}/milestones
- destructive: no
- legacy: M_M_02

**Steps:**
1. Open milestones. Use each filter (status, type, lead).

**Expected:**
- Title `Milestones - HQZen`; filters narrow the list.

### MS-002 · Create a feature milestone
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression, crud
- destructive: yes
- legacy: MS_06, M_M_01

**Data:** name = `{run} feature ms`

**Steps:**
1. Create a feature milestone with name, dates, lead and team.

**Expected:**
- Appears in the list; details page `{ws}/milestones/milestone-details/:milestone_id` opens.

### MS-003 · Create a goal milestone
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: MS_09

**Data:** name = `{run} goal ms`

**Steps:**
1. Create a goal milestone; open goal details.

**Expected:**
- Title `Goal Milestone - HQZen`; goal data correct.

### MS-004 · Edit milestone and questions
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: M_M_11, MS_08, MS_GM_03

**Steps:**
1. Edit the `{run}` milestones' name, dates and assessment questions.

**Expected:**
- Changes persist; end date before start date is rejected.

### MS-005 · Milestone comments
- priority: P2
- type: functional
- roles: employee
- destructive: yes
- legacy: MS_FM_05

**Steps:**
1. Comment on the `{run} feature ms`.

**Expected:**
- Comment shown with author/time.

### MS-006 · Team card subtasks
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: MS_FMF_02, MS_FMF_04

**Steps:**
1. Under the milestone's team card add a subtask; search for it.

**Expected:**
- Subtask saved and searchable.

**Cleanup:** Delete the subtask.

### MS-007 · Estimation setup and assessments
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: MS_FMC_02

**Steps:**
1. Set up estimation for a card in the milestone.

**Expected:**
- Estimation shown in the milestone summary.

**Cleanup:** Remove the estimation.

### MS-008 · Milestone requests approve/reject
- priority: P1
- type: functional
- roles: employee, org_exec
- tags: regression
- destructive: yes
- legacy: MS_FME_02, MS_FME_03
- multi-actor: yes

**Steps:**
1. As employee request to join/link to the `{run} feature ms`. As lead (org_exec) reject one request and approve another.

**Expected:**
- Request list updates; requester sees the outcome.

### MS-009 · Close and re-open a milestone
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: MS_FM_06, M_M_14

**Steps:**
1. Close the `{run} feature ms`; filter closed; re-open it.

**Expected:**
- Status changes each time and filter reflects it.

### MS-010 · Milestone documents and gallery
- priority: P3
- type: functional
- roles: org_exec
- route: {ws}/milestones/gallery/:milestone_id
- destructive: yes
- legacy: MS_FMD_01, MS_FMD_03

**Steps:**
1. Upload a document to the milestone; open the gallery.

**Expected:**
- Title `Milestone Gallery - HQZen`; document listed.

**Cleanup:** Delete the uploaded document.

### MS-011 · Tags CRUD
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- route: {ws}/tags/
- destructive: yes
- legacy: TAGS_00, TAGS_01, TAGS_02

**Data:** tag = `{run} tag`

**Steps:**
1. Tags page → **Create Tag** (`/tags/new`) with the data. Edit it (`/tags/edit/:tag_id`). Delete it.
2. Try to create a tag with an empty name and a duplicate name.

**Expected:**
- Titles `Tags - HQZen` / `Create Tag - HQZen`; CRUD persists; invalid names rejected.

**Cleanup:** Delete the milestones created in this module (or close them if delete is not offered).
