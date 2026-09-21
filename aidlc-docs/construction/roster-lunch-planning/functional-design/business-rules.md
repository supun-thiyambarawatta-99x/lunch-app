# Business Rules: UOW-01

## Roster Rules

1. A person requires a non-empty display name.
2. Active display names must be unique; an archived name may be reused only after the original person is no longer active.
3. Archiving retains the person in historical lunch-day records and excludes them from new lunch days.

## Attendance Rules

1. A lunch day has one unique date.
2. Each included person has one attendance entry.
3. Only attending people participate in groups, parcel recommendations, and the eligibility output.
4. Only attending people can have an effective home-food state.

## Group Rules

1. A group can contain at most eight attendees.
2. For $n > 0$ attendees, the system automatically uses $\lceil n/8\rceil$ groups. For zero attendees, it creates no groups.
3. Group sizes differ by at most one attendee.
4. Home-food attendee counts differ by at most one between groups whenever groups exist.
5. Every attendee is assigned exactly once; absent people are assigned zero times.

## Parcel Rules

1. Parcel capacity must be a positive whole number.
2. The recommended parcel count is $\lceil b/c\rceil$, where $b$ is the number of attending people without home food and $c$ is parcel capacity.
3. The coordinator may enter a final parcel quantity after reviewing the recommendation.
4. Changes to attendance, home-food state, parcel capacity, or the derived group count automatically recalculate group allocation and parcel recommendation.
5. If a final order has already been confirmed and an impacted change occurs, its status becomes reconfirmation required. The previously entered quantity remains visible as historical input but cannot be treated as current until reconfirmed.

## UOW-02 Eligibility Contract

1. UOW-02 may allocate charges only when it receives a current eligibility output from UOW-01.
2. The output includes every attending non-home-food person once and excludes absent and home-food people.
3. UOW-01 preserves the lunch-day record that produced the output so later history can be reconstructed.

## Maintenance Amendments (2026-09-04)

1. **Roster removal**: Removing a person deletes them outright when no attendance or charge record references them; otherwise the system archives them instead and reports that history exists.
2. **Lunch-day removal**: The coordinator can delete a lunch day; its attendance, group overrides, and charges are removed with it.
3. **Friendly date-conflict validation**: Creating a lunch day for a date that already exists returns a friendly message ("This date already exists.") instead of a raw database error; the coordinator can also reset the date field to today's date.
4. **Manual group reassignment**: The coordinator may move an attending person into a different group after automatic allocation. A per-lunch-day override is stored per person and reapplied after every recalculation; a move is rejected if it would exceed the seven-person group limit, in which case the member's most recent placement is kept.
5. **Immediate recalculation**: Attendance, home-food, and parcel-capacity changes persist immediately; the coordinator no longer must trigger a manual save for group and parcel figures to reflect the latest input.