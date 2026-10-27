# Roles

Copy to `config/roles.md` and replace with your app's roles. Tools read role keys from the table below (`| \`key\` |` rows).

| Role key | Who | Key permissions |
|---|---|---|
| `anonymous` | Not signed in | public pages only |
| `admin` | Full administrator of one tenant/organization | everything inside their tenant |
| `manager` | Manages a team | their team's people and approvals |
| `member` | Regular user | their own data and shared spaces they belong to |
| `viewer` | Read-only user | can view, cannot change |
| `other_tenant_user` | User of a **different** tenant/organization | used for isolation checks — must see nothing of the test tenant |

## Access expectations (RBAC truth table)

`Y` = page opens · `N` = denied (403 / access-denied / not-found / redirect to login).

| Area | admin | manager | member | viewer | other_tenant_user | anonymous |
|---|---|---|---|---|---|---|
| Public pages | Y | Y | Y | Y | Y | Y |
| Own dashboard | Y | Y | Y | Y | Y | N |
| Team management | Y | Y | N | N | N | N |
| Administration / settings | Y | N | N | N | N | N |
| Another user's private data (ID in URL) | per policy | team only | N | N | N | N |
| Any page with the test tenant's IDs | Y | Y | Y | Y | N | N |

A permission leak (a `N` cell that opens, or an API returning another user's data) is **sev:S1**.
If behaviour differs and a human confirms the table is wrong, fix the table and mark the case `needs_update`.
