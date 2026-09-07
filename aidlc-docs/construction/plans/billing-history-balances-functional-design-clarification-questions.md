# Functional Design Clarifications: UOW-02

Two responses need clarification because they conflict with approved requirements and the UOW-01 to UOW-02 interface contract. Answer each question by entering the selected letter after `[Answer]:`.

## Clarification Question 1
The requirements require deterministic currency rounding that preserves the entered total, while Question 1 selected manual remainder assignment. Which rule should the design follow?

A) The system assigns remainder units automatically in ascending display-name order, always preserving the total cost

B) The coordinator assigns remainder units manually, and the system validates that allocated charges exactly equal the total cost before saving

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Clarification Question 2
UOW-01's approved eligibility contract requires UOW-02 to use current eligible-attendee data, while Question 3 selected allocation at any time. Which allocation precondition should the design follow?

A) Allocate cost only with a current UOW-01 eligibility output; a final parcel order is not required

B) Allocate cost only with a current UOW-01 eligibility output and a confirmed final parcel order

C) Allow allocation without current eligibility data, accepting that charges may include absent or home-food attendees

X) Other (please describe after [Answer]: tag below)

[Answer]:B