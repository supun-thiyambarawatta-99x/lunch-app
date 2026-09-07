# Frontend Components: UOW-02

## Component Hierarchy

- `BillingPanel`
  - `TotalCostForm`
  - `ChargeAllocationTable`
  - `PaymentStatusControl`
- `BalancePage`
  - `PersonBalanceList`
- `HistoryPage`
  - `LunchHistoryList`
  - `LunchHistoryDetail`

## Component Contracts

| Component | Inputs and state | Actions | Service integration |
|---|---|---|---|
| `TotalCostForm` | Lunch-day identity, total cost, allocation eligibility | Submit or change daily total | `BillingService.allocateCharges` |
| `ChargeAllocationTable` | Charges, total allocated, payment statuses | Review allocation and choose a charge | Billing/history read services |
| `PaymentStatusControl` | Charge identity and current status | Toggle paid/unpaid | `BillingService.setPaymentStatus` |
| `PersonBalanceList` | Current person balances | Read-only balance review | `HistoryService.listPersonBalances` |
| `LunchHistoryList` | Completed lunch days | Select a day | `HistoryService.listLunchHistory` |
| `LunchHistoryDetail` | Planning detail and charges | View historical record | `HistoryService.getLunchHistory` |

## Interaction and Validation Rules

1. The billing panel displays a blocking reason instead of its allocation action when eligibility is outdated, the final order is unconfirmed, or no eligible attendee exists.
2. Currency input is validated as a non-negative value with precision no smaller than the selected currency's smallest unit.
3. Cost editing is disabled with an explanatory message when any charge for that day is paid.
4. Paid/unpaid controls update outstanding balances after a successful save.
5. Daily history always displays settled charges and their statuses.
6. Every interactive control receives a stable `data-testid` during implementation.

## Maintenance Amendments (2026-09-04)

1. **Rupee entry and display**: `TotalCostForm` accepts the daily total in rupees and converts it to the smallest currency unit (rounded) before calling `BillingService.allocateCharges`; charges and balances display in rupees.
2. **Toast notifications**: Cost allocation and payment-status changes report success or failure through non-blocking toast messages in addition to the existing blocking-reason banner.