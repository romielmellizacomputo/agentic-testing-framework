# Navigation shell (navbar, sidebar, search, notifications)

- module: navigation
- prefix: NAV
- source-paths: src/components/navbar/, src/components/sidebar/, src/components/hqzen-search/, src/components/notifications/, src/pages/notifications/, src/pages/root/, src/router/internal/global-modals/, src/router/internal/notifications/, src/router/index.js, src/store/notifications/, src/store/recent-access/, src/store/websocketSubscriptions.js
- legacy-markers: notifications_page, nav_bar, side_bar
- base-route: {ws}/

The frame around every signed-in page: company launcher, workforce switcher, sidebar menus, global search, notifications, global modals.

### NAV-001 · Company launcher switches company
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- destructive: no
- legacy: select_launcher_item

**Steps:**
1. Open the navbar launcher. Select the test company.
2. If the account belongs to more than one company, switch to another and back.

**Expected:**
- URL `company_id` changes to the selected company; sidebar and page content refresh for that company.
- No data from the previous company stays visible.

### NAV-002 · Workforce switcher
- priority: P0
- type: functional
- roles: org_exec, workforce_exec
- tags: smoke, regression
- destructive: no
- legacy: switch_to_workforce

**Steps:**
1. In the sidebar open the workforce switcher. Pick `DEFAULT_WORKFORCE`, then another workforce.

**Expected:**
- URL `workforce_id` changes; boards/people lists show the chosen workforce's data.
- workforce_exec only sees the workforces they are exec of.

### NAV-003 · Every sidebar menu item opens a working page
- priority: P0
- type: functional
- roles: org_exec, manager, supervisor, employee
- tags: smoke, regression, sweep
- destructive: no

**Steps:**
1. Expand every sidebar group. Click each item once.
2. For each page: wait for load, check title and console.

**Expected:**
- No item leads to 404/blank/infinite spinner.
- Page titles match `inventory/ROUTE_MAP.md`.
- Items shown match the role (e.g. employee sees no Administration). Record the full menu per role in the note — it feeds the RBAC cases.

### NAV-004 · Active menu state and breadcrumbs
- priority: P3
- type: ui
- roles: org_exec
- destructive: no

**Steps:**
1. Navigate to 5 different sidebar pages.

**Expected:**
- The current item is highlighted; breadcrumbs (where shown) are correct and clickable.

### NAV-005 · Global search finds people, boards and cards
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: no

**Steps:**
1. Open global search (navbar search icon / shortcut).
2. Search a known board name, a known person, and a card reference number.
3. Pick a result from each.

**Expected:**
- Results grouped by type; each opens the right page. Empty query or nonsense shows an empty state.

### NAV-006 · Notifications page and bell
- priority: P1
- type: functional
- roles: employee, org_exec
- tags: regression
- route: /notifications
- destructive: no
- legacy: test_notifications_page

**Steps:**
1. Click the bell; note unread count. Open one notification.
2. Open `/notifications`; use filters/tabs if present; mark one as read.

**Expected:**
- Clicking a notification opens the related item.
- Unread count decreases after reading; `/notifications` title `Notifications - HQZen`.

### NAV-007 · Real-time notification arrives without reload
- priority: P2
- type: e2e
- roles: org_exec, employee
- tags: nightly
- destructive: yes
- depends: BOARD-020

**Steps:**
1. In tab A sign in as employee and stay on any page.
2. In tab B (separate profile) as org_exec, mention the employee in a card comment (`@name`).

**Expected:**
- Within 15 s tab A shows a new notification (bell count or toast) without reload.

**Cleanup:** Delete the comment.

### NAV-008 · Recent access / quick links
- priority: P3
- type: functional
- roles: org_exec
- destructive: no

**Steps:**
1. Visit 3 boards. Open the recently-accessed list (if present in sidebar/home).

**Expected:**
- The 3 boards appear, most recent first.

### NAV-009 · Profile menu items
- priority: P2
- type: functional
- roles: employee
- destructive: no

**Steps:**
1. Open the avatar menu; click each item (profile, account information, help, release notes, sign out last).

**Expected:**
- Each item opens the right page; none 404.

### NAV-010 · Browser back/forward keeps state
- priority: P2
- type: functional
- roles: org_exec
- tags: regression
- destructive: no

**Steps:**
1. Board → open a card → milestones → Back → Back → Forward.

**Expected:**
- Each step shows the right page; the card panel reopens/closes as the URL dictates; no duplicate-navigation errors in console.

### NAV-011 · Card short link
- priority: P2
- type: functional
- roles: employee
- route: /card-:card_id
- destructive: no

**Steps:**
1. Copy a card's link from the card menu. Open it in a new tab.

**Expected:**
- Title `Card link - HQZen`; redirects to the board with that card open.

### NAV-012 · Global modals open from any page
- priority: P3
- type: functional
- roles: org_exec
- route: {ws}/board/:board_id
- destructive: no

**Steps:**
1. Trigger a global modal (e.g. add-fund modal via its menu if visible to the role) on two different pages.

**Expected:**
- Modal opens over the current page; closing it returns to the same page and URL.
