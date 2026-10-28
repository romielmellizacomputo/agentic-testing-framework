# Workforce boards & cards

- module: boards
- prefix: BOARD
- source-paths: src/components/board/, src/pages/board/, src/store/board/, src/store/board-actions/, src/store/tag/, src/store/gallery/, src/store/task-estimation/, src/router/internal/board/, src/composables/useBoardFiltersInURL.js
- legacy-markers: BRD, BRDA, BRDB, BRDC, BRDD, BRDE, BRD_SPCS, WB
- base-route: {ws}/board/:board_id

The busiest area of the app (~400 components). Use a dedicated test board named `AGT board` (create it with BOARD-002 if missing) so other teams' boards are untouched.

### BOARD-001 · Main board page loads
- priority: P0
- type: functional
- roles: org_exec, employee
- tags: smoke, regression
- route: {ws}/board/:board_id
- destructive: no

**Steps:**
1. Open `{ws}/board/-1` (router picks the first board you belong to).

**Expected:**
- Redirects to a real `board_id` (or to overview if you have no boards). Title `Main Board Page - HQZen`; columns and cards render.

### BOARD-002 · Create a board
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression, crud
- destructive: yes
- legacy: BRD_00

**Data:** name = `{run} board`

**Steps:**
1. From the board list/switcher click **Create board**; enter the name; save.

**Expected:**
- New board opens with default columns; it appears in the board list; reload keeps it.

**Cleanup:** Delete the board (BOARD-011) at the end of the module.

### BOARD-003 · Search boards
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: no
- legacy: BRD_02

**Steps:**
1. Search the board list for part of a known board name, then nonsense.

**Expected:**
- Matching boards only; empty state for nonsense.

### BOARD-004 · Board view options
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: no
- legacy: BRD_04

**Steps:**
1. Switch each view option (board/list/other) and reload on each.

**Expected:**
- Each view renders the same cards; the chosen view/filters persist in the URL (`useBoardFiltersInURL`) after reload.

### BOARD-005 · Custom columns add, rename, delete
- priority: P1
- type: functional
- roles: org_exec
- tags: regression, crud
- destructive: yes
- legacy: BRD_05

**Data:** column = `{run} col`

**Steps:**
1. On the `{run} board` add a custom column; rename it to `{run} col 2`; delete it.

**Expected:**
- Each change persists on reload; deleting a column with cards asks what to do with them (or blocks).

### BOARD-006 · Drag to reorder columns
- priority: P2
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRD_07

**Steps:**
1. Drag a custom column to a new position. Reload.

**Expected:**
- New order persists.

**Cleanup:** Move the column back to its original position.

### BOARD-007 · Board settings: name, description, custom URL
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRDA_01, BRDA_11, BRDA_12

**Steps:**
1. Open board settings for `{run} board`. Rename to `{run} board renamed`, add a description, set a custom URL slug `{run}-slug` (lowercase).
2. Try a slug with spaces or an existing board's slug.

**Expected:**
- Valid changes saved; invalid/duplicate slug rejected with a clear message.

### BOARD-008 · Board tags panel
- priority: P2
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRDA_02, BRDA_03

**Steps:**
1. In settings → tags, add `{run} tag`, search for it, edit its color, remove it.

**Expected:**
- Search filters the tag list; changes persist.

### BOARD-009 · Board members add, search, remove
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- destructive: yes
- legacy: BRDA_04, BRDA_05, BRDA_06

**Steps:**
1. In settings → members search for the `employee` account and add them. Remove them again.

**Expected:**
- Member appears/disappears in the list; the employee can open the board only while a member (verify with BOARD-029).

### BOARD-010 · Board managers
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: BRDA_07, BRDA_08

**Steps:**
1. Make the `supervisor` a board manager; search the managers panel; remove them.

**Expected:**
- Manager badge appears/disappears; changes persist.

### BOARD-011 · Delete a board
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRDA_14
- depends: BOARD-002

**Steps:**
1. Delete `{run} board` from settings; confirm.

**Expected:**
- A confirmation is required; board disappears from the list; its URL now shows access denied/not found.

### BOARD-012 · Create a card
- priority: P0
- type: functional
- roles: org_exec, employee
- tags: smoke, regression, crud
- destructive: yes
- legacy: BRDB_00

**Data:** title = `{run} card`

**Steps:**
1. Add a card to the first column. Open it.

**Expected:**
- Card appears with reference number, creator, and title. Reload keeps it.

**Cleanup:** Archive the card.

### BOARD-013 · Move a card between columns
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression
- destructive: yes
- legacy: BRDB_02

**Steps:**
1. Drag a `{run}` card to another normal column. Reload.

**Expected:**
- Card stays in the new column; activity log records the move.

### BOARD-014 · Restricted columns (For Review / Done)
- priority: P1
- type: rbac
- roles: employee
- tags: regression, rbac
- destructive: yes
- legacy: BRDB_03, BRDB_04

**Steps:**
1. As employee try to drag a card into **For Review** and **Done**.
2. As org_exec move the same card to **Done**.

**Expected:**
- Employee is blocked with a message; exec can move it; the Done date shown equals today (in the user's timezone).

**Cleanup:** Move the card out of Done and archive it.

### BOARD-015 · Copy a card
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRDB_05

**Steps:**
1. Card actions → copy/duplicate `{run} card` as `{run} card copy`.

**Expected:**
- New card has copied properties (description, tags, members per design) and a new reference number.

**Cleanup:** Archive both.

### BOARD-016 · Archive and restore a card
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: BRDB_06, BRDB_07

**Steps:**
1. Archive a `{run}` card; find it in archived; restore it.

**Expected:**
- Card hidden after archive, listed in archived, back in its column after restore.

### BOARD-017 · Card visibility and private card join request
- priority: P1
- type: rbac
- roles: org_exec, employee
- tags: regression, rbac
- destructive: yes
- legacy: BRDB_11, BRDB_13, BRDD_07, BRDD_08
- multi-actor: yes

**Steps:**
1. As org_exec make a `{run}` card private.
2. As employee (board member, not card member) open it → request to join.
3. As org_exec reject, then (after a new request) approve.

**Expected:**
- Employee cannot read private content before approval; request appears for the exec; reject/approve take effect.

### BOARD-018 · Card details: title, description, due date
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression
- destructive: yes
- legacy: BRDC_03, BRDC_04, BRDC_06, BRDC_07, BRDC_09

**Steps:**
1. Edit title. Add a description with **bold**, a bullet list and a link. Edit it. Set and change the due date.

**Expected:**
- All values persist after reload; rich text formatting kept; overdue dates styled as overdue.

**Cleanup:** Use a `{run}` card only; archive it when the module ends.

### BOARD-019 · Card tags and milestone
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: BRDC_01, BRDC_02, BRDC_10, BRDC_12, BRDC_13

**Steps:**
1. Add and change tags. Add a milestone using the milestone dropdown search; change it.

**Expected:**
- Tag chips and milestone shown on card face and details; search filters the dropdown.

**Cleanup:** Remove the tags and milestone from the `{run}` card.

### BOARD-020 · Comments: add, mention, reply, edit, delete
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression
- destructive: yes
- legacy: BRDE_01, BRDE_02, BRDE_03, BRDE_04, BRDE_07

**Steps:**
1. Comment `{run} comment`. Mention a teammate with `@`. Reply to the comment. Edit it. Delete it.
2. Try `@everyone`.

**Expected:**
- Each action shows immediately and after reload; mention links the user and notifies them (see NAV-007); edits are marked edited; delete asks to confirm.

### BOARD-021 · Attachments
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: BRDC_17

**Data:** a small PNG and a PDF (any test file; never real documents)

**Steps:**
1. Upload both to a `{run}` card. Open/preview each. Delete one.
2. Try a file larger than the limit (if documented) or an `.exe`.

**Expected:**
- Uploads show progress and thumbnails; preview works; forbidden files rejected with a clear message.

### BOARD-022 · Estimations
- priority: P2
- type: functional
- roles: employee
- destructive: yes
- legacy: BRDC_24

**Steps:**
1. Submit an estimation on a `{run}` card.

**Expected:**
- Estimation saved and shown; non-numeric input rejected.

### BOARD-023 · Subtasks with assignees and progress
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: BRDC_25, BRDC_27, BRDC_35, BRDC_36, BRDC_39, BRDC_50

**Steps:**
1. Add 3 subtasks; search one; edit one; assign one to a teammate; complete one; remove one.

**Expected:**
- Progress reflects completion; assignee avatar shown; all persists.

### BOARD-024 · Linked cards
- priority: P2
- type: functional
- roles: employee
- destructive: yes
- legacy: BRDC_14, BRDC_16

**Steps:**
1. Link `{run} card` to another `{run}` card; open the link; remove it.

**Expected:**
- Link appears on both cards (if bidirectional by design); removing works.

### BOARD-025 · Card members add and remove
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: BRDD_01, BRDD_04

**Steps:**
1. Add the employee as a card member; remove them.

**Expected:**
- Avatars update; member gets a notification on add.

### BOARD-026 · Board analytics
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/board/:board_id/board-analytics
- destructive: no

**Steps:**
1. Open board analytics; change the period.

**Expected:**
- Title `Board Analytics - HQZen`; charts render; totals plausible against the board.

### BOARD-027 · Board image gallery
- priority: P3
- type: functional
- roles: employee
- route: {ws}/board/:board_id/gallery
- destructive: no

**Steps:**
1. Open the gallery; open an image.

**Expected:**
- Title `Image Gallery - HQZen`; images from card attachments appear.

### BOARD-028 · Open a card by reference number in the URL
- priority: P2
- type: functional
- roles: employee
- route: {ws}/board/:board_id
- destructive: no

**Steps:**
1. Open `{ws}/board/:board_id?card_id=<reference number>` and `?card_id=999999999`.

**Expected:**
- Valid reference opens the card panel (URL is rewritten to the internal id); invalid shows a not-found message, not a crash.

### BOARD-029 · Non-member cannot open a board by URL
- priority: P0
- type: rbac
- roles: employee
- tags: smoke, rbac, security
- destructive: no

**Steps:**
1. As org_exec note the URL of a board the employee is **not** a member of.
2. As employee open that URL directly (fresh tab).

**Expected:**
- `access-denied` page. No card titles flash on screen. API for that board returns 403/404 (check network).

### BOARD-030 · Shared (workforce) ticket board filters and search
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/workforce-board
- destructive: no
- legacy: WB_05, WB_06, WB_07, WB_08

**Steps:**
1. Open the shared board. Filter by department, then by issuer. Search by title and by ticket number.

**Expected:**
- Title `Shared Board - HQZen`; each filter narrows results; clearing restores them.

### BOARD-031 · Submit a concern from the shared tickets board
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: WB_12, CB_TT_12

**Data:** subject = `{run} concern`

**Steps:**
1. From the shared board submit a concern with the data.

**Expected:**
- Ticket is created with a ticket number; it appears in the employee's ticket tracker (PERS-011).

### BOARD-032 · Priority tag confirmation
- priority: P3
- type: ui
- roles: employee
- destructive: yes

**Steps:**
1. Set a high priority tag on a `{run}` card.

**Expected:**
- Confirmation modal appears; cancel leaves it unchanged; confirm applies it.

### BOARD-033 · Board chat
- priority: P2
- type: functional
- roles: employee
- legacy: BRD_SPCS_03, BRD_SPCS_04
- destructive: yes

**Steps:**
1. Open the board chat; send `{run} hello`; react/edit if available.

**Expected:**
- Message appears immediately and for another member without reload.

### BOARD-034 · Large board performance
- priority: P2
- type: performance
- roles: org_exec
- tags: nightly
- destructive: no

**Steps:**
1. Open the board with the most cards available. Measure time until cards are visible. Scroll all columns.

**Expected:**
- Cards visible in under 5 s; scrolling stays smooth; no "long task" warnings > 1 s repeated.
