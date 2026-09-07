# User Stories

## Story Quality

The stories below are feature-based, scoped to the first release, and intended to meet INVEST criteria: each represents a separately valuable coordinator capability, contains testable criteria, and avoids technical implementation decisions.

## Roster Management

### US-01: Maintain the Office Roster

**As a** Lunch Coordinator, **I want** to create, edit, view, and archive people in the office roster **so that** daily lunch records use an accurate set of active attendees.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a new person with required identity details, when I save them, then they appear as active in the office roster.
- Given an active person, when I update their details, then future lunch records use the updated details.
- Given a person with historical lunch records, when I archive them, then they are unavailable for new lunch records and remain visible in prior records.

## Daily Attendance

### US-02: Record Daily Attendance and Home Food

**As a** Lunch Coordinator, **I want** to create a dated lunch record and identify attendance and home-food status **so that** the system can determine who needs purchased lunch.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given active roster members, when I create a lunch record for a date, then I can mark each person as attending or absent.
- Given an attending person, when I mark that they bring food from home, then they are identified as a home-food attendee for that date.
- Given a person marked absent, when I review the lunch record, then they are excluded from allocation, ordering, and charging.

## Group Allocation

### US-03: Allocate Attendees to Balanced Groups

**As a** Lunch Coordinator, **I want** the system to allocate daily attendees into balanced groups and distribute home-food attendees evenly **so that** group lunch arrangements are fair and easy to inspect.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a lunch record with an evenly divisible attendee count, when groups are generated, then all groups have the same number of attendees.
- Given an attendee count that is not evenly divisible by the selected number of groups, when groups are generated, then group sizes differ by no more than one attendee.
- Given home-food attendees, when groups are generated, then home-food counts between groups differ by no more than one attendee.
- Given generated groups, when I view the daily record, then each group's members, total size, home-food count, and count of people who did not bring lunch are displayed, and members who brought food from home show a home icon.
- Given a group member, when I select a different group and confirm the move, then the member relocates immediately, provided the destination group has fewer than seven members.
- Given a change to attendance or home-food status, when the change saves, then group membership, counts, and the parcel recommendation update immediately without a manual reload.

## Parcel Planning and Ordering

### US-04: Configure and Confirm Lunch Parcels

**As a** Lunch Coordinator, **I want** to configure parcel capacity, review the recommended parcel count, and record the final order **so that** the lunch purchase meets the day's needs.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a configured parcel capacity and lunch-buying attendee count, when the system calculates the recommendation, then it divides the count by capacity and rounds up to a whole parcel.
- Given 10 lunch-buying attendees and a capacity of two people per parcel, when the recommendation is calculated, then it is five parcels.
- Given a recommended parcel quantity, when the order field first appears, then it is pre-filled with that recommendation or the previously confirmed quantity, and when I enter a different final quantity, then the daily record stores both quantities.

## Cost Allocation

### US-05: Allocate the Daily Lunch Cost

**As a** Lunch Coordinator, **I want** to enter the daily total cost and allocate it only among lunch-buying attendees **so that** each liable person receives a fair charge.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a total daily cost and one or more lunch-buying attendees, when I finalize allocation, then every lunch-buying attendee receives an equal charge and no home-food attendee receives a charge.
- Given charges that require currency rounding, when allocation is finalized, then the sum of allocated charges equals the entered total cost.
- Given no lunch-buying attendees, when I attempt to finalize allocation, then the system prevents finalization and explains that no liable attendees exist.
- Given a total cost entered in rupees, when allocation is finalized, then the system converts and rounds it to the smallest currency unit and displays charges and balances in rupees.

## Payment Tracking

### US-06: Track Payment Status and Outstanding Balances

**As a** Lunch Coordinator, **I want** to mark daily charges paid or unpaid and view current outstanding balances **so that** I can settle shared-lunch payments accurately.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given an allocated daily charge, when I mark it paid, then it no longer contributes to that person's outstanding balance.
- Given unpaid charges for a person on multiple lunch dates, when I view their balance, then it equals the sum of those unpaid charges.
- Given a recorded payment status, when I correct it, then the daily charge and current outstanding balance are recalculated.
- Given the payment list, when I view it, then I can distinguish paid and unpaid charges and see each person's outstanding balance.

## History and Balances

### US-07: Review Lunch History and Balances

**As a** Lunch Coordinator, **I want** to review each lunch date and every person's current outstanding balance **so that** I can answer payment and planning questions without manual reconstruction.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a completed lunch record, when I view daily history, then I can see attendance, home-food status, group allocation, parcel recommendation, final order, total cost, charges, and payment status.
- Given one or more recorded charges, when I view person balances, then I can see every person's current outstanding balance.
- Given archived people with historical charges, when I view history or balances, then their historical records remain available.

## Roster and Lunch-Day Correction

### US-08: Correct Accidental Roster and Lunch-Day Entries

**As a** Lunch Coordinator, **I want** to remove an accidentally added person or lunch day and receive a clear message when a chosen date already exists **so that** I can recover quickly from data-entry mistakes.

**Persona**: Lunch Coordinator

**Acceptance Criteria**:

- Given a person with no lunch-day history, when I remove them, then the system deletes them entirely.
- Given a person with existing lunch-day history, when I remove them, then the system archives them and explains why they could not be deleted.
- Given a lunch day created with the wrong date, when I remove it, then its attendance, groups, and charges are removed with it.
- Given a date that already has a lunch record, when I try to create another lunch day for that date, then the system shows a clear message that clears once I choose a different date.

## Requirements Coverage

| Requirements area | Stories |
|---|---|
| People and attendance | US-01, US-02 |
| Group allocation | US-03 |
| Parcel planning and order | US-04 |
| Cost allocation | US-05 |
| Payment tracking | US-06 |
| History and balances | US-07 |
| Roster and lunch-day correction | US-08 |