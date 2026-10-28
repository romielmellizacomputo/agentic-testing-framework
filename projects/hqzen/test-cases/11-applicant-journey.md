# Applicant journey & profile

- module: applicant
- prefix: APP
- source-paths: src/pages/profile/, src/components/profile/, src/store/profile/, src/store/resumes/, src/router/internal/profile/, src/router/internal/personal-board/, src/components/contract/, src/store/contract/, src/store/job-offer/, src/store/negotiation/
- legacy-markers: JOWU_APPB, JOWU_JBA, JOWU_JBC, JOWU_JBH, JOWU_MEAD, JOWU_US, JOWU_CHC, UP_PTNR, WE_PTNR, JP_PTNR, EB_PTNR, APP_UN_BLKB
- base-route: /personal/jobs-board

### APP-001 · Applicant sign up
- priority: P1
- type: e2e
- roles: anonymous
- tags: nightly
- route: /signup/hqzen
- destructive: yes
- legacy: JOWU_US_01, JOWU_MEAD_00

**Data:** email = `agt-app-{run}@example.com`

**Steps:**
1. Register as a job seeker. Complete activation if an email is sent.

**Expected:**
- Account created; lands on applicant area; profile completion prompts shown.

### APP-002 · User profile: picture, contact, resume
- priority: P1
- type: functional
- roles: applicant
- tags: regression
- route: /profile/user-profile
- destructive: yes
- legacy: UP_PTNR_02, UP_PTNR_07, UP_PTNR_12

**Steps:**
1. Change profile picture (crop tool), update contact number (try an invalid one first), upload a PDF resume.

**Expected:**
- Title `Profile - HQZen`; invalid phone rejected (libphonenumber); picture and resume persist.

**Cleanup:** Restore the original picture and phone number; delete the uploaded test resume if it replaced a real one.

### APP-003 · Work experience, education, job preferences
- priority: P1
- type: functional
- roles: applicant
- tags: regression
- route: /profile/work
- destructive: yes
- legacy: WE_PTNR_02, WE_PTNR_03, EB_PTNR_00, EB_PTNR_02, EB_PTNR_05, JP_PTNR_02

**Steps:**
1. Add and edit a work experience (`/profile/work`). Add and edit secondary education (`/profile/school`). Edit job preferences (`/profile/preferences`).
2. Try an end date before start date.

**Expected:**
- Titles `Work Experience - HQZen`, `Educational Background - HQZen`, `Job Preferences - HQZen`; data persists; invalid dates rejected.

**Cleanup:** Delete the added work experience and education rows; restore preferences.

### APP-004 · Apply to a job while signed in
- priority: P0
- type: e2e
- roles: applicant
- tags: smoke, regression
- route: /personal/jobs-board
- destructive: yes
- legacy: JOWU_APPB_05, JOWU_JBA_04
- depends: REC-002

**Steps:**
1. Open the job portal (`/personal/jobs-board` or `/jobs`), find `{run} Customer Support Rep`, apply.
2. Try applying again.

**Expected:**
- Title `Job Portal - HQZen`; application confirmed; second apply is prevented ("already applied").

### APP-005 · Applicant sees application status changes
- priority: P1
- type: functional
- roles: applicant
- tags: regression
- destructive: no
- depends: REC-006

**Steps:**
1. Open the applicant's jobs board after the employer shortlists them.

**Expected:**
- Status shows shortlisted; interview details appear after REC-007.

### APP-006 · View company information and job offer
- priority: P1
- type: functional
- roles: applicant
- tags: regression
- destructive: no
- depends: REC-009
- legacy: JOWU_JBC_02

**Steps:**
1. Open the received offer; open company information.

**Expected:**
- Offer details (salary, start date, policy) match what the employer sent.

### APP-007 · Accept job offer and sign contract
- priority: P0
- type: e2e
- roles: applicant
- tags: smoke, regression
- route: /personal/contracts/:job_offer_id
- destructive: yes
- legacy: JOWU_JBC_03, JOWU_JBH_01
- depends: REC-009

**Steps:**
1. Accept the offer. Open **Sign Contracts**. Review each document; sign (e-signature).

**Expected:**
- Title `Sign Contracts - HQZen`; all documents must be reviewed before signing; signed contract appears in `/personal/contracts`.

### APP-008 · Negotiate salary
- priority: P1
- type: e2e
- roles: applicant
- tags: regression
- destructive: yes
- legacy: JOWU_JBC_05, JOWU_CHC_01

**Preconditions:** A fresh offer (send another with REC-009 if the first was accepted).

**Steps:**
1. Click **Negotiate salary**; propose an amount and a message.

**Expected:**
- Message appears in the negotiation thread; employer sees it (REC-011).

### APP-009 · Decline a job offer
- priority: P1
- type: functional
- roles: applicant
- tags: regression
- destructive: yes
- legacy: JOWU_JBC_04

**Steps:**
1. Decline an offer with a reason.

**Expected:**
- Status *declined* on both sides; offer cannot be accepted afterwards.

**Cleanup:** Use a `{run}` offer only (send one with REC-009 first).

### APP-010 · Applicant cannot open employer pages
- priority: P0
- type: rbac
- roles: applicant
- tags: smoke, rbac
- destructive: no

**Steps:**
1. As applicant open: a `{ws}/board/-1` URL, `{ws}/administration/`, `/organization`, `{ws}/recruitment` (use the test company/workforce IDs).

**Expected:**
- Every one is denied (access denied / not found). No employer data visible.
