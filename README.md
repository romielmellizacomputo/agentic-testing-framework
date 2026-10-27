# Agentic Testing Framework

**Let any AI agent test your web app like a QA engineer — plain-Markdown test cases, real-browser runs, and ready-to-file bug reports.**

You write test cases in Markdown. An AI agent (Claude, Codex, Cursor, Gemini, or any agent that can drive a browser and run Node.js) plans a run, drives a real browser, records each result, and hands back a report with a clear verdict, JUnit XML for CI, and one ready-to-file bug per defect.

[![CI](https://github.com/romielmellizacomputo/agentic-testing-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/romielmellizacomputo/agentic-testing-framework/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue) ![License: MIT](https://img.shields.io/badge/license-MIT-green)

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

Requires Node.js 18+ and Google Chrome.

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

## Use it on your app

```bash
node tools/init.mjs     # creates private config: env.json, accounts.local.json, roles.md (all gitignored)
```

Then follow **[playbooks/onboard-your-app.md](playbooks/onboard-your-app.md)**: set environments and login selectors, describe roles, add one test account per role, copy the templates from `examples/test-cases/`, and run a smoke suite.

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
| `node tools/plan-run.mjs --suite smoke` | Plan a run (`--module`, `--tags`, `--priority`, `--role`, `--changed <ref>`, `--shard k/n`, `--dry`) |
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
config/                *.example files — your real config is gitignored
test-cases/            your test cases (ships with a runnable TodoMVC demo + _TEMPLATE.md)
examples/test-cases/   reusable templates: auth, permissions & isolation, quality sweeps
suites/                smoke, regression, rbac, nightly
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
