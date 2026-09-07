# Code Generation Plan: UOW-01 Roster and Lunch Planning

## Unit Context

- **Stories**: US-01 Maintain the Office Roster; US-02 Record Daily Attendance and Home Food; US-03 Allocate Attendees to Balanced Groups; US-04 Configure and Confirm Lunch Parcels.
- **Dependencies**: None. This foundation unit provides current eligible lunch-buying attendee data to UOW-02.
- **Service boundary**: Coordinator user interface calls roster and lunch-day application services; services invoke reusable allocation logic and local persistence repositories.
- **Owned data**: People, lunch days, attendance, group allocations, parcel capacity, parcel recommendation, final parcel order, and order status.

## Planned Code Organization

The approved stack is TypeScript, React, Vite, Node.js, Express, SQLite, Vitest, and React Testing Library. Code will be created outside `aidlc-docs/` using this multi-unit monolith layout:

```text
package.json
index.html
vite.config.ts
src/
  main.tsx
  app/
    App.tsx
  server/
    index.ts
  roster-lunch-planning/
    domain/
    application/
    persistence/
    ui/
tests/
  roster-lunch-planning/
```

The SQLite file will be stored in an application data directory outside source control. `better-sqlite3` supplies local persistence; Express provides the internal HTTP API; Vite proxies the development interface to it. Vitest covers domain and service logic, while React Testing Library covers coordinator workflows.

## Execution Steps

1. [x] Review UOW-01 functional design, story map, dependencies, and code-location rules.
2. [x] Confirm the technology stack and local persistence library.
3. [x] Scaffold `package.json`, Vite configuration, TypeScript configuration, `index.html`, application entry points, and source/test directories in the workspace root.
4. [x] Install React, Vite, Express, SQLite, and test dependencies; add development, build, server, and test scripts.
5. [x] Implement UOW-01 domain models and SQLite repositories in `src/roster-lunch-planning/`.
6. [x] Implement deterministic group allocation and parcel recommendation domain logic.
7. [x] Add Vitest unit tests for roster validation, group allocation, parcel recommendation, and stale-order behavior.
8. [x] Implement Express routes and roster/lunch-day application services.
9. [x] Add service-level tests for attendance updates, automatic recalculation, and UOW-02 eligibility output.
10. [x] Implement React coordinator interface components with stable `data-testid` attributes on interactive controls.
11. [x] Add React Testing Library coverage for roster, attendance, allocation, and parcel-order workflows.
12. [x] Create code-generation documentation in `aidlc-docs/construction/roster-lunch-planning/code/`.
13. [x] Run UOW-01 focused tests and production build; resolve relevant failures.
14. [x] Obtain review approval for generated UOW-01 code.

## Maintenance Changelog

- **2026-09-04**: Added person removal (delete with archive fallback), lunch-day deletion, a friendly duplicate-date validation message with a date-clear action, immediate auto-save for attendance and home-food changes, a persisted manual group-reassignment override, a home-food icon in group member lists, toast notifications, and primary/secondary/destructive button styling. The final-order input now initializes from the current recommendation or previously confirmed quantity. Added `group_overrides` table, `applyGroupOverrides` domain function, and corresponding repository/service/API methods. Verified with `npm run build`, `npm test` (19 tests passing), and a browser smoke test.

## Questions

## Question 1
Which technology stack should the first-release local web application use?

A) TypeScript with React and Vite for the coordinator interface, Node.js services, and SQLite local persistence

B) Python with Flask for server-rendered coordinator pages and SQLite local persistence

C) Java with Spring Boot, server-rendered pages, and an embedded local database

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
How should local data be stored while the application runs on the coordinator machine?

A) SQLite database file stored in the application data directory

B) JSON file stored in the application data directory

C) Browser-only local storage

X) Other (please describe after [Answer]: tag below)

[Answer]:A