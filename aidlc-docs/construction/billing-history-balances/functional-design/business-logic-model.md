# Business Logic Model: UOW-02

## Daily Cost Allocation Workflow

1. The coordinator opens a lunch day and enters its total cost.
2. The system requests UOW-01's current eligibility output and verifies the final parcel order is confirmed.
3. The system rejects the operation when eligibility is outdated, final order is unconfirmed, or no eligible attendee exists.
4. The system splits the total in minor units, assigns remainder units deterministically by display name, creates unpaid charges, and persists them.
5. The coordinator sees each liable attendee's charge and the total allocated amount.

## Payment Workflow

1. The coordinator reviews charges by lunch day or person.
2. The coordinator marks a charge paid or unpaid.
3. The system saves the status and recalculates the affected person's outstanding balance from all unpaid charges.

## Cost Correction Workflow

1. The coordinator requests a cost change for an existing lunch day.
2. The system checks whether any existing charge is paid.
3. If a charge is paid, the system rejects the change and retains all records.
4. If all charges are unpaid, the system validates the current UOW-01 prerequisites, replaces the charge allocation, and presents the new amounts.

## History and Balance Workflow

1. The coordinator requests daily history or per-person balances.
2. The system retrieves planning information from UOW-01 and charge data from UOW-02.
3. The daily view displays settled and unsettled charges; the balance view sums only unsettled charges.