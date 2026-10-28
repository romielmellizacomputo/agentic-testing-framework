# Scalema (client queries, solutions experts, negotiations)

- module: scalema
- prefix: SCL
- source-paths: src/components/scalema/, src/pages/scalema/, src/store/scalema/, src/store/query/, src/store/negotiation/, src/router/internal/scalema/, src/router/external/scalema/
- legacy-markers: scalema, test_scalema_page
- base-route: /scalema

### SCL-001 · Scalema dashboard
- priority: P0
- type: functional
- roles: scalema_client, org_exec
- tags: smoke, regression
- route: /scalema/scalema-dashboard
- destructive: no
- legacy: test_scalema_page

**Steps:**
1. Open `/scalema` and the dashboard.

**Expected:**
- Title `Scalema - Dashboard`; widgets load.

### SCL-002 · Create a new query
- priority: P1
- type: functional
- roles: scalema_client
- tags: regression, crud
- route: /scalema/new-query
- destructive: yes

**Data:** title = `{run} query`

**Steps:**
1. Create a query with the data and a description; submit. Open it under personal queries.

**Expected:**
- Titles `New Query - Scalema`, `Queries - Scalema`, `View Query - Scalema`.

### SCL-003 · Solutions expert board and approved queries
- priority: P1
- type: functional
- roles: solutions_expert
- tags: regression
- route: /scalema/scalema-solutions-expert-board
- destructive: no

**Steps:**
1. Open client queries; find `{run} query`; open approved queries.

**Expected:**
- Titles `Client Queries - Scalema`, `Approved Queries - Scalema`.

### SCL-004 · Propose a solution and negotiate
- priority: P2
- type: e2e
- roles: solutions_expert, scalema_client
- destructive: yes
- depends: SCL-002

**Steps:**
1. Expert proposes a solution to `{run} query`. Client opens `/scalema/query-solution/:solutionId`, opens negotiation, sends a message.

**Expected:**
- Titles `View Solution - Scalema`, `Negotiation - Scalema`; messages visible to both.

### SCL-005 · Contract templates and send contract
- priority: P2
- type: functional
- roles: solutions_expert
- route: /scalema/scalema-contract-templates
- destructive: no

**Steps:**
1. Open contract templates; open template maker (`/scalema/scalema-templates/:action/`) without saving.

**Expected:**
- Titles `Contract Templates - Scalema`, `Template Maker - Scalema`.

### SCL-006 · Client workforce settings, invoices, billing
- priority: P2
- type: functional
- roles: scalema_client
- route: /scalema/scalema-client-workforce-settings
- destructive: no

**Steps:**
1. Open client workforce settings, details, invoice, invoice details, billing settings.

**Expected:**
- Each loads; amounts formatted. **Never pay or change billing.**

### SCL-007 · Solutions generator (public and internal)
- priority: P2
- type: functional
- roles: anonymous, scalema_client
- route: /solutions-generator
- destructive: no

**Steps:**
1. Open `/solutions-generator` and `/scalema/solutions-generator`; enter a sample need; generate.

**Expected:**
- Title `Solutions Generator Page - Scalema`; result renders; no stack traces.

### SCL-008 · External query page
- priority: P3
- type: functional
- roles: anonymous
- route: /scalema-external-query
- destructive: no

**Steps:**
1. Open `/scalema-external-query`; submit empty.

**Expected:**
- Validation shown.
