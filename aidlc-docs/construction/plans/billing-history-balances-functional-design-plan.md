# Functional Design Plan: UOW-02 Billing, History, and Balances

## Objective

Define technology-agnostic business logic, domain entities, validation rules, and coordinator user interactions for UOW-02. This unit implements US-05 through US-07 using stable eligible-attendee data from UOW-01.

## Scope

- Daily total-cost entry and equal charge allocation among eligible attendees.
- Deterministic currency rounding that preserves the total cost.
- Paid/unpaid settlement tracking and per-person outstanding balances.
- Daily history and current balance views.
- Coordinator-facing validation and error states for financial operations.

## Execution Checklist

- [x] Review UOW-02 definition, dependency contract, and assigned stories.
- [x] Identify required models: Charge, PaymentStatus, PersonBalance, and historical lunch-day view.
- [x] Confirm the financial decisions in the questions below.
- [x] Analyze all responses for ambiguity or contradiction.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Generate `frontend-components.md`.
- [x] Validate US-05 through US-07 coverage and the UOW-01 eligibility dependency.
- [x] Obtain explicit approval of the generated functional design.

## Questions

## Question 1
When equal cost splitting leaves a remainder at the smallest currency unit, how should the system assign it?

A) Assign one extra smallest currency unit to eligible attendees in ascending display-name order until the total is preserved

B) Assign one extra smallest currency unit to eligible attendees in ascending person-identifier order until the total is preserved

C) Require the coordinator to assign the remainder manually

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
What should happen when the coordinator changes a daily total cost after payment statuses have been recorded?

A) Allow the cost update, recalculate charges, and reset all charges for that lunch day to unpaid

B) Prevent cost changes once any charge has a recorded paid status

C) Allow the cost update, recalculate charges, and keep every existing paid/unpaid status

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 3
When may the coordinator allocate a daily lunch cost?

A) Only after UOW-01 has a current eligibility output and a confirmed final parcel order

B) After UOW-01 has a current eligibility output, regardless of final parcel-order status

C) At any time after a lunch day exists

X) Other (please describe after [Answer]: tag below)

[Answer]:C

## Question 4
How should settled charges appear in balances and history?

A) Exclude paid charges from current outstanding balances but retain them in daily history with paid status

B) Remove paid charges from both current balances and daily history

C) Keep paid charges in current balances as a separate paid total

X) Other (please describe after [Answer]: tag below)

[Answer]:A