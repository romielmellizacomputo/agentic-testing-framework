# Agentic Testing Framework

**Let any AI agent test your web app like a QA engineer — plain-Markdown test cases, real-browser runs, and ready-to-file bug reports.**

You write test cases in Markdown. An AI agent (Claude, Codex, Cursor, Gemini, or any agent that can drive a browser and run Node.js) plans a run, drives a real browser, records each result, and hands back a report with a clear verdict, JUnit XML for CI, and one ready-to-file bug per defect.

[![CI](https://github.com/romielmellizacomputo/agentic-testing-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/romielmellizacomputo/agentic-testing-framework/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%3E%3D20-blue) ![License: MIT](https://img.shields.io/badge/license-MIT-green)

---

## Why

- **Plain-Markdown test cases** — readable by people, followable by agents, with priority, roles, tags, data and cleanup.
- **Smart planning** — suites, tags, priorities, roles; **only the cases for files changed in a PR**; **sharding** across parallel agents with dependency chains kept together.
- **Real browser you can watch** — a visible Chrome window driven over a local-only port; agents sign in from private config without ever printing a password.
- **Permission and isolation sweeps** — every page × every role, to catch data leaks between users, teams and tenants.
- **Bugs you can file** — one per defect, duplicates grouped, concrete repro steps, evidence copied alongside.
- **CI-friendly** — JUnit XML, indexes of every run and every bug, a self-test that needs no browser.
- **Secure by default** — production blocked, destructive cases auto-skipped outside test envs, secret scanning, email masking, credentials only in gitignored files or CI secrets.
- **No lock-in** — small dependency-free Node scripts (only `playwright-core` for the optional browser driver). Any agent, any web stack.

## Quick start (2 minutes, no accounts needed)

Requires Node.js 20+ and Google Chrome.

```bash
git clone https://github.com/romielmellizacomputo/agentic-testing-framework.git
cd agentic-testing-framework
npm install
npm run selftest                       # checks the tool chain, no browser needed
node tools/plan-run.mjs --suite smoke  # plans the bundled TodoMVC demo run
node tools/browser/launch.mjs          # opens a visible test Chrome on the demo
```

Then open your AI agent **in this folder** and say:

> Follow AGENTS.md. Execute the latest run in the test Chrome using tools/browser/run.mjs, record every row with tools/record.mjs, then run tools/report.mjs and summarise the verdict.

Results: `reports/<runId>/report.md` and `bugs/<runId>/`.

### Run the HQZen suite

```bash
node tools/project.mjs use hqzen
node tools/init.mjs                    # first time: fill projects/hqzen/config/env.json + accounts.local.json
node tools/project.mjs status          # check environments and which roles have accounts
node tools/plan-run.mjs --suite smoke  # or --module boards, --suite hiring-e2e, --changed origin/staging
node tools/browser/launch.mjs
```

Then point your agent at `AGENTS.md` as above.

## Two ways to test

| | **Agentic runs** | **Scripted runs (Playwright)** |
|---|---|---|
| Who drives | an AI agent following Markdown test cases | Playwright specs, locally or in GitHub Actions |
| Where | `projects/<p>/test-cases/*.md` | `projects/<p>/e2e/*.spec.mjs` |
| Best for | broad coverage, exploratory testing, new features, UI that changes often | repeatable checks on every deploy: smoke, permissions/isolation, page health |
| Accounts | test accounts per role | **fresh accounts created during the run** + one approver from secrets |
| Output | `reports/<run>/`, `bugs/<run>/` | job summary + JUnit (`reports/e2e/`) |

Run scripted tests from GitHub with **Actions → E2E tests (manual) → Run workflow** (project, environment, suite;
`run_on: my-computer` opens a real Chrome window on your own PC),
or on your computer with `npm run e2e` — choose **watch** (a visible Chrome window), **background** (headless) or **ui** (step-by-step timeline).
Setup and secrets: **[docs/RUNNING-IN-GITHUB.md](docs/RUNNING-IN-GITHUB.md)**. What the app team can change to make tests stronger: **[docs/DEV-REQUESTS.md](docs/DEV-REQUESTS.md)**.

Test hosts are allowlisted in `tools/e2e/targets.mjs`: only **develop-hqzen** and **staging-hqzen** (plus localhost and the demo). Other projects' hosts must be enabled explicitly with `AGT_EXTRA_ALLOWED_HOSTS`, and production can never be added.

## Projects: test many apps from one repo

Every app under test is a **project** in `projects/<name>/` with its own test cases, roles, suites and config:

```
projects/
  hqzen/     HQZen: 289 agentic cases in 22 modules + 7 Playwright spec files (smoke, accounts, isolation, health)
  bposeats/  bposeats.com: core agentic cases + public-page spec (host not enabled by default)
  scalema/   scalema.com: core agentic cases + public-page spec (host not enabled by default)
  ministry/  ministry-vuejs (internal admin): core agentic cases (host not enabled by default)
  demo/      runnable TodoMVC example
  _template/ copied by `node tools/project.mjs new <name>`
```

```bash
node tools/project.mjs list           # projects (active one marked *)
node tools/project.mjs use hqzen      # switch the active project
node tools/project.mjs new myapp      # add another app
node tools/init.mjs                   # create the active project's PRIVATE config
node tools/project.mjs status         # what is configured (never shows secrets)
```

**What is public and what stays private** — only test cases, roles and `*.example.*` files are committed. Each project's real environment URLs (`config/env.json`), test accounts (`config/accounts.local.json`), route inventory and every run/report/bug stay on your machine: they are gitignored **and** blocked by the secret scanner, so they cannot be committed by accident. In CI, pass accounts as secrets (`AGT_ACCOUNT_<ROLE>_EMAIL` / `_PASSWORD`).

To set up a new app, follow **[playbooks/onboard-your-app.md](playbooks/onboard-your-app.md)**.

## How it works

```
test-cases/*.md ──► plan-run.mjs ──► runs/<id>/plan.json
                                         │  agent drives the browser
                                         ▼
                    record.mjs ──► runs/<id>/results.json (+ evidence)
                                         │
                                         ▼
                    report.mjs ──► reports/<id>/report.md · junit.xml
                                   bugs/<id>/<defect>.md
                                   reports/INDEX.md · bugs/INDEX.md
```

| Command | Purpose |
|---|---|
| `node tools/project.mjs list\|use\|new\|status` | Manage the apps under test |
| `node tools/plan-run.mjs --suite smoke` | Plan a run (`--project`, `--module`, `--tags`, `--priority`, `--role`, `--changed <ref>`, `--shard k/n`, `--dry`) |
| `node tools/status.mjs latest` | Progress and next rows |
| `node tools/record.mjs latest <ROW> <status> [...]` | Record a result (`--note`, `--sev`, `--evidence`, `--bug-title`, `--repro`, `--same-as`) |
| `node tools/record-batch.mjs latest results.json` | Record many results |
| `node tools/report.mjs latest` | Build report, JUnit, bug files and indexes |
| `node tools/sweep-urls.mjs latest pages\|rbac --role r` | Resolve every route into URLs for sweeps |
| `node tools/browser/launch.mjs` · `login.mjs <role>` · `visit.mjs <paths>` · `run.mjs -e "<code>"` | Visible test browser |
| `node tools/validate-cases.mjs` | Check test-case files |
| `node tools/check-secrets.mjs` | Scan for credentials and personal data |
| `node tools/install-hooks.mjs` | Pre-commit hook: secret scan + validation |
| `npm run selftest` | End-to-end tool-chain check |

Optional adapters: `tools/adapters/vue-router-routes.mjs` (route inventory from Vue Router) and `tools/adapters/component-inventory.mjs` (components vs. unit tests, any JS/TS stack).

## Repository layout

```
AGENTS.md              agent operating manual (start here)
projects/<name>/       one folder per app: config/*.example.*, test-cases/, suites/, inventory/
examples/test-cases/   reusable templates: auth, permissions & isolation, quality sweeps
suites/                shared suites: smoke, regression, rbac, nightly (projects can add their own)
protocol/              run protocol, safety rules, evidence, bug template, known noise
playbooks/             onboarding, PR testing, exploratory, parallel agents, unit-test gaps
prompts/               copy-paste prompts
tools/                 planner, recorder, reporter, browser driver, security tools, adapters
runs/ reports/ bugs/   generated output (gitignored by default)
```

## Security

Read **[SECURITY.md](SECURITY.md)** and **[protocol/safety-rules.md](protocol/safety-rules.md)**. In short: test accounts only, never production, credentials only in gitignored files or CI secrets, run outputs stay out of public repos, and `npm run check-secrets` before you push.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## License

[MIT](LICENSE)
