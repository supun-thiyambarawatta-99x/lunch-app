# Domain Entities: UOW-02

## Charge

| Field | Description | Constraints |
|---|---|---|
| Charge ID | Stable charge identifier | Required; immutable. |
| Lunch day ID | Source lunch day | Required; references a UOW-01 lunch day. |
| Person ID | Liable person | Required; must occur once in the current UOW-01 eligibility output. |
| Display name snapshot | Name used for deterministic remainder ordering and history | Required when the charge is created. |
| Amount in minor units | Allocated share of the total cost | Non-negative whole number. |
| Payment status | Paid or unpaid | Required; initially unpaid. |

## Payment Status

`Unpaid` means the charge contributes its full amount to the person's outstanding balance. `Paid` means it contributes zero to that balance while remaining visible in daily history.

## Person Balance

| Field | Description |
|---|---|
| Person ID | Person whose liability is aggregated. |
| Display name | Current or historical display name for coordinator review. |
| Outstanding amount in minor units | Sum of the person's unpaid charges. |

## Historical Lunch-Day View

Combines UOW-01's stored lunch-day detail with UOW-02 charges and their payment statuses. It retains all attendees, order information, total cost, charges, and settlements for each completed day.