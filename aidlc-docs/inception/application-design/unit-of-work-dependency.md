# Unit of Work Dependencies

## Dependency Matrix

| Consumer unit | Provider unit | Required data or interface | Dependency type |
|---|---|---|---|
| UOW-01: Roster and Lunch Planning | None | None | Independent foundation unit |
| UOW-02: Billing, History, and Balances | UOW-01: Roster and Lunch Planning | Finalized lunch day, attendance, home-food status, and eligible lunch-buying attendees | Required functional dependency |

## Communication Rules

1. UOW-02 obtains lunch-day eligibility data through application services or repository interfaces.
2. UOW-02 must not call another module's repository implementation directly.
3. Both units use one local file-based database but retain ownership of their own records and responsibilities.
4. Allocation and billing calculations remain pure domain operations and do not write records directly.

## Delivery Sequence

1. Complete Functional Design and Code Generation for UOW-01.
2. Validate that UOW-01 provides stable lunch-day and eligible-attendee data.
3. Complete Functional Design and Code Generation for UOW-02.
4. Execute integrated build and test coverage across both units.

## Risk and Mitigation

The financial unit depends on accurate home-food and attendance data. Tests at the unit boundary must prove that absent and home-food attendees cannot be charged and that a completed lunch day produces a stable set of eligible attendees.