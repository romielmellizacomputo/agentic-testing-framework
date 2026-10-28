# Running tests from GitHub (manual trigger)

## One-time setup (repository owner)

1. **Create two GitHub Environments**: *Settings → Environments → New environment* → `develop`, then `staging`.
   Optional for `staging`: add yourself under *Required reviewers* so staging runs need a click to approve.
2. **Add the approver secrets to each environment** (*Environment → Add secret*):

   | Secret | Value |
   |---|---|
   | `AGT_APPROVER_EMAIL` | the standing approver account (the org executive used to approve/promote in flows) |
   | `AGT_APPROVER_PASSWORD` | its password |

   These are the **only** credentials the workflow uses. Every other account is created fresh during the run
   (business sign-up with a disposable mail.tm inbox) and exists only in memory while the job runs.
3. *Settings → Actions → General*: keep "Read repository contents" permissions (the workflows request only `contents: read`).

## Run it

*Actions → **E2E tests (manual)** → Run workflow* and choose:

| Input | Options | Notes |
|---|---|---|
| project | `hqzen` | more projects appear here as they get scripted specs |
| environment | `develop` / `staging` | develop and staging run the same code; start on develop |
| suite | `smoke` / `isolation` / `regression` / `full` | see below |
| run_on | `github` / `my-computer` | `github` = GitHub's machine (no window). `my-computer` = your PC, needs the runner open (see below) |
| show_browser | on/off | `my-computer` only: a real Chrome window opens on your screen, slowed down so you can follow |
| create_accounts | on/off | off = specs that need fresh accounts skip themselves |
| email_delivery | on/off | turn on only once the environment delivers email to the disposable domain |
| record_video | `off` / `failures` / `all` | videos to watch the flow afterwards (artifact "videos-…", kept 3 days). **Caution:** videos show real pages of the test environment, and in a public repository any signed-in GitHub user can download run artifacts. Prefer watching locally (below). |

GitHub's own machines have no screen. To **watch** a run you start from GitHub, choose `run_on: my-computer`.

## Watch GitHub runs in a real browser on your PC (`run_on: my-computer`)

GitHub sends the job to your own Windows PC (a *self-hosted runner*), and Chrome opens there.

**Once:**

1. Make sure Node.js 20+ and Google Chrome are installed.
2. Protect your PC (this repository is public): *Settings → Actions → General → Approval for running fork pull
   request workflows from contributors* → **Require approval for all external contributors**. Only the manual E2E
   workflow targets your PC; CI on pull requests always runs on GitHub's machines.
3. *Settings → Actions → Runners → New self-hosted runner → Windows*, and copy the token shown after `--token`.
4. In this folder run, and paste the token when asked (it is not shown or saved):

   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\runner\setup-windows.ps1
   ```

   This installs GitHub's official runner in `C:\agt-runner` (outside the repository) with the label `agt-local`.

**Each time:**

1. Start the runner and keep its window open: `C:\agt-runner\run.cmd` (it shows "Listening for Jobs").
2. GitHub → *Actions → E2E tests (manual) → Run workflow* → `run_on: my-computer`, `show_browser: on`.
3. Chrome opens and runs the flow; the results appear on the GitHub run page as usual. Close the runner window when done.

If the runner is not open, the job waits in the queue until you start it (or cancel the run).
The runner is deliberately not a Windows service: a service cannot show windows on your desktop.
To remove it: *Settings → Actions → Runners → (your runner) → Remove*, then delete `C:\agt-runner`.

| Suite | What it checks | Time |
|---|---|---|
| `smoke` | public pages, jobs portal, error pages, sign-in errors, approver sign-in/out, signed-out redirects, fresh executive account | ~2 min |
| `isolation` | two fresh executives A and B: B must be denied A's board, admin, departments, payrolls, partners, 201 files, recruitment, forms; signed-out denied; approver can oversee A | ~4 min |
| `regression` | fresh executive creates board/card; approver's key pages load with no **new** server errors | ~4 min |
| `full` | all of the above | ~10 min |

The job summary lists every test with ✅/❌/⏭️ and the reason for skips. Already-reported server errors
(`projects/hqzen/e2e/known-issues.json`) are listed separately and do not fail the run; any **new** 5xx fails it.

## What is (and is not) published

- Uploaded: `junit.xml` only (test names and pass/fail), kept 7 days.
- Never uploaded: screenshots, videos, traces, HTML reports, page content, created account credentials.
- The approver's email/password exist only as GitHub secrets and are masked in logs.

## Run the same thing on your computer (watch it or run in the background)

```bash
npm ci                     # once; uses your installed Google Chrome (or: npx playwright install chromium)
npm run e2e                # asks: project, environment, suite, mode
```

| Mode | Command | What you see |
|---|---|---|
| **watch** | `npm run e2e:watch` | a real Chrome window opens and you follow every click (slowed down; add `-- --slow 800` for slower) |
| **background** | `npm run e2e:background` | nothing opens; fastest; results in the terminal |
| **ui** | `npm run e2e:ui` | Playwright's test UI: pick tests, watch each step, replay the timeline, inspect the page at any step |

Skip the questions with flags: `node tools/e2e/run.mjs --project hqzen --env develop --suite isolation --mode watch`
(suite = `smoke`, `isolation`, `regression`, `full`, or a test id such as `ACC-001`).

The approver login comes from `AGT_APPROVER_EMAIL` / `AGT_APPROVER_PASSWORD` or the private
`projects/hqzen/config/accounts.local.json` (role `org_exec`). Extras: `AGT_ARTIFACTS=1` keeps screenshots/traces of
failures, `AGT_VIDEO=on` records videos (both stay on your computer). `npm run e2e:summary` prints the last run's summary.
