# Unit Test Instructions

## Run All Tests

```bash
npm test
```

## Expected Result

All Vitest tests pass with zero failures. Current coverage includes:

- Group sizing, balanced home-food distribution, and parcel recommendation.
- Eligibility and order-reconfirmation behavior.
- Deterministic cost splitting, total preservation, and empty-eligibility rejection.
- Paid-cost lock and confirmed-order prerequisite.
- Coordinator control rendering and roster submission.

## When a Test Fails

1. Read the failing assertion and identify its affected unit.
2. Correct the domain, persistence, service, or UI behavior instead of changing expected business rules without approval.
3. Rerun `npm test`.
4. Run `npm run build` before accepting the change.