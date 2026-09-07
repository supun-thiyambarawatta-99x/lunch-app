# Functional Design Plan: UOW-01 Roster and Lunch Planning

## Objective

Define technology-agnostic business logic, domain entities, validation rules, and coordinator user interactions for UOW-01: Roster and Lunch Planning. This plan covers US-01 through US-04 and provides stable lunch-day eligibility data to UOW-02.

## Scope

- Roster creation, updates, listing, and archive behavior.
- Dated lunch-day creation and attendance/home-food declarations.
- Near-equal group allocation with balanced home-food attendees.
- Parcel-capacity configuration, parcel recommendation, and coordinator final-order confirmation.
- Coordinator-facing form validation and display behavior.

## Execution Checklist

- [x] Review UOW-01 definition, dependency order, and assigned stories.
- [x] Identify required models: Person, LunchDay, Attendance, GroupAllocation, and ParcelOrder.
- [x] Confirm the functional decisions in the questions below.
- [x] Analyze all responses for ambiguity or contradiction.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Generate `frontend-components.md`.
- [x] Validate that the design covers US-01 through US-04 and produces the UOW-02 eligibility interface.
- [x] Obtain explicit approval of the generated functional design.

## Questions

## Question 1
What group-count behavior should a new lunch day use?

A) Default to two groups and allow the coordinator to select another positive group count before generating allocation

B) Always use exactly two groups

C) Require the coordinator to select a positive group count for every lunch day

X) Other (please describe after [Answer]: tag below)

[Answer]: If the number of people is more than 7 divid to multiple groups otherwise only one. Maximum number of people for a group is 7

## Question 2
When attendance or home-food status changes after groups or a parcel recommendation have been generated, how should the system respond?

A) Mark dependent allocation and recommendation results outdated; require the coordinator to regenerate them

B) Recalculate groups and parcel recommendation automatically

C) Prevent attendance and home-food changes after calculation

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 3
After the coordinator records the final parcel order, what edits should remain possible on that lunch day?

A) Allow changes; mark the final order outdated and require reconfirmation after any attendance, home-food, group-count, or parcel-capacity change

B) Lock all attendance, home-food, group, capacity, and order fields

C) Allow changes without affecting the recorded final order

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
Which person name rule should be enforced for the roster?

A) Require a non-empty display name; duplicate names are allowed

B) Require a non-empty display name unique among active people

C) Require first and last names, both non-empty; duplicates are allowed

X) Other (please describe after [Answer]: tag below)

[Answer]:B