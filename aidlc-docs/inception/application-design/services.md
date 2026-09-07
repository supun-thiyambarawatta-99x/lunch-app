# Services

## Service Layer

The modular monolith uses application services as the boundary between the Coordinator Web Interface, reusable domain components, and local persistence. Services coordinate a use case, persist its result, and return display-ready results. They do not embed allocation or cost-splitting rules.

## RosterService

Coordinates roster changes with the local people repository. It enforces that archived people cannot be selected for new lunch days while historical references remain retrievable.

## LunchDayService

Coordinates daily lunch preparation. It combines active people, attendance declarations, `AllocationCalculator`, parcel settings, and lunch-day persistence. It maintains the distinction between calculated parcel recommendation and coordinator-confirmed order quantity.

## BillingService

Coordinates final cost allocation and payment-status updates. It obtains eligible lunch-buying attendees from the stored lunch day, invokes `BillingCalculator`, persists charges, and returns updated balances.

## HistoryService

Coordinates read-only history and balance queries. It retrieves complete lunch-day records and uses persisted charges to present current per-person outstanding amounts.

## Service Orchestration

1. The Coordinator Web Interface requests active people from `RosterService` and creates a lunch day through `LunchDayService`.
2. `LunchDayService` records attendance, invokes `AllocationCalculator`, stores allocations, and returns group and parcel details.
3. The interface provides the daily total cost to `BillingService`, which creates charges only for eligible attendees.
4. `BillingService` updates payment status and the interface reads balances through `HistoryService`.