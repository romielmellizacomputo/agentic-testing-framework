# Quality sweeps (template)

- module: quality
- prefix: QUAL
- source-paths: src/components/, src/styles/, index.html, package.json
- legacy-markers: -
- base-route: /

One case walks many pages and catches the bugs nobody wrote a case for. Get the URL list with `node tools/sweep-urls.mjs <runId> pages --role <role>`, then use `node tools/browser/visit.mjs <paths...>`.

### QUAL-001 · Console and network error sweep
- priority: P0
- type: ui
- roles: admin, member
- tags: smoke, sweep, nightly
- destructive: no

**Steps:**
1. Open every URL in the sweep list; record console errors and failed requests.

**Expected:**
- Zero uncaught errors and zero 5xx (ignore `protocol/known-noise.md`). Note `url | error | count`.

### QUAL-002 · Page titles
- priority: P2
- type: ui
- roles: admin
- tags: sweep, nightly
- destructive: no

**Steps:**
1. During QUAL-001 compare `document.title` with the expected title in `inventory/routes.json`.

**Expected:**
- Titles match; empty titles and typos are sev:S4.

### QUAL-003 · Mobile layout
- priority: P1
- type: ui
- roles: member
- tags: responsive, nightly
- destructive: no

**Steps:**
1. At 375×812 open the 10 most used pages.

**Expected:**
- No horizontal scroll; navigation reachable; dialogs fit; tap targets ≥ 40 px.

### QUAL-004 · Keyboard and screen-reader basics
- priority: P2
- type: a11y
- roles: anonymous, member
- tags: a11y, nightly
- destructive: no

**Steps:**
1. On login and 4 key forms, tab through with the keyboard only; read the accessibility tree.

**Expected:**
- Inputs labelled, buttons named, focus visible and ordered, dialogs trap focus and close with Esc, images have alt text.

### QUAL-005 · Performance budget
- priority: P2
- type: performance
- roles: member
- tags: performance, nightly
- destructive: no

**Steps:**
1. Hard-reload 5 key pages; read `performance.getEntriesByType('navigation')` and LCP.

**Expected:**
- Usable in < 4 s on the test environment. Record numbers even on pass.

### QUAL-006 · Double-submit protection
- priority: P2
- type: functional
- roles: member
- tags: nightly
- destructive: yes

**Steps:**
1. Double-click the submit button of 3 create forms.

**Expected:**
- Exactly one record is created.

**Cleanup:** Remove the `{run}` records.
