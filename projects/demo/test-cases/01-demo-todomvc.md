# Demo: TodoMVC

- module: demo-todomvc
- prefix: TODO
- source-paths: examples/demo-app/
- legacy-markers: -
- base-route: /#/

A runnable example against the public demo at https://demo.playwright.dev/todomvc/ (data lives in the browser's localStorage, so it is safe to create and delete). Replace this module with your own app's modules.

### TODO-001 · App loads with an empty list
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression
- route: /#/
- destructive: no

**Preconditions:** Fresh browser profile or cleared localStorage for the demo host.

**Steps:**
1. Open the base URL.

**Expected:**
- Heading "todos" is visible.
- The input with placeholder "What needs to be done?" is focused or focusable.
- No list items and no footer are shown.
- No console errors.

### TODO-002 · Add a todo
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression, crud
- route: /#/
- destructive: yes

**Data:** text = `{run} buy milk`

**Steps:**
1. Type the text into "What needs to be done?" and press Enter.
2. Reload the page.

**Expected:**
- The item appears in the list; the counter shows "1 item left".
- The input is cleared after Enter.
- After reload the item is still there (persisted).

**Cleanup:** Delete the item (hover → ×).

### TODO-003 · Empty or whitespace-only input is ignored
- priority: P1
- type: validation
- roles: anonymous
- tags: regression
- route: /#/
- destructive: no

**Steps:**
1. Press Enter in the empty input.
2. Type three spaces and press Enter.

**Expected:**
- No item is created in either case.

### TODO-004 · Complete and un-complete a todo
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression
- route: /#/
- destructive: yes

**Data:** text = `{run} write report`

**Steps:**
1. Add the item. Tick its checkbox.
2. Untick it.

**Expected:**
- When ticked the item is styled completed and the counter shows "0 items left".
- When unticked the counter returns to "1 item left".

**Cleanup:** Delete the item.

### TODO-005 · Edit a todo by double-click
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /#/
- destructive: yes

**Data:** text = `{run} draft`, new text = `{run} final`

**Steps:**
1. Add the item. Double-click its label, replace the text with the new text, press Enter.
2. Double-click again, press Escape after typing more characters.

**Expected:**
- Enter saves the new text.
- Escape cancels the edit and keeps the saved text.

**Cleanup:** Delete the item.

### TODO-006 · Filters: All, Active, Completed
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /#/active
- destructive: yes

**Data:** `{run} a`, `{run} b` (complete `b`)

**Steps:**
1. Add both items and complete `b`.
2. Click **Active**, then **Completed**, then **All**. Reload on `/#/completed`.

**Expected:**
- Active shows only `a`; Completed shows only `b`; All shows both.
- The selected filter is highlighted and survives reload (URL hash).

**Cleanup:** Click **Clear completed**, then delete `a`.

### TODO-007 · Clear completed
- priority: P2
- type: functional
- roles: anonymous
- tags: regression
- route: /#/
- destructive: yes

**Steps:**
1. Add two `{run}` items, complete one, click **Clear completed**.

**Expected:**
- Only the completed item is removed; the button disappears when nothing is completed.

**Cleanup:** Delete the remaining item.

### TODO-008 · Text is escaped (no script execution)
- priority: P1
- type: security
- roles: anonymous
- tags: regression, security
- route: /#/
- destructive: yes

**Data:** text = `{run}<img src=x onerror=alert(1)>`

**Steps:**
1. Add an item with the data.

**Expected:**
- The text is shown literally; no alert dialog and no broken-image element are created.

**Cleanup:** Delete the item.

### TODO-009 · Console and network sweep
- priority: P2
- type: ui
- roles: anonymous
- tags: nightly, sweep
- route: /#/
- destructive: no

**Steps:**
1. Visit `/#/`, `/#/active`, `/#/completed` and record console errors and failed requests.

**Expected:**
- No uncaught errors; no responses with status >= 400.

### TODO-010 · Mobile layout
- priority: P3
- type: ui
- roles: anonymous
- tags: nightly, responsive
- route: /#/
- destructive: no

**Steps:**
1. Use a 375×812 viewport. Add an item with a 200-character `{run}` text.

**Expected:**
- No horizontal scroll; long text wraps; controls stay usable.

**Cleanup:** Delete the item.
