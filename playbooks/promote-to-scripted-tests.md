# Playbook: promote a stable case to a scripted test

Agent runs are flexible; scripted tests are cheap to repeat in CI. When a case has passed in 3+ runs without `needs_update`, script it.

1. Read 2–3 existing scripted tests in your app (Playwright, Cypress, Selenium...) and copy their structure, helpers and page objects.
2. Reuse existing helpers; add new ones in a separate draft file rather than rewriting shared code.
3. Save drafts under `scripted-drafts/` (gitignored by default if they contain app details) and put the case ID in the test name, e.g. `test('BOARD-017 private card join request', ...)`.
4. Add the new test's ID to the case's `legacy:` field so coverage stays linked.
