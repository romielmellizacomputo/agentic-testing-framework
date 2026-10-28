# Personal board, trackers & account information

- module: personal-board
- prefix: PERS
- source-paths: src/router/internal/personal-board/, src/components/board/, src/store/todo/, src/store/requests/, src/store/concerns/, src/pages/board/, src/pages/profile/
- legacy-markers: PBA, PBB, PBC, PBD, personal_board
- base-route: /personal/personal-board

### PERS-001 · Personal board loads
- priority: P0
- type: functional
- roles: employee, org_exec
- tags: smoke, regression
- route: /personal/personal-board
- destructive: no
- legacy: test_personal_board_page

**Steps:**
1. Open `/personal/personal-board`.

**Expected:**
- Title `Personal - HQZen`; columns render; cards load.

### PERS-002 · Create a personal card
- priority: P0
- type: functional
- roles: employee
- tags: smoke, regression, crud
- route: /personal/personal-board
- destructive: yes
- legacy: PBB_00

**Data:** title = `{run} personal card`

**Steps:**
1. Add a card in the first column with the title. Reload.

**Expected:**
- Card is visible after reload with the right title and in the right column.

**Cleanup:** Archive the card.

### PERS-003 · Create a personal card linked to a milestone
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: PBB_01

**Data:** title = `{run} milestone card`

**Steps:**
1. Create a card and choose an existing milestone in the create modal.

**Expected:**
- The card shows the milestone; opening the milestone lists the card.

**Cleanup:** Archive the card.

### PERS-004 · Move a personal card between columns
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- depends: PERS-002

**Steps:**
1. Drag the card from PERS-002 to the next column. Reload.

**Expected:**
- Card stays in the new column after reload.

**Cleanup:** Archive the card (or leave it for PERS-005, which archives it).

### PERS-005 · Archive, show archived, unarchive
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: PBA_03, PBC_03

**Steps:**
1. Archive a `{run}` card. Toggle **Archived** to show the archived column. Unarchive the card.

**Expected:**
- Card disappears on archive, appears in Archived column, returns to its column after unarchive.

**Cleanup:** Archive it again.

### PERS-006 · Subtasks add, check, delete
- priority: P1
- type: functional
- roles: employee
- tags: regression
- destructive: yes
- legacy: PBC_06, PBC_15

**Steps:**
1. Open a `{run}` card. Add 2 subtasks. Tick one. Delete the other.

**Expected:**
- Progress indicator updates (1/1 or 50% → 100%); deletion asks for confirmation if designed so; state persists after reload.

### PERS-007 · Activity panel
- priority: P2
- type: functional
- roles: employee
- destructive: no
- legacy: PBD_00

**Steps:**
1. Open the activity panel on the personal board.

**Expected:**
- Recent actions (from PERS-002…006) are listed with time and actor.

### PERS-008 · List view and filters
- priority: P2
- type: functional
- roles: employee
- destructive: no

**Steps:**
1. Switch to list view, then back to board view. Apply a priority/tag filter.

**Expected:**
- Same cards in both views; filter narrows both.

### PERS-009 · Personal goals form
- priority: P2
- type: functional
- roles: employee
- destructive: yes

**Steps:**
1. Open the personal goals modal from the board header; add a goal `{run} goal`; save.

**Expected:**
- Goal saved and visible; validation on empty fields.

**Cleanup:** Delete the goal.

### PERS-010 · Request tracker
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /personal/request-tracker
- destructive: no

**Steps:**
1. Open the request tracker. Open one request.

**Expected:**
- Title `Request Tracker - HQZen`; requests list shows status; detail opens.

### PERS-011 · Ticket tracker and ticket board
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /personal/ticket-tracker
- destructive: no

**Steps:**
1. Open `/personal/ticket-tracker` and `/personal/ticket-board`. Open a ticket you issued.

**Expected:**
- You see only tickets you issued or subscribe to; opening someone else's ticket by URL is denied (router checks issuer/subscriber).

### PERS-012 · Account information
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /personal/account-information
- destructive: yes

**Steps:**
1. Open account information. Change a harmless field (e.g. nickname or timezone) and save. Reload. Revert.

**Expected:**
- Title `Account Information - HQZen`; change persists; revert works.

### PERS-013 · My contracts list
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /personal/contracts
- destructive: no

**Steps:**
1. Open `/personal/contracts`; open one contract.

**Expected:**
- Contracts list loads; detail shows the contract document (PDF/HTML) and status.
