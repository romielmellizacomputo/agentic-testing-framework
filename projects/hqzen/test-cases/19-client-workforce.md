# Client contracts, invoices, workforce & facilities

- module: client
- prefix: CLI
- source-paths: src/components/client/, src/components/client-setup/, src/pages/client/, src/components/bookings/, src/components/reservations/, src/components/payment/, src/components/geofence/, src/store/bookings/, src/store/payment-dues/, src/store/workforce/, src/router/internal/invoices/, src/router/internal/client-contracts/, src/router/internal/client-partners/, src/router/internal/workforce/
- legacy-markers: –
- base-route: {ws}/workforce

No existing Selenium coverage here — good place for agents to add value.

### CLI-001 · Workforce page
- priority: P1
- type: functional
- roles: org_exec, employee
- tags: regression
- route: {ws}/workforce
- destructive: no

**Steps:**
1. Open the workforce page and the Updates tab.

**Expected:**
- Titles `Workforce - HQZen`, `Updates - HQZen`; members and updates load.

### CLI-002 · Service contract and lease contract
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/workforce/service-contract/:contract_id
- destructive: no

**Steps:**
1. Open a service contract and the facility lease contract.

**Expected:**
- Titles `Service Contract - HQZen`, `Lease Contract - HQZen`; document renders.

### CLI-003 · Reservations and amenity booking
- priority: P2
- type: functional
- roles: employee
- route: {ws}/workforce/reservations
- destructive: yes

**Steps:**
1. Open reservations; open an amenity room; book a slot tomorrow with note `{run}`; try a slot already booked; cancel your booking.

**Expected:**
- Titles `Reservations - HQZen`, `Amenity Details - HQZen`; conflicting booking refused; cancel works.

### CLI-004 · Invoices
- priority: P1
- type: functional
- roles: org_exec
- tags: regression
- route: {ws}/invoices
- destructive: no

**Steps:**
1. Open invoices; open invoice details.

**Expected:**
- Title `Invoices - HQZen`; totals = sum of line items; dates and currency formatted. **Never pay.**

### CLI-005 · Client contracts
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/client-contracts
- destructive: no

**Steps:**
1. Open client contracts; open one.

**Expected:**
- Title `Client Contracts - HQZen`.

### CLI-006 · Client partners
- priority: P2
- type: functional
- roles: org_exec
- route: {ws}/client-partners
- destructive: no

**Steps:**
1. Open client partners; open details.

**Expected:**
- Titles `Client Partners - HQZen`, `Partner Details - HQZen`.

### CLI-007 · Geofence / location features
- priority: P3
- type: functional
- roles: org_exec
- destructive: no

**Steps:**
1. Find the screen that shows a map (geofence or office location). Pan/zoom.

**Expected:**
- Map tiles load (Mapbox/Google); no API-key errors in console.
