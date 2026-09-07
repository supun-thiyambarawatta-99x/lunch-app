# Units of Work

## Code Organization Strategy

This is a greenfield, multi-unit modular monolith. Application code will be organized at the workspace root using these paths:

```text
src/
  roster-lunch-planning/
  billing-history-balances/
tests/
  roster-lunch-planning/
  billing-history-balances/
```

Both units compile and run as one internal web application on a coordinator-controlled machine or workstation. They use typed application-service calls and repository interfaces over one local file-based database. Neither unit is independently deployed.

## UOW-01: Roster and Lunch Planning

**Purpose**: Provide the coordinator capabilities to manage people and produce the daily attendance, group allocation, and lunch-order record.

**Responsibilities**:

1. Maintain active and archived roster members.
2. Create dated lunch records and record attendance and home-food declarations.
3. Generate balanced groups and persist their derived counts.
4. Configure parcel capacity, calculate recommendations, and persist final order quantities.

**Owned stories**: US-01, US-02, US-03, and US-04.

**Owned data**: People, lunch days, attendance declarations, group assignments, parcel capacity, parcel recommendation, and final parcel order.

**Interfaces provided**: Roster management, lunch-day creation and retrieval, attendance recording, allocation generation, parcel-capacity configuration, and final-order confirmation.

## UOW-02: Billing, History, and Balances

**Purpose**: Provide the coordinator capabilities to allocate daily cost, track settlement, and inspect historical lunch and balance records.

**Responsibilities**:

1. Allocate daily total cost among eligible lunch-buying attendees.
2. Persist charges and paid/unpaid state.
3. Calculate each person's outstanding unpaid balance.
4. Retrieve complete historical lunch-day details and current person balances.

**Owned stories**: US-05, US-06, and US-07.

**Owned data**: Charges and payment status. It reads lunch-day and attendance data owned by UOW-01 through application services or repository interfaces.

**Interfaces provided**: Daily charge allocation, payment-status correction, person-balance retrieval, and lunch-history retrieval.

## Ownership

One small team owns both units. The split provides manageable feature boundaries and an explicit dependency order without imposing separate deployment, database, or operational ownership.