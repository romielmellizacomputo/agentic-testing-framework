# Command boards, automated forms, chatbot & concerns portal

- module: command-boards
- prefix: CMD
- source-paths: src/components/concerns/, src/pages/concerns/, src/store/concerns/, src/store/generic-form/, src/store/shareable-form/, src/router/external/engagement/, src/router/external/chatbot-forms/, src/router/external/ops-form/, src/store/generate-eva/
- legacy-markers: CB_FS, CB_SF, CB_MAP, CB_CP, CB_TT
- base-route: {ws}/board/:board_id/set-up-form/:engagement_form_id?

### CMD-001 · Set up an automated form: title, description, URL
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/board/:board_id/set-up-form/:engagement_form_id?
- destructive: yes
- legacy: CB_FS_00

**Data:** title = `{run} intake form`, url = `{run}-intake` (lowercase)

**Steps:**
1. On the `{run} board` open **Set up form**. Fill title, description and custom URL. Save.

**Expected:**
- Title `Set up automated form - HQZen`; saved values reload correctly.

### CMD-002 · Sections and fields
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: CB_FS_02, CB_FS_03, CB_FS_06, CB_FS_07

**Steps:**
1. Add 2 sections. Add a text, a dropdown and a date field. Move a section up/down. Delete one field.

**Expected:**
- Order and fields persist after save + reload.

### CMD-003 · Map form fields to card properties
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: CB_MAP_01

**Steps:**
1. Map the text field to card title and the date to due date. Save.

**Expected:**
- Mapping persists; preview shows it.

**Cleanup:** Delete the field mapping (or the whole `{run} intake form` after CMD-005).

### CMD-004 · Preview the form
- priority: P2
- type: functional
- roles: org_exec
- destructive: no
- legacy: CB_SF_02

**Steps:**
1. Click **Preview**.

**Expected:**
- Preview matches the configured sections/fields; submitting from preview does not create a card (or clearly says it's a preview).

### CMD-005 · Public engagement form creates a card
- priority: P0
- type: e2e
- roles: anonymous, org_exec
- tags: smoke, regression
- route: /engagement/:workforce/:board/:url
- destructive: yes
- depends: CMD-003

**Steps:**
1. Open the public form URL from CMD-001 in a signed-out tab. Fill and submit with `{run}` values.
2. As org_exec open the board.

**Expected:**
- Title `Engagement Form - HQZen`; thank-you state after submit; a card with mapped title and due date appears on the board.

**Cleanup:** Archive the card; delete the form.

### CMD-006 · Engagement form validation
- priority: P2
- type: validation
- roles: anonymous
- route: /engagement/:workforce/:board/:url
- destructive: no

**Steps:**
1. Submit the public form empty; then with a wrong date format; then with `<script>alert(1)</script>` in a text field.

**Expected:**
- Required errors shown; script text is stored/shown as text, never executed (an alert = sev:S1).

### CMD-007 · Invalid public form URL
- priority: P2
- type: negative
- roles: anonymous
- route: /engagement/:workforce/:board/:url
- destructive: no

**Steps:**
1. Open `/engagement/0/0/agt-does-not-exist`.

**Expected:**
- Friendly not-found message.

### CMD-008 · AI / chatbot settings
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/board/:board_id/chatbot-settings/:template_id?
- destructive: yes

**Steps:**
1. Open AI Settings for the `{run} board`. Change a setting; save; reload.

**Expected:**
- Title `AI Settings - HQZen`; change persists.

### CMD-009 · Public chatbot form
- priority: P2
- type: e2e
- roles: anonymous
- route: /chatbot/:template_id/:workforce/:board/:url
- destructive: yes
- depends: CMD-008

**Steps:**
1. Open the chatbot form link; answer the conversation with `{run}` data until done.

**Expected:**
- Title `Chatbot Form - HQZen`; bot replies; submission creates a card (check board).

### CMD-010 · Concerns portal submit
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /concerns
- destructive: yes
- legacy: CB_CP_04

**Data:** subject = `{run} concern portal`

**Steps:**
1. Open `/concerns`. Submit a concern with the data.

**Expected:**
- Title `Concerns Portal`; confirmation with ticket number; ticket visible in ticket tracker.

### CMD-011 · Ticket tracker board search and filter
- priority: P2
- type: functional
- roles: org_exec
- destructive: no
- legacy: CB_TT_01

**Steps:**
1. Open the ticket tracker board; search and filter tickets.

**Expected:**
- Results narrow correctly.
