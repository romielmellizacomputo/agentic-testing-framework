# Public site (no login)

- module: public-site
- prefix: PUB
- source-paths: src/components/landing/, src/components/landing2/, src/images/landing/, src/images/landing2/, src/images/marketing/, src/images/get-started/, src/images/signup/, src/images/login/, src/images/favicon/, public/, src/components/help/, src/components/release-notes/, src/components/showcase/, src/components/build-your-team/, src/components/resumes/, src/pages/legal/, src/pages/help/, src/pages/release-notes/, src/pages/resumes/, src/pages/job-postings/, src/pages/build-your-team/, src/router/external/landing/, src/router/external/landing-applicants/, src/router/external/landing-legacy/, src/router/external/legal/, src/router/external/trademarks/, src/router/external/help/, src/router/external/compensation/, src/router/external/build-your-team/, src/router/external/job-posting/, src/router/job-postings/, src/router/resumes/, src/router/release-notes/, src/router/unsubscribe-email/, sitemap.js, index.html
- legacy-markers: landing_page, HQZ_JBB, HQZ_JBC
- base-route: /

Marketing landing pages, jobs portal, resumes, help center, release notes, legal pages. Run these as `anonymous` unless stated.

### PUB-001 · Landing page loads and core sections render
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression
- route: /
- destructive: no
- legacy: test_landing_page

**Steps:**
1. Open `/`. Scroll to the bottom slowly.

**Expected:**
- Title `HQZen - Find Zen in your workforce`.
- Hero, feature sections, footer render; images load (no broken image icons).
- No console errors; Largest content visible in under 4 s on a normal connection.

### PUB-002 · Landing navigation links work
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /
- destructive: no

**Steps:**
1. Click every link/button in the header and footer one by one (open each in the same tab, then go Back).

**Expected:**
- Every internal link opens a page that is not the 404 page.
- **Sign in** goes to `/signin`; **Get started / Sign up** goes to the sign-up funnel.
- External links (social, app stores) open the expected site in a new tab.
- Record any dead link with its text and target.

### PUB-003 · Landing page is responsive
- priority: P1
- type: ui
- roles: anonymous
- tags: regression, responsive
- route: /
- destructive: no

**Steps:**
1. View `/` at 375×812, 768×1024 and 1440×900.
2. On mobile open the hamburger menu and use one link.

**Expected:**
- No horizontal scrolling; text does not overflow; images scale; mobile menu opens and closes.

### PUB-004 · Applicants landing and legacy landing
- priority: P2
- type: functional
- roles: anonymous
- tags: regression
- route: /applicants
- destructive: no

**Steps:**
1. Open `/applicants` and `/legacy`.

**Expected:**
- Titles `HQZen - Find your next job` and `HQZen - Find Zen in your workforce`; CTAs lead to jobs/sign-up.

### PUB-005 · Jobs portal lists and searches postings
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression
- route: /jobs
- destructive: no
- legacy: HQZ_JBB_01, HQZ_JBB_02, HQZ_JBB_03

**Steps:**
1. Open `/jobs`.
2. Search for a common word (e.g. `support`), then a nonsense word (`zzqqxx`).
3. Use any available filters (location, job type).

**Expected:**
- Job cards show title, company/workforce, and a way to open details.
- Search narrows results; nonsense search shows an empty state, not an error.
- Filters change results and can be cleared.

### PUB-006 · Job posting detail and Apply Now
- priority: P0
- type: functional
- roles: anonymous
- tags: smoke, regression
- route: /jobs/job-post/:job_posting_id/:search_filters?
- destructive: no
- legacy: HQZ_JBC_03, HQZ_JBC_05

**Steps:**
1. From `/jobs` open a posting.
2. Click **Apply Now** while signed out.

**Expected:**
- Detail page shows description, requirements, and the Apply button.
- Apply while signed out asks you to sign in / sign up (it must not submit an application anonymously).
- The URL is shareable: opening it in a fresh tab shows the same posting.

### PUB-007 · Resumes directory
- priority: P2
- type: functional
- roles: anonymous
- route: /resumes
- destructive: no

**Steps:**
1. Open `/resumes`, open one resume.

**Expected:**
- Titles `HQZen - Resumes` and `HQZen Resume Detail`. No private contact data (phone, full address) is shown to anonymous users — if shown, `fail` sev:S2.

### PUB-008 · Help center browse
- priority: P1
- type: functional
- roles: anonymous
- tags: regression
- route: /help-center/
- destructive: no

**Steps:**
1. Open `/help-center/`. Open a category → subcategory → topic.
2. Use the help search if present.

**Expected:**
- Breadcrumbs/back navigation work at each level; topic content renders (images, formatting).

### PUB-009 · Release notes
- priority: P2
- type: functional
- roles: anonymous
- route: /release-notes
- destructive: no

**Steps:**
1. Open `/release-notes`, open the newest note.

**Expected:**
- List sorted newest first; detail page title `HQZen - Release Note Details`.

### PUB-010 · Legal and trademark pages
- priority: P2
- type: functional
- roles: anonymous
- route: /privacy-policy
- destructive: no

**Steps:**
1. Open `/privacy-policy` and `/trademarks`.

**Expected:**
- Full text renders; titles `Privacy Policy - HQZen`, `Trademarks - HQZen`.

### PUB-011 · Build your team & compensation wiki
- priority: P2
- type: functional
- roles: anonymous
- route: /build-your-team
- destructive: no

**Steps:**
1. Open `/build-your-team` and walk through its steps without submitting.
2. Open `/compensation`.

**Expected:**
- Pages load with titles `HQZen - Build Your Team` and `Compensation Wiki`; interactive elements respond.

### PUB-012 · Post a job (external) page
- priority: P2
- type: functional
- roles: anonymous
- route: /post-a-job
- destructive: no

**Steps:**
1. Open `/post-a-job`. Click the primary button with an empty form.

**Expected:**
- Validation errors show; nothing is submitted.

### PUB-013 · Unsubscribe link handling
- priority: P2
- type: security
- roles: anonymous
- route: /unsubscribe-email/:token
- destructive: no

**Steps:**
1. Open `/unsubscribe-email` and `/unsubscribe-email/AGT-invalid`.

**Expected:**
- Invalid token shows an error/expired message; it never says "unsubscribed" for a fake token.

### PUB-014 · SEO basics
- priority: P3
- type: ui
- roles: anonymous
- route: /
- destructive: no

**Steps:**
1. On `/`, `/jobs`, `/help-center/` read `<title>`, `meta[name=description]`, `og:title`, `link[rel=canonical]`. Fetch `/sitemap.xml` and `/robots.txt`.

**Expected:**
- Each page has a unique title and a description. Sitemap returns XML with public URLs only (no `/company/…` URLs).
