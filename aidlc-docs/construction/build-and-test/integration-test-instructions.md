# Integration Test Instructions

## Purpose

Verify the UOW-01 lunch-planning output and UOW-02 billing behavior against the same local SQLite database.

## Setup

In separate terminals, start the API and interface:

```bash
npm run server
npm run dev -- --host 127.0.0.1
```

## Scenario 1: Planning to Billing

1. Add roster people and create a lunch day.
2. Mark attendance and home-food status, then refresh the plan.
3. Confirm the final parcel order.
4. Enter a daily total cost and allocate it.
5. Verify that only attending people without home food have charges and all charges total the entered amount.

## Scenario 2: Settlement and Balance

1. Mark one allocated charge paid.
2. Verify that it remains visible in the day’s charge list.
3. Verify that it no longer contributes to the person’s outstanding balance.
4. Mark it unpaid and verify the balance returns.

## Scenario 3: Reconfirmation Guard

1. Confirm a final parcel order.
2. Change an attendee’s status or home-food selection and refresh the plan.
3. Verify that the order requires reconfirmation and cost allocation is blocked.
4. Reconfirm the order and verify allocation can continue.

## Cleanup

Stop both local processes. For an isolated next run, point `LUNCH_DATA_DIR` at a new empty directory or remove the test database only when historical data is not needed.