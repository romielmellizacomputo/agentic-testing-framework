# Playbook: test a merge request / pull request

Runs only the cases for the code that changed, plus the smoke safety net.

1. Deploy the branch to a test environment (or run it locally).
2. Set `APP_REPO` in `config/env.json` to your app checkout, then plan (read-only git):

```bash
node tools/plan-run.mjs --changed origin/main
# or, without git access:
node tools/plan-run.mjs --changed-files changed.txt
```

3. Read the PR description and diff. If it fixes a bug, write a case reproducing the original bug in `runs/<runId>/proposed-cases.md` and run it first. If it touches shared code (layout, auth, router, store), add `--suite smoke` for two more roles.
4. Execute, record, report (`AGENTS.md`).
5. Post the verdict, pass rate and failures table from `reports/<runId>/report.md` on the PR, linking `bugs/<runId>/` — only after a human approves posting.

Changed files that no module owns are printed by the planner; add them to a module's `source-paths`.
