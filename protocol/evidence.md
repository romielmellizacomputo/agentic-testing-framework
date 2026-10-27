# Evidence rules

Save evidence in `runs/<runId>/evidence/` as `<CASE-ID>-<role>-<label>.<ext>` and pass the names to `record.mjs --evidence a.png,b.txt`. The report copies them into `reports/<runId>/evidence/` and `bugs/<runId>/evidence/`.

| Status | Capture |
|---|---|
| pass | nothing (optional screenshot for P0) |
| fail / flaky | screenshot of the wrong state · console errors · failing request (method, URL without query string, status) |
| blocked | screenshot of what blocked you |
| needs_update | screenshot of the new UI + description in the note |

Before saving: crop or blur passwords, tokens, personal data and money amounts. Never save `Authorization`, `Cookie` or CSRF header values, and strip query strings that may contain tokens.
