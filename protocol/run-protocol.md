# Run protocol

## Before the run

1. `TARGET_ENV` in `config/env.json` decides the base URL. Confirm it loads. If not, stop and report the environment as down.
2. `node tools/status.mjs <runId>` lists the roles the plan needs and which have no account.
3. Use a separate browser profile (e.g. `node tools/browser/launch.mjs`), never your personal one.

## Login

Sign in through the UI like a user: `node tools/browser/login.mjs <role>` does this from your config without printing the password.
After signing in, save the IDs you see in URLs into `runs/<runId>/context.json` so URL templates can be filled:

```json
{ "admin": { "org_id": "12", "team_id": "34" }, "member": { "org_id": "12", "team_id": "34", "user_id": "567" } }
```

Switching role = sign out, clear cookies/storage, sign in as the next role (`login.mjs` does this).

## Executing

- Follow the **Steps** in order. If a label changed slightly, use the obvious equivalent and say so in the note.
- Wait for network idle and spinners to finish (max ~15 s). Avoid fixed long sleeps.
- Find elements by visible text, ARIA role/name or placeholder, not brittle CSS paths.
- After anything that saves, reload and confirm it persisted.

## Deciding the status

| Situation | Status |
|---|---|
| Every Expected bullet and implicit expectation holds | `pass` |
| The product misbehaves | `fail` + `--sev S1..S4` |
| Failed, then passed on one clean retry | `flaky` (note the first failure) |
| Works, but the case's steps/labels are outdated | `needs_update` (describe the new flow) |
| Can't start: missing data/account/permission, env down, dependency failed | `blocked` |
| Not allowed here (destructive on a protected env) or not applicable | `skipped` |

Severity: **S1** data loss, security/permission leak, crash of a core flow, can't log in · **S2** core feature broken, no workaround · **S3** works with a workaround, wrong message, broken layout · **S4** cosmetic.

## After the run

1. For every `fail`, make the bug filable: `--bug-title` (the defect, not the case name) and `--repro` (exact URLs and roles, no passwords). Record extra rows with the same root cause using `--same-as <primary row>`.
2. Put run-level notes (account problems, leftover data, open questions) in `runs/<runId>/run-notes.md`.
3. `node tools/report.mjs <runId>` → `reports/<runId>/`, `bugs/<runId>/`, and both `INDEX.md` files.
4. Run each case's **Cleanup**; search the app for the data prefix to confirm nothing remains. List anything you could not remove in `run-notes.md`.
5. New findings with no case go into `runs/<runId>/proposed-cases.md`.
