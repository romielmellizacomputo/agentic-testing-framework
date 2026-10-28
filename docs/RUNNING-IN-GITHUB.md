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
| create_accounts | on/off | off = specs that need fresh accounts skip themselves |
| email_delivery | on/off | turn on only once the environment delivers email to the disposable domain |

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

## Run the same thing locally

```bash
npm ci && npx playwright install chromium
export AGT_APPROVER_EMAIL=...  AGT_APPROVER_PASSWORD=...     # or use projects/hqzen/config/accounts.local.json (org_exec)
AGT_PROJECT=hqzen AGT_ENV=develop AGT_GREP=@smoke npx playwright test
AGT_HEADED=1 ...                      # watch the browser
AGT_ARTIFACTS=1 ...                   # keep screenshots/traces of failures (local only - they may contain real data)
node tools/e2e/summary.mjs            # Markdown summary of the last run
```
