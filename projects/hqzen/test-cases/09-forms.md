# Forms (internal, anonymous, shareable)

- module: forms
- prefix: FORM
- source-paths: src/pages/forms/, src/store/generic-form/, src/store/shareable-form/, src/router/internal/forms/, src/router/external/shareable-form/, src/components/editor/
- legacy-markers: FRM_ANSA, FRM_AUA, FRM_CRT, FRM_GEN, FRM_PND, FRM_PNDA, FRM_PNDB
- base-route: {ws}/forms

### FORM-001 · Forms page and search
- priority: P0
- type: functional
- roles: org_exec, employee
- tags: smoke, regression
- route: {ws}/forms
- destructive: no
- legacy: FRM_GEN_00, FRM_GEN_01

**Steps:**
1. Open Forms. Switch tabs (Pending, Answered, Authored…). Search a form name.

**Expected:**
- Title `Forms - HQZen`; each tab loads; tab counts match rows; search filters.

### FORM-002 · Create a form with every question type
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression, crud
- route: {ws}/forms/create-form
- destructive: yes
- legacy: FRM_CRT_00, FRM_CRT_01, FRM_CRT_04

**Data:** title = `{run} form`

**Steps:**
1. Create a form with one of each question type (short text, paragraph, multiple choice, checkbox, rating/scale, date, file if offered). Delete one question. Save as draft.

**Expected:**
- Every type configurable; delete works; draft reopens with identical questions.

### FORM-003 · Recipients modal
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: FRM_CRT_05, FRM_CRT_06, FRM_CRT_07, FRM_CRT_08

**Steps:**
1. Open recipients for `{run} form`. Search; add the `employee`; remove and re-add. Publish.

**Expected:**
- Search filters; recipient list correct; publish succeeds.

### FORM-004 · Employee answers a pending generic form
- priority: P0
- type: e2e
- roles: employee
- tags: smoke, regression
- destructive: yes
- depends: FORM-003
- legacy: FRM_PND_00, FRM_PND_01, FRM_PNDA_00, FRM_PNDA_02

**Steps:**
1. As employee open Pending; the count includes `{run} form`. Open it; submit answers (try submitting with a required question empty first).

**Expected:**
- Required validation; after submit it moves to Answered and the pending count drops by 1.

### FORM-005 · Edit a submitted response (if allowed)
- priority: P2
- type: functional
- roles: employee
- destructive: yes
- legacy: FRM_PNDB_04

**Steps:**
1. Open the answered form and edit a response.

**Expected:**
- Edit saved, or editing clearly not allowed by design.

**Cleanup:** Nothing extra — the `{run} form` is archived in FORM-010 cleanup.

### FORM-006 · Author views responses (summary and individual)
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/forms/responses-all/:form_document_id
- destructive: no
- legacy: FRM_ANSA_00, FRM_AUA_11

**Steps:**
1. Open responses summary and the individual response from FORM-004.

**Expected:**
- Summary counts/charts match; individual shows the employee's answers.

### FORM-007 · Anonymous form hides recipients
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: FRM_CRT_02, FRM_AUA_20

**Steps:**
1. Create `{run} anon form` as anonymous; publish; have employee answer; view responses.

**Expected:**
- No Recipients tab for the anonymous form; responses do not reveal who answered (check UI and the API response — names/emails present = sev:S1).

### FORM-008 · Change status, edit, archive authored form
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: FRM_AUA_04, FRM_AUA_12, FRM_AUA_14

**Steps:**
1. Change `{run} form` status (open/closed). Edit its description. Archive it.

**Expected:**
- Closed forms can't be answered by employee; archive moves it out of the main list.

### FORM-009 · Personal goal form
- priority: P2
- type: functional
- roles: employee
- destructive: yes
- legacy: FRM_PNDB_00

**Steps:**
1. Open a pending personal goal form; fill and submit.

**Expected:**
- Saved; appears under answered.

**Cleanup:** Only answer a personal goal form that belongs to the test employee; note which one in the run notes.

### FORM-010 · Shareable form create and public answer
- priority: P1
- type: e2e
- roles: org_exec, anonymous
- tags: regression
- route: {ws}/forms/shareable
- destructive: yes

**Steps:**
1. Create a shareable form `{run} share`; copy its public link (`/forms/:share_code`).
2. Signed out, open and submit it.
3. As org_exec open its responses.

**Expected:**
- Public page title `Form - HQZen`; response listed in shareable responses.

**Cleanup:** Archive/delete all `{run}` forms.

### FORM-011 · Form access control
- priority: P1
- type: rbac
- roles: non_exec
- tags: rbac
- destructive: no

**Steps:**
1. As a user who is not a recipient, open the URL of `{run} form` questions page and its responses page.

**Expected:**
- Questions: denied or "not assigned". Responses: denied. No answers visible.
