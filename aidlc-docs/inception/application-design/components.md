# Components

## Coordinator Web Interface

**Purpose**: Provides the Lunch Coordinator's desktop web experience.

**Responsibilities**: Renders roster, daily lunch, group, order, cost, payment, history, and balance views; collects coordinator actions; displays calculated results and validation feedback.

**Interface**: Calls application services only. It does not calculate allocations or access persisted records directly.

## Roster Component

**Purpose**: Manages people who can participate in lunch days.

**Responsibilities**: Create, update, list, and archive people; provide active people for new lunch records; preserve archived people in historical records.

**Interface**: Exposes person-management operations through `RosterService`.

## Lunch Day Component

**Purpose**: Owns the dated daily lunch record and attendance declarations.

**Responsibilities**: Create lunch days; record attendance and home-food status; coordinate group allocation, parcel planning, final orders, and daily-record retrieval.

**Interface**: Exposes daily lunch operations through `LunchDayService`.

## Allocation Component

**Purpose**: Contains reusable, deterministic group and parcel calculations.

**Responsibilities**: Allocate attendees into near-equal groups, balance home-food attendees, count lunch-buying attendees, and recommend parcels from capacity.

**Interface**: Pure domain operations invoked by `LunchDayService`.

## Billing Component

**Purpose**: Owns charge allocation and settlement state.

**Responsibilities**: Allocate a daily total among lunch-buying attendees, preserve total-cost accuracy after rounding, mark charges paid or unpaid, and calculate outstanding balances.

**Interface**: Exposes financial operations through `BillingService`.

## History and Balance Component

**Purpose**: Presents stored daily records and current balances.

**Responsibilities**: Retrieve completed lunch-day details and aggregate unpaid charges by person.

**Interface**: Exposes read operations through `HistoryService`.

## Local Persistence Component

**Purpose**: Stores all first-release data in a local file-based database.

**Responsibilities**: Persist people, lunch days, attendance, group assignments, parcel settings and orders, charges, and payment status; provide transactional record updates.

**Interface**: Repository interfaces consumed by application services; no user-interface dependency.