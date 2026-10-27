# Test case format

Test cases are Markdown files in `test-cases/` (files starting with `_` are ignored). Tools parse them, so keep the format exact, and run `node tools/validate-cases.mjs` after editing.

## Module header

```markdown
# Boards

- module: boards
- prefix: BOARD
- source-paths: src/components/board/, src/api/boards/
- legacy-markers: -
- base-route: /boards/:board_id

Optional free text describing the module.
```

- `source-paths` — repo paths this module owns. `plan-run.mjs --changed <ref>` uses them to select cases for a merge request.
- `legacy-markers` — IDs of existing scripted tests (Selenium, Cypress, Playwright...) covering the same area, or `-`.

## One case

```markdown
### BOARD-003 · Create a card in a column
- priority: P0
- type: functional
- roles: admin, member
- tags: smoke, crud
- route: /boards/:board_id
- destructive: yes

**Preconditions:** A board you are a member of exists.

**Data:** title = `{run} card`

**Steps:**
1. Open the board.
2. Click **Add card**, type the title, press Enter.

**Expected:**
- The card appears in the column.
- After reload the card is still there.

**Cleanup:** Archive the card.
```

| Field | Required | Values |
|---|---|---|
| ID | yes | `<PREFIX>-<3 digits>`, unique, never reused |
| priority | yes | `P0` must work for a release · `P1` core · `P2` normal · `P3` nice to have |
| type | yes | `functional`, `negative`, `rbac`, `validation`, `ui`, `a11y`, `performance`, `security`, `e2e` |
| roles | yes | role keys from `config/roles.md`; each role is a separate run of the case (see `multi-actor`) |
| tags | no | free list; `smoke`, `regression`, `rbac`, `nightly` feed the suites |
| route | no | URL template; `{alias}` shorthands come from `ROUTE_ALIASES` in `config/env.json` |
| destructive | yes | `yes` if it creates/changes/deletes data |
| legacy | no | IDs of matching scripted tests |
| depends | no | case IDs that must pass first |
| multi-actor | no | `yes` = the roles act together in one flow (one plan row). `type: e2e` is multi-actor automatically |

`{run}` in data means the run's data prefix (e.g. `AGT-20260101-1200`) so everything created is easy to find and delete.
