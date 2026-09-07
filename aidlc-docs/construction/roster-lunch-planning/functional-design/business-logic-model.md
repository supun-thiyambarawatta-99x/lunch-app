# Business Logic Model: UOW-01

## Roster Workflow

1. The coordinator enters a display name.
2. The system rejects a blank name or a duplicate active display name.
3. The system saves the person as active, or updates the existing active person.
4. On archive, the system makes the person unavailable for new lunch days while preserving historical references.

## Lunch-Day Planning Workflow

1. The coordinator creates a unique dated lunch day from the current active roster.
2. The coordinator marks each listed person attending or absent and records home-food status for attendees.
3. The system identifies the attending set and its lunch-buying subset.
4. The system automatically calculates the number of groups, creates the balanced allocation, and calculates the parcel recommendation using the configured capacity.
5. The coordinator reviews the results and confirms or adjusts the final parcel order.
6. The system exposes a current eligible-attendee set to UOW-02.

## Automatic Recalculation Workflow

1. The coordinator changes attendance, home-food state, or parcel capacity.
2. The system derives the new attendee and lunch-buying sets.
3. The system immediately regenerates groups and recalculates parcel recommendation.
4. If a final order was confirmed, the system labels it reconfirmation required.
5. The system refreshes the eligibility output and blocks UOW-02 from treating an outdated output as current.

## Group Allocation Algorithm

For $n$ attendees, use $g = \lceil n/7\rceil$ groups. Allocate home-food attendees first by repeatedly assigning the next person to a group with the fewest home-food attendees and available capacity. Allocate the remaining attendees by repeatedly assigning the next person to the smallest group with capacity. Deterministic tie-breaking uses ascending group number. The result guarantees group capacity at most seven, group-size difference at most one, and home-food-count difference at most one.

## Parcel Recommendation Algorithm

Count lunch-buying attendees as people who are attending and do not bring home food. Given a positive parcel capacity, divide this count by capacity and round upward. The recommendation is zero when no attendees require purchased lunch.