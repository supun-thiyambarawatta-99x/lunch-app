# End-to-End Test Instructions

## Coordinator Workflow

1. Open `http://127.0.0.1:5173/`.
2. Add enough people to create at least two groups, then create a lunch day.
3. Mark four people as bringing home food and refresh the plan.
4. Verify no group exceeds seven people and home-food attendees are balanced between groups.
5. Set parcel capacity to two and verify the recommendation is the lunch-buying attendee count divided by two, rounded up.
6. Confirm the parcel order.
7. Allocate the total lunch cost and verify only lunch-buying attendees are charged.
8. Mark a charge paid and verify the corresponding outstanding balance decreases.
9. Change an attendance or home-food declaration, refresh the plan, and verify the final order requires reconfirmation before another allocation.