# Playbook: close unit-test gaps

1. `node tools/adapters/component-inventory.mjs --repo <app>` lists component files and which have a matching `*.spec.*` / `*.test.*`.
2. Pick small, untested components used by P0 flows. Read two existing tests in the app to copy its style (imports, mounting, mocks).
3. Write drafts under `unit-drafts/`, mirroring the app path, e.g. `unit-drafts/src/components/Button/__tests__/Button.spec.js`.
4. Run them against a throwaway copy (the app repo is only read):

```bash
APP_REPO=~/my-app bash tools/unit-sandbox.sh Button
APP_REPO=~/my-app TEST_CMD="npx vitest run" bash tools/unit-sandbox.sh
```

5. List passing drafts in `runs/<runId>/run-notes.md`. A developer copies them into the app on a branch.
