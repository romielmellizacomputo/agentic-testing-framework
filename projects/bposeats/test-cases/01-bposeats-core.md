# BPOSeats (bposeats.com)

- module: bposeats
- prefix: BPS
- source-paths: src/components/, src/pages/, src/router/, src/store/
- legacy-markers: -
- base-route: /

Public pages, sign-in and core flows. Fresh accounts only; the standing approver comes from secrets.

### BPS-001 · Home page loads
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression, public
- route: /
- destructive: no

**Steps:**
1. Open `/`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-002 · Offices page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /offices
- destructive: no

**Steps:**
1. Open `/offices`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-003 · Buildings page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /buildings
- destructive: no

**Steps:**
1. Open `/buildings`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-004 · BPO page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /bpo
- destructive: no

**Steps:**
1. Open `/bpo`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-005 · Offshore page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /offshore
- destructive: no

**Steps:**
1. Open `/offshore`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-006 · Outsourcing page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /outsourcing
- destructive: no

**Steps:**
1. Open `/outsourcing`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-007 · Staffing page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /staffing
- destructive: no

**Steps:**
1. Open `/staffing`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-008 · Hiring page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /hiring
- destructive: no

**Steps:**
1. Open `/hiring`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-009 · Features page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /features
- destructive: no

**Steps:**
1. Open `/features`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-010 · Contact page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /contact
- destructive: no

**Steps:**
1. Open `/contact`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-011 · Release notes page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /release-notes
- destructive: no

**Steps:**
1. Open `/release-notes`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-012 · Terms page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /terms-and-conditions
- destructive: no

**Steps:**
1. Open `/terms-and-conditions`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### BPS-013 · Employer booking wizard: choose facility
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /bookings/:booking_id/choose-facility/
- destructive: yes

**Steps:**
1. Start a booking, choose a facility, continue.

**Expected:**
- Facility list loads; selection persists; next step opens.

**Cleanup:** Use `{run}`-named data and remove or revert it.

### BPS-014 · Booking: invite applicants
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /bookings/:booking_id/invite-applicants/
- destructive: yes

**Steps:**
1. Invite a disposable-inbox applicant to the booking.

**Expected:**
- Invite listed as pending; applicant receives the invite (needs email delivery).

**Cleanup:** Use `{run}`-named data and remove or revert it.

### BPS-015 · Booking checkout and payment options (view only)
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /bookings/:booking_id/payment-options/
- destructive: no

**Steps:**
1. Open payment options; do NOT pay.

**Expected:**
- Options render with currency; nothing is charged.

### BPS-016 · Campaign page
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /campaigns/:campaign_id
- destructive: no

**Steps:**
1. Open a campaign of the employer.

**Expected:**
- Campaign details, applicants and status load.

### BPS-017 · Employer notifications
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /employers/notifications/
- destructive: no

**Steps:**
1. Open notifications; open one.

**Expected:**
- List loads; item opens its target.

### BPS-018 · Messages
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /messages/
- destructive: no

**Steps:**
1. Open messages; open a thread.

**Expected:**
- Threads load; sending is possible in test data only.

### BPS-019 · Account page
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /account
- destructive: yes

**Steps:**
1. Open account settings; change a harmless field; revert.

**Expected:**
- Change persists; revert works.

**Cleanup:** Use `{run}`-named data and remove or revert it.

### BPS-020 · Two-factor page
- priority: P1
- type: functional
- roles: employer
- tags: regression
- route: /tfa
- destructive: no

**Steps:**
1. Open after sign-in when TFA is required.

**Expected:**
- Code input shown; wrong code rejected.

### BPS-021 · Employer cannot open another employer booking
- priority: P1
- type: rbac
- roles: employer
- tags: regression, rbac
- route: /bookings/:booking_id/checkout/
- destructive: no

**Steps:**
1. As a fresh employer open another employer's booking id.

**Expected:**
- Denied; no booking data shown (leak = sev:S1).
