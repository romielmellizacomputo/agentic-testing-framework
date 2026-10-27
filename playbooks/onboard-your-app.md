# Playbook: onboard your app (about 30 minutes)

1. `npm install` and `node tools/init.mjs` — creates the private, gitignored `config/env.json`, `config/accounts.local.json` and `config/roles.md`.
2. **Environments** — in `config/env.json` list your test environments (local, dev, staging). Keep `production` in `NEVER_RUN_ON`. Set `ALLOW_DESTRUCTIVE_ON` to environments where creating/deleting test data is fine.
3. **Login** — set `LOGIN.path`, `usernameSelector`, `passwordSelector`, `submitText` to match your sign-in page.
4. **Roles and accounts** — describe your roles and the access table in `config/roles.md`. Create one dedicated test account per role and put it in `accounts.local.json` (or CI secrets as `AGT_ACCOUNT_<ROLE>_EMAIL/_PASSWORD`).
5. **Route aliases** — if many URLs share a prefix (e.g. `/org/:org_id/team/:team_id`), add `"ROUTE_ALIASES": { "{team}": "/org/:org_id/team/:team_id" }` and write routes as `{team}/settings`.
6. **Route inventory (optional, recommended)** — `inventory/routes.json` powers the URL sweeps:
   - Vue Router: `node tools/adapters/vue-router-routes.mjs --repo <app> --entry src/router/index.js`
   - Anything else: write `{"routes":[{"url":"/path/:id","title":"Page title","area":"billing"}]}` by hand or have an agent generate it from your router.
7. **Test cases** — copy `examples/test-cases/*.md` into `test-cases/`, delete `01-demo-todomvc.md`, and write one module per feature area from `test-cases/_TEMPLATE.md`. Ask an agent: *"Read the app's routes and pages and draft test cases for module X in protocol/test-case-format.md"*. Then `node tools/validate-cases.mjs`.
8. **Smoke run** — `node tools/plan-run.mjs --suite smoke`, follow `AGENTS.md`, finish with `node tools/report.mjs latest`.
9. **Protect the repo** — `node tools/install-hooks.mjs` adds a pre-commit secret scan. Keep run outputs out of public repos.
