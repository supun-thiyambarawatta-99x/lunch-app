# Code Generation Plan: UOW-02 Billing, History, and Balances

## Unit Context

- **Stories**: US-05 Allocate the Daily Lunch Cost; US-06 Track Payment Status and Outstanding Balances; US-07 Review Lunch History and Balances.
- **Dependency**: UOW-01 is complete. UOW-02 consumes its current eligible-attendee output and requires its confirmed final parcel order.
- **Service boundary**: Billing application services call UOW-01's `LunchDayService` and UOW-02 persistence interfaces. Coordinator UI calls billing and history endpoints only.
- **Owned data**: Charges and payment statuses in the existing SQLite database.

## Implementation Locations

UOW-02 extends the existing TypeScript React/Vite, Express, and SQLite application in place:

```text
src/
  roster-lunch-planning/
    domain/models.ts
    application/services.ts
    persistence/database.ts
    persistence/repositories.ts
  billing-history-balances/
    domain/
    application/
    persistence/
  server/index.ts
  app/App.tsx
tests/
  billing-history-balances/
```

## Execution Steps

1. [x] Review UOW-02 functional design, story map, dependency contract, and existing UOW-01 implementation.
2. [x] Confirm existing TypeScript, React, Vite, Express, SQLite, Vitest, and React Testing Library tooling is reusable.
3. [x] Extend domain models and SQLite schema with charges and payment status.
4. [x] Implement deterministic cost-splitting domain logic with display-name remainder ordering.
5. [x] Add domain tests for equal splits, remainder allocation, no eligible attendees, and total preservation.
6. [x] Implement billing and history repositories plus application services enforcing UOW-01 prerequisites and cost-edit locking.
7. [x] Add service tests for cost allocation, paid/unpaid status, outstanding balances, history retention, and cost-change protection.
8. [x] Extend Express endpoints for cost allocation, payment status, daily history, and person balances.
9. [x] Extend the existing coordinator interface with billing, payment, balance, and history views using stable `data-testid` attributes.
10. [x] Add React Testing Library coverage for billing prerequisites, allocation display, and payment-status controls.
11. [x] Create UOW-02 code-generation documentation in `aidlc-docs/construction/billing-history-balances/code/`.
12. [x] Run focused UOW-02 tests, the complete test suite, and the production build; resolve relevant failures.
13. [x] Perform a browser smoke test covering charge allocation and payment status.
14. [x] Obtain review approval for generated UOW-02 code.

## Maintenance Changelog

- **2026-09-04**: Changed the total-cost entry to rupees; the UI now converts and rounds the entered amount to the smallest currency unit before calling `BillingService.allocateCharges`. Payment-status and allocation actions now report success or failure through toast notifications. Verified with `npm run build`, `npm test`, and a live API smoke workflow allocating Rs. 100.00 across eight eligible attendees.