# Scalema (scalema.com)

- module: scalema
- prefix: SCA
- source-paths: src/pages/, src/components/, src/router/
- legacy-markers: -
- base-route: /

Public pages, sign-in and core flows. Fresh accounts only; the standing approver comes from secrets.

### SCA-001 · Home page loads
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

### SCA-002 · About page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /about
- destructive: no

**Steps:**
1. Open `/about`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### SCA-003 · Business page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /business
- destructive: no

**Steps:**
1. Open `/business`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### SCA-004 · FAQs page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /faqs
- destructive: no

**Steps:**
1. Open `/faqs`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### SCA-005 · Privacy policy page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /privacy-policy
- destructive: no

**Steps:**
1. Open `/privacy-policy`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### SCA-006 · Terms page loads
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

### SCA-007 · Data retention page loads
- priority: P2
- type: functional
- roles: anonymous
- tags: regression, public
- route: /data-retention-policy
- destructive: no

**Steps:**
1. Open `/data-retention-policy`.

**Expected:**
- Page renders with a title; no broken images; no 5xx; no uncaught errors.

### SCA-008 · Landing sign-up section validates input
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /
- destructive: yes

**Steps:**
1. Submit the sign-up section empty, then with an invalid email.

**Expected:**
- Inline validation; nothing submitted.

**Cleanup:** Use `{run}`-named data and remove or revert it.

### SCA-009 · Client sign-up with a disposable inbox
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /
- destructive: yes

**Steps:**
1. Sign up with a fresh mail.tm address.

**Expected:**
- Account created; verification email arrives (needs email delivery).

**Cleanup:** Use `{run}`-named data and remove or revert it.

### SCA-010 · FAQ accordion
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /faqs
- destructive: no

**Steps:**
1. Open and close every question.

**Expected:**
- Each answer expands and collapses.

### SCA-011 · Business page CTA leads to sign-up
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /business
- destructive: no

**Steps:**
1. Click each call to action.

**Expected:**
- CTAs reach the sign-up or contact flow, not a 404.
