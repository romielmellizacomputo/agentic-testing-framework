# Ready-to-paste prompts

Open your AI agent **in this repository** with a browser tool (or use the bundled test Chrome), then paste one of these.

## Try the demo
```
Follow AGENTS.md. Run: node tools/plan-run.mjs --suite smoke
Open the test browser with node tools/browser/launch.mjs and execute every row with tools/browser/run.mjs.
Record each result with tools/record.mjs, then run tools/report.mjs latest and give me the verdict and failures.
```

## Smoke test after a deploy
```
Follow AGENTS.md and protocol/safety-rules.md. Target env: staging.
Plan with --suite smoke, sign in per role with tools/browser/login.mjs, execute, record, report.
Give me the verdict, pass rate and the bugs/INDEX.md table.
```

## Test my pull request
```
Follow AGENTS.md and playbooks/merge-request-testing.md. The branch is deployed on dev; base is origin/main.
Plan with --changed origin/main, execute, report, then spend 15 minutes on playbooks/exploratory.md for the selected modules.
```

## Permissions audit
```
Follow AGENTS.md. Plan with --suite rbac. For each role generate URLs with tools/sweep-urls.mjs <runId> rbac --role <role>
and open each one. Any page or API a role should not reach but does is a sev:S1 fail with --bug-title and --repro.
```

## Draft test cases for my app
```
Read playbooks/onboard-your-app.md and protocol/test-case-format.md. Using the app's routes (inventory/routes.json)
and what you see in the browser, draft a test-case module for <area> in test-cases/, then run tools/validate-cases.mjs.
Do not include real names, emails or URLs other than the configured environments.
```

## Parallel regression (agent N of 4)
```
Follow AGENTS.md and playbooks/parallel-agents.md. Run: node tools/plan-run.mjs --suite regression --shard N/4
Use AGT_CDP_PORT=933N for your own test browser. Execute, record, report.
```
