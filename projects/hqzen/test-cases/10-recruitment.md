# Recruitment (employer side)

- module: recruitment
- prefix: REC
- source-paths: src/pages/recruitment/, src/pages/job-postings/, src/pages/applicants/, src/pages/posting/, src/components/employers/, src/pages/employers/, src/store/recruitment/, src/store/recruitment-notes/, src/store/posting/, src/store/job-offer/, src/store/negotiation/, src/store/interview-rounds/, src/store/campaign/, src/store/hr-onboarding/, src/router/internal/recruitment/, src/router/internal/job-application/, src/router/internal/applicants/, src/router/internal/employers/
- legacy-markers: RBA, RBB, RBC, RBD, RBE, RBF, RBV_OEA, RBV_OEB, RBV_OEC, REC_SSIA, REC_SSIB, REC_SSIC, RN, JO_ONBCA, JOWU_CHA, JOWU_CHB, JOWU_JBB, JOWU_JOEA, JOWU_EHM, CAW_REC, JB_SSI
- base-route: {ws}/recruitment

End-to-end hiring: posting → applications → shortlist → interview → offer → contract. Pair with module `applicant` for the applicant's side.

### REC-001 · Recruitment board loads
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: {ws}/recruitment
- destructive: no
- legacy: RBA_00, RBA_01

**Steps:**
1. Open Recruitment from the sidebar.

**Expected:**
- Title `Recruitment`; job postings and pipeline columns render.

### REC-002 · Create an external job posting
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression, crud
- destructive: yes
- legacy: RBB_00, RBB_01

**Data:** title = `{run} Customer Support Rep`

**Steps:**
1. Create a job posting with the data, a description, salary range, location, and external visibility. Publish.

**Expected:**
- Posting appears on the recruitment board and, within a minute, on public `/jobs` (search the title).

### REC-003 · Save and resume a draft posting
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/recruitment/create-draft-job-posting/:draft_job_posting_pk
- destructive: yes

**Steps:**
1. Start a new posting `{run} draft`, fill half, leave the page. Reopen the draft.

**Expected:**
- Title `Draft Job Posting - HQZen`; entered values preserved.

### REC-004 · Job posting validation
- priority: P2
- type: validation
- roles: org_exec
- destructive: no

**Steps:**
1. Try to publish with empty title, salary min > max, and a past closing date.

**Expected:**
- Each is blocked with a clear message.

### REC-005 · Applications on a posting
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- route: {ws}/recruitment/posting/:job_posting_pk
- destructive: no
- legacy: RBC_10, RBD_02

**Preconditions:** The posting has at least one application (APP-004 creates one).

**Steps:**
1. Open the posting. Open an applicant. View their resume.

**Expected:**
- Title `Job Posting - HQZen`; applicant profile and resume render (PDF preview works).

### REC-006 · Shortlist an applicant
- priority: P0
- type: functional
- roles: org_exec
- tags: smoke, regression
- destructive: yes
- legacy: REC_SSIA_00

**Steps:**
1. Move the `{run}` application to **Shortlisted**.

**Expected:**
- Card moves column; applicant gets a status update (APP-005).

### REC-007 · Schedule an interview
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: REC_SSIC_02, REC_SSIC_03, JB_SSI_00

**Steps:**
1. Schedule an interview for the shortlisted applicant for tomorrow 10:00 in the account's timezone.

**Expected:**
- Appears under Scheduled Interview with the right date/time and timezone label; applicant sees it.

**Cleanup:** Cancel the interview if REC-009 will not run next.

### REC-008 · Recruitment notes with formatting
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: RN_01, RN_02, RN_03, RN_04

**Steps:**
1. Add a note with a bulleted list where one bullet has **bold**, *italic* and underline. Save; edit; delete.

**Expected:**
- Formatting inside bullets is preserved after save and reload.

### REC-009 · Send a job offer (with NDA)
- priority: P0
- type: e2e
- roles: org_exec
- tags: smoke, regression
- route: {ws}/recruitment/send-job-offer/:job_posting_pk/career-setup
- destructive: yes
- legacy: RBC_09, REC_SSIB_01, JOWU_JBB_00

**Steps:**
1. From the shortlisted applicant click **Send job offer**. Fill career setup (policy, salary, start date). Attach an NDA template. Send.

**Expected:**
- Title `Send Job Offer - HQZen`; offer listed with status *sent*; applicant receives it (APP-006).

### REC-010 · Edit and cancel a job offer
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: JOWU_JOEA_00, RBE_02

**Steps:**
1. Edit the offer salary. Then cancel the offer with a reason.

**Expected:**
- Edits visible to applicant; cancelled offer shows *cancelled* on both sides.

### REC-011 · Negotiation / counter-offer chat
- priority: P1
- type: e2e
- roles: org_exec
- tags: regression
- route: {ws}/recruitment/chats
- destructive: yes
- legacy: JOWU_CHA_02, JOWU_CHA_06, JOWU_CHB_02
- depends: APP-008

**Steps:**
1. Open Chats. Reply to the applicant's negotiation message. Send a counter offer.

**Expected:**
- Title `Chats - HQZen`; messages in order; counter offer updates the offer amount.

### REC-012 · Reject, remove and reconsider applications
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: RBC_22, RBF_00

**Steps:**
1. Reject an application; reconsider it; remove another.

**Expected:**
- Statuses update correctly; removed application gone from the board.

### REC-013 · Close and reopen a posting
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- destructive: yes
- legacy: RBC_21

**Steps:**
1. Close `{run} Customer Support Rep`. Check public `/jobs`. Reopen.

**Expected:**
- Closed posting not on public jobs; reopened one comes back.

### REC-014 · Review documents (contracts) after acceptance
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/recruitment/review-documents
- destructive: yes
- legacy: CAW_REC_01
- depends: APP-007

**Steps:**
1. Open review documents; open the accepted applicant's contract details; approve per the workflow.

**Expected:**
- Title `Contracts - HQZen` / `Contracts Details - HQZen`; status moves forward in the approval workflow.

**Cleanup:** Note the contract id in the run notes so a human can void it on staging.

### REC-015 · Recruitment & job-posting permissions
- priority: P1
- type: rbac
- roles: org_exec, recruiter, job_posting_access
- tags: rbac, regression
- route: {ws}/recruitment/permissions
- destructive: yes
- legacy: RBV_OEA_00, RBV_OEB_03, RBV_OEB_04, RBV_OEC_00, RBV_OEC_03, RBV_OEC_06, RBV_OEC_07
- multi-actor: yes

**Steps:**
1. As org_exec grant `recruiter` board-level access; grant `job_posting_access` access to one posting only.
2. Sign in as each and open recruitment. Then revoke and recheck.

**Expected:**
- recruiter sees the board; job_posting_access sees only the granted posting; after revoke both are denied.

### REC-016 · Onboarding configuration from recruitment
- priority: P2
- type: functional
- roles: org_exec
- destructive: yes
- legacy: JO_ONBCA_00

**Steps:**
1. Create an onboarding configuration `{run} onboarding` from the recruitment page.

**Expected:**
- Saved and selectable when sending an offer.

### REC-017 · Campaigns dashboard and job postings list
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/campaigns
- destructive: no

**Steps:**
1. Open `{ws}/campaigns` and `{ws}/campaigns/job-postings/`; open one posting and one applicant.

**Expected:**
- Titles `Dashboard - HQZen`, `Job Postings - HQZen`, `Applicants - HQZen`; data loads.

**Cleanup:** Close `{run}` postings and cancel `{run}` offers that are still open.
