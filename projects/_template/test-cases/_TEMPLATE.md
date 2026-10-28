# Module title (files starting with "_" are ignored by the tools)

- module: my-module
- prefix: MYMOD
- source-paths: src/features/my-module/, src/api/my-module/
- legacy-markers: -
- base-route: /my-module

One paragraph: what this area of the app does and anything an agent should know before testing it.

### MYMOD-001 · What the user can do, in one line
- priority: P0
- type: functional
- roles: member
- tags: smoke, regression
- route: /my-module
- destructive: no

**Preconditions:** What must be true before starting.

**Data:** name = `{run} example`

**Steps:**
1. First action.
2. Second action.

**Expected:**
- Observable result 1.
- Observable result 2 (also after reload).

**Cleanup:** How to undo anything the steps created.
