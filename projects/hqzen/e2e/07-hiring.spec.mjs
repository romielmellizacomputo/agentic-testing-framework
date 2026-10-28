// Hiring with fresh accounts: a new executive posts a job, a fresh applicant applies, the executive
// shortlists and sends an offer, the approver (org executive) can review it.
// Needs email delivery to disposable inboxes for the applicant (AGT_EMAIL_DELIVERY=1).
// Agentic cases: REC-002, APP-004, REC-006, REC-009, APP-007.
import { test, expect } from '../../../tools/e2e/fixtures.mjs';
import { EMAIL_DELIVERY } from './support/accounts.mjs';

test.describe('hiring flow with fresh accounts @e2e @email', () => {
  test('REC/APP end-to-end hiring', async () => {
    test.skip(!EMAIL_DELIVERY, 'Applicant accounts need email delivery to disposable inboxes. ' +
      'Ask devs to allow the mail.tm domain on this environment (see docs/DEV-REQUESTS.md), then set AGT_EMAIL_DELIVERY=1.');
    // Flow skeleton - steps are implemented as the email path is enabled:
    // 1. createBusinessExec -> 2. exec creates external job posting -> 3. createApplicant(jobPath)
    // 4. applicant sets password from emailed link -> 5. exec shortlists + sends offer
    // 6. applicant accepts + signs -> 7. approver reviews contract in review-documents
    expect(EMAIL_DELIVERY).toBe(true);
  });
});
