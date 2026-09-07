# Unit of Work Story Map

| Unit | Story | Story name | Dependency notes |
|---|---|---|---|
| UOW-01: Roster and Lunch Planning | US-01 | Maintain the Office Roster | Independent foundation for selecting active people. |
| UOW-01: Roster and Lunch Planning | US-02 | Record Daily Attendance and Home Food | Requires active people from US-01. |
| UOW-01: Roster and Lunch Planning | US-03 | Allocate Attendees to Balanced Groups | Requires attendance and home-food declarations from US-02. |
| UOW-01: Roster and Lunch Planning | US-04 | Configure and Confirm Lunch Parcels | Requires lunch-buying count from US-02. |
| UOW-02: Billing, History, and Balances | US-05 | Allocate the Daily Lunch Cost | Requires eligible attendees supplied by UOW-01. |
| UOW-02: Billing, History, and Balances | US-06 | Track Payment Status and Outstanding Balances | Requires charges created by US-05. |
| UOW-02: Billing, History, and Balances | US-07 | Review Lunch History and Balances | Reads the records produced by both UOW-01 and UOW-02. |

## Coverage Verification

- UOW-01 owns four stories: US-01 through US-04.
- UOW-02 owns three stories: US-05 through US-07.
- All seven approved stories have exactly one owning unit.