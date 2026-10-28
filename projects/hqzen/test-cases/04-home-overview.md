# Home, overview & getting started

- module: home
- prefix: HOME
- source-paths: src/components/home/, src/components/overview/, src/components/onboarding/, src/components/screenshots/, src/pages/home/, src/pages/overview/, src/pages/onboarding/, src/router/internal/overview/, src/router/internal/initial-onboarding/, src/store/overviews/, src/store/onboarding/
- legacy-markers: home_page, O_ORG, ADMIN_ST_EI
- base-route: /home/home-page

### HOME-001 · Home page widgets load
- priority: P0
- type: functional
- roles: org_exec, employee
- tags: smoke, regression
- route: /home/home-page
- destructive: no
- legacy: home_page_test_data

**Steps:**
1. Open `/home/home-page`.

**Expected:**
- Title `Home - HQZen`. Every widget finishes loading (no endless skeletons) or shows an empty state.
- Numbers/counts are numbers (no `NaN`/`undefined`).

### HOME-002 · Home links go to the right place
- priority: P1
- type: functional
- roles: employee
- tags: regression
- route: /home/home-page
- destructive: no

**Steps:**
1. Click each "view all"/card/shortcut on the home page and come back.

**Expected:**
- Each target page loads and matches the widget it came from (e.g. pending forms → Forms pending tab).

### HOME-003 · Overview page (new business user)
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: /home/overview-page
- destructive: no

**Steps:**
1. Open `/home/overview-page` and `/home/workforce-page`.

**Expected:**
- Titles `Overview - HQZen` and `Workforce`; content loads.

### HOME-004 · Executive overview dashboard
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: {ws}/overview/:employment_id/executive
- destructive: no

**Steps:**
1. Open the executive overview. Change the date range / filters available.

**Expected:**
- Charts and tables load; changing filters changes data; no console errors from chart libraries.

### HOME-005 · Attendance overview
- priority: P1
- type: functional
- roles: org_exec, supervisor
- tags: regression
- route: {ws}/overview/:employment_id/overview-attendance
- destructive: no

**Steps:**
1. Open attendance overview; switch day/week if available; open one partner row.

**Expected:**
- Title `Overviews - HQZen`; totals match the rows shown; partner link opens partner details.

### HOME-006 · Screenshots and activities
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/overview/:employment_id/screenshots-and-activities
- destructive: no
- legacy: ADMIN_ST_EI_01, ADMIN_ST_EI_02

**Steps:**
1. Open the page, pick a partner and a date that has activity.
2. Open one screenshot full size.

**Expected:**
- Screenshots load as images with timestamps; activity list matches the date.

### HOME-007 · Incident reports overview
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/overview/:employment_id/incident-reports
- destructive: no
- legacy: O_ORG_52

**Steps:**
1. Open incident reports overview. Filter by date range. Open a department.

**Expected:**
- Department page title `Department Incident Reports - HQZen`; counts consistent with the overview.

### HOME-008 · Getting started checklist
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/getting-started
- destructive: no

**Steps:**
1. Open getting started. Click each step's action (do not complete it).

**Expected:**
- Title `Getting Started - HQZen`; each step's link opens the right page; completed steps show as done.
