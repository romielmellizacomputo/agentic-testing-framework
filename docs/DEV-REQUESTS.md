# Requests to the development team

Small changes in the apps that make automated and agentic testing reliable. Ordered by impact.

## 1. Let test environments deliver email to a disposable domain (unblocks applicant & employee flows)
**Today:** on develop, business sign-up works without email, but applicant sign-up (job "Apply now") and
employee invites need an emailed link/code, and no email reaches external disposable inboxes.
**Ask (any one):**
- Allow outbound mail on develop/staging to the mail.tm domains (the framework creates a private inbox per account), **or**
- Add a test-only endpoint on develop/staging that returns the latest verification code/link for an address
  matching `^agt[a-z0-9]+@` (protected by a shared secret header), **or**
- Auto-verify accounts whose email matches the test pattern on develop/staging only.

Then run the workflow with `email_delivery: on`; `07-hiring.spec.mjs` and `ACC-003` start running.

## 2. Unverified business accounts cannot create boards
"New board" is disabled until email verification. Either allow it on test environments or deliver the
verification email (request 1). Until then `BOARD-002`/`BOARD-012` skip with that reason.

## 3. Stable selectors
Add `data-testid` attributes to primary actions and forms used in core flows (sign-in, sign-up, new board,
add card, job posting, apply, offer, leave request, approve/reject). Example: `data-testid="board-new"`.
Specs prefer visible text today; test ids make them immune to copy changes and translations.

## 4. Fix scoped-permission checks (security)
Pages under `/company/:id/workforce/:wid/...` must check "executive **of this workforce**", not the global
`is_workforce_exec` flag. The isolation suite (`04-isolation.spec.mjs`) checks two fresh executives of
different workforces (passes on develop: the outsider is redirected to their own workforce). The risky case
is a user who is a **regular member** of workforce A and an executive of workforce B; reproducing it with
fresh accounts needs an employee invite into A, which needs email delivery (request 1).

## 5. Known server errors
See `projects/hqzen/e2e/known-issues.json` (5xx on resignation, todo, executive overview widgets,
timelog list, staff counts, admin lists). Remove an entry when fixed - the suite then guards against regressions.

## 6. Test-data cleanup
Each run creates workforces named `AGT-<run>`. A protected cleanup endpoint (or a nightly job) that archives
`AGT-*` workforces older than 7 days on develop/staging would keep the environments tidy.
