# UOW-01 Code Generation Summary

## Created Application Files

- `package.json`: React, Vite, Express, SQLite, Vitest, and React Testing Library configuration.
- `src/roster-lunch-planning/domain/models.ts`: UOW-01 domain record types.
- `src/roster-lunch-planning/domain/allocation.ts`: Deterministic group allocation and parcel recommendation.
- `src/roster-lunch-planning/persistence/database.ts`: SQLite schema and local application-data database initialization.
- `src/roster-lunch-planning/persistence/repositories.ts`: Roster and lunch-day repositories.
- `src/roster-lunch-planning/application/services.ts`: Roster and lunch-day application services, including eligibility output.
- `src/server/index.ts`: Internal Express API for UOW-01 operations.
- `src/app/App.tsx`: Coordinator roster and lunch-planning interface.
- `src/app/styles.css`: Responsive application presentation.

## Test Coverage

- `tests/roster-lunch-planning/allocation.test.ts`: Group-size cap, balanced home-food allocation, and upward parcel rounding.
- `tests/roster-lunch-planning/services.test.ts`: Reconfirmation requirement and eligible-attendee output.
- `tests/roster-lunch-planning/App.test.tsx`: Stable automation identifiers and roster submission workflow.

## Validation

- `npm test`: 7 tests passed.
- `npm run build`: React client and Node.js server compile successfully.

## UOW-02 Integration Contract

UOW-02 will obtain eligible lunch-buying attendees through `LunchDayService.getEligibleAttendees(lunchDayId)`. The service excludes absent and home-food attendees and rejects requests when a confirmed order requires reconfirmation after planning changes.