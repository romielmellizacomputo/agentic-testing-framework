# HQZen roles

Role keys used by the HQZen test cases. Real logins for each role live only in the private `accounts.local.json`.

| Role key | Who | Key profile flags |
|---|---|---|
| `anonymous` | Not signed in | – |
| `org_exec` | Organizational executive of the test company | `is_organizational_exec` |
| `workforce_exec` | Executive of one workforce only | `is_workforce_exec` (exec of that workforce) |
| `non_exec` | Signed-in user with no executive rights | – |
| `manager` | Department manager | `user_role = 3` |
| `supervisor` | Team supervisor | `user_role = 2` |
| `employee` | Regular partner / staff, no executive rights anywhere | has `employment_id` |
| `hr_admin` | HR portal user | `is_hr`, `can_access_hr_section` |
| `payroll_supervisor` | Supervisor allowed to see payroll | `can_view_payroll` |
| `recruiter` | Recruitment board access only | `can_view_recruitment_board` |
| `job_posting_access` | Access to specific job postings only | `recruitment_board_permissions` |
| `applicant` | Job seeker only (no employment anywhere) | `applicant_id`, `user_type` |
| `blocked_partner` | Partner whose account gets blocked/unblocked | `is_locked` |
| `other_company_exec` | Executive of a **different company** | tenant-isolation checks |
| `other_company_employee` | Employee of a different company or workforce | isolation checks |
| `scalema_client` | Scalema client user | – |
| `solutions_expert` | Scalema solutions expert | – |

Account tips: every role needs its **own** dedicated test account. A user who is an executive in one workforce and a regular partner in another is a useful extra account for scoped-permission checks, but it is not a valid `employee` or `applicant`.

## Access expectations

`Y` = opens · `N` = access-denied / not-found / sign-in · `R` = router rewrites to the user's own role · `–` = not applicable.
Staff pages use `:role` = `executive` | `supervisor` | `manager`.

| Area (route) | org_exec | workforce_exec | manager | supervisor | employee | hr_admin | applicant | anonymous |
|---|---|---|---|---|---|---|---|---|
| Personal board `/personal/personal-board` | Y | Y | Y | Y | Y | Y | Y | N |
| Workforce board `{ws}/board/:board_id` (member) | Y | Y | Y | Y | Y | Y | N | N |
| Workforce board (not a member, direct URL) | N | N | N | N | N | N | N | N |
| Administration `{ws}/administration/*` | Y | Y (own workforce only) | N | N | N | N | N | N |
| Payrolls `{ws}/administration/payrolls` | if `can_view_payroll` | same | N | N | N | N | N | N |
| Organization executives / HR admins | Y | N | N | N | N | N | N | N |
| Organization career policies | Y | Y (by design: router admits workforce execs) | N | N | N | N | N | N |
| Staff pages `{ws}/:role/*` | Y | Y (own workforce only) | Y | Y | N | – | N | N |
| HR Portal `/company/:company_id/hr-portal` | Y | – | N | N | N | Y | N | N |
| Recruitment `{ws}/recruitment` | Y | Y | N | N | N | – | N | N |
| Own career `{ws}/career/:own_employment_id` | – | – | Y | Y | Y | – | N | N |
| Another person's career (URL edit) | – | – | N | N | N | – | N | N |
| Any page with another company's IDs | N | N | N | N | N | N | N | N |
| Profile `/profile/*` | Y | Y | Y | Y | Y | Y | Y | N |
| Public pages (`/`, `/jobs`, `/help-center`, ...) | Y | Y | Y | Y | Y | Y | Y | Y |

"Own workforce only": executive rights from workforce A must **not** apply in workforce B where the same user is a regular partner. A page or API that opens there is a sev:S1 leak.
