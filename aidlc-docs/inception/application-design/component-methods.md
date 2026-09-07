# Component Methods

The signatures below describe high-level contracts only. Detailed calculation rules are deferred to Functional Design.

## Shared Models

- `Person`: roster identity and active/archive status.
- `LunchDay`: date, attendees, group assignments, parcel capacity, parcel recommendation, final order, and total cost.
- `Attendance`: person identity, attendance state, and home-food state.
- `GroupAllocation`: group membership and derived group counts.
- `Charge`: lunch-day identity, person identity, allocated amount, and paid/unpaid status.
- `PersonBalance`: person identity and aggregate unpaid amount.

## RosterService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `createPerson` | person details | `Person` | Add a person to the active roster. |
| `updatePerson` | person identity and updates | `Person` | Change roster details. |
| `archivePerson` | person identity | `Person` | Prevent future selection while retaining history. |
| `listActivePeople` | none | `Person[]` | Supply people for a new lunch day. |

## LunchDayService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `createLunchDay` | date, group count | `LunchDay` | Start a daily record. |
| `recordAttendance` | lunch-day identity, `Attendance[]` | `LunchDay` | Store attendance and home-food declarations. |
| `generateAllocation` | lunch-day identity | `GroupAllocation[]` | Request balanced group allocation. |
| `setParcelCapacity` | lunch-day identity, people per parcel | `LunchDay` | Store the capacity and refresh the recommendation. |
| `confirmParcelOrder` | lunch-day identity, parcel quantity | `LunchDay` | Store the coordinator's final order. |
| `getLunchDay` | lunch-day identity | `LunchDay` | Retrieve daily detail. |

## AllocationCalculator

| Method | Input | Output | Purpose |
|---|---|---|---|
| `allocateGroups` | attendees, group count | `GroupAllocation[]` | Produce balanced group assignments. |
| `recommendParcels` | lunch-buying count, people per parcel | integer | Produce the round-up parcel recommendation. |

## BillingService and BillingCalculator

| Method | Input | Output | Purpose |
|---|---|---|---|
| `allocateCharges` | lunch-day identity, total cost | `Charge[]` | Create charges for lunch-buying attendees. |
| `setPaymentStatus` | charge identity, paid status | `Charge` | Record or correct settlement state. |
| `splitCost` | total cost, liable people | money amounts | Allocate a total deterministically. |
| `calculateOutstandingBalance` | charges for a person | `PersonBalance` | Aggregate unpaid charges. |

## HistoryService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `listLunchHistory` | optional date range | `LunchDay[]` | Retrieve daily history. |
| `listPersonBalances` | none | `PersonBalance[]` | Retrieve all current balances. |