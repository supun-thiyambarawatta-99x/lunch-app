# Office Lunch Management System Requirements

## Intent Analysis

- **User request**: Build an internal system for coordinating office lunches, balancing home-food attendees between automatically formed groups, calculating and confirming the required lunch-parcel order, splitting daily costs fairly, and tracking unpaid balances.
- **Request type**: New project
- **Scope estimate**: Multiple components
- **Complexity estimate**: Moderate
- **Requirements depth**: Standard

## Product Scope

The first release is an internal web application for one office with fewer than 50 people. A single coordinator manages all people, daily lunch records, orders, and payment status. Employees do not log in.

## Functional Requirements

### People and Attendance

1. The coordinator can create, view, edit, and archive people in the office roster.
2. The coordinator can create a lunch record for a selected date and mark each active person as attending or absent.
3. For every attendee, the coordinator can mark whether the person brings food from home.
4. The system must retain each completed daily record for later review.
5. The coordinator can remove an accidentally added person using a red trash-icon action; the system deletes the person outright if they have no lunch-day history, or archives them and explains why if history exists.
6. The coordinator can remove an accidentally created lunch day using a red trash-icon action, along with its attendance, group, and charge records.
7. If the coordinator selects a date that already has a lunch record, the system displays a clear message (for example, "This date already exists.") next to the date field; the message clears automatically once the coordinator selects a different date.
7a. If the coordinator enters a name that already belongs to an active person, the system displays an inline message ("This name already exists.") next to the name field instead of a raw database error; the message clears automatically once the coordinator edits the name. Blank or whitespace-only names are rejected inline without a server request.
7b. People added to the roster after a lunch day was created must automatically appear in that lunch day's attendance list, defaulting to attending without home food.

### Group Allocation

8. The system automatically creates equal-sized groups from the daily attendees.
9. When equal-sized groups are impossible because the attendee count is not evenly divisible, group sizes may differ by at most one person.
10. The system automatically allocates attendees bringing food from home as evenly as possible between groups, with a difference of at most one such attendee between any two groups.
11. Each group card displays its metrics in larger font values: total headcount, home-food count, and recommended parcels for the count of people who did not bring lunch.
12. Group membership, group counts, and the recommended-parcel figure stay synchronized with the latest saved attendance and home-food changes without requiring a manual reload.
13. Each group card displays its own recommended parcel count, calculated from that group's count of people who did not bring lunch and the configured parcel capacity, displayed immediately after that group's count.

### Parcel Planning and Order

17. The coordinator can configure the number of people served by one lunch parcel.
18. The system calculates the recommended parcel quantity by dividing the number of attendees without home food by the configured parcel capacity and rounding up to the next whole parcel.
19. The coordinator can enter the final ordered parcel quantity after reviewing the recommendation; the input starts pre-filled with the current recommendation, or the previously confirmed quantity, rather than left blank.
20. The daily lunch record must retain both the recommendation and the coordinator-confirmed order quantity.

### Cost Allocation

21. The coordinator enters the total cost for the daily lunch order in the office currency (rupees); the system converts and rounds the entered amount to the smallest currency unit before allocation.
22. The system divides this cost equally among all attendees who did not bring food from home.
23. The system must prevent finalization of cost allocation when there are no eligible attendees.
24. The daily record must show each liable attendee's charge and the total allocated amount in rupees; rounding must be deterministic and preserve the total entered daily cost.

### Payment Tracking

25. The coordinator can mark a person's charge for a day as paid or unpaid.
26. A person's outstanding balance is the sum of all unpaid charges across lunch dates.
27. A paid charge must no longer contribute to the person's outstanding balance.
28. The system must list people with paid, unpaid, and outstanding payment status, including their current outstanding balance.
29. The system must allow the coordinator to correct an incorrectly recorded payment status while preserving the resulting current balance.
30. The coordinator can see every person's current outstanding balance in a persistent side panel, visible regardless of which lunch day is selected, presented in an unbordered table of name and balance.

### History

31. The coordinator can view daily lunch history, including attendance, home-food status, groups, parcel recommendation and final order, total cost, allocated charges, and payment status.
32. The coordinator can view every person's current outstanding balance.

## Business Rules

1. Only attendees who did not bring food from home are liable for that day's lunch cost.
2. Home-food attendees are counted in the daily headcount and included in group balancing, but receive no parcel-cost charge.
3. The system must not create more parcel recommendations than necessary for the configured parcel capacity.
4. A final order quantity may differ from the recommendation because the coordinator has authority to adjust it.
5. An archived person remains visible in historical records but is unavailable for new lunch records. Archived people appear in the outstanding-balances panel only while they still owe money.

## Example

For 14 attendees split into two groups, with four people bringing food from home, the system assigns two home-food attendees to each group. If each parcel serves one person, the recommendation is 10 parcels. If each parcel serves two people, the recommendation is five parcels. The total daily lunch cost is split among the 10 attendees without home food.

## Non-Functional Requirements

1. The system must support routine coordinator use on current desktop web browsers.
2. The system must make daily attendance, group assignments, parcel recommendation, final order, charges, and payment status understandable without manual calculations.
3. Coordinator changes to attendance, home-food status, and parcel capacity must apply immediately without a manual reload step.
4. The system must provide non-blocking success and error notifications (toasts) for coordinator actions, and use visually distinct colors for primary, secondary, and destructive (remove) actions.
5. The system must preserve historical financial records when people are archived or later payment statuses are corrected.
6. The initial deployment may be local or a simple internal deployment and needs to support fewer than 50 people in one office.
7. The initial release does not include employee authentication, employee self-service, online payment collection, financial exports, monthly summaries, managed-cloud deployment, or multi-office support.
8. Before showing the main coordinator workspace, the system must present a soft-colored landing screen featuring a charming 3D cartoon chef accountant character working at a desk with floating food and grocery items, and a prominent "Start Workspace" action that reveals the main application without a page reload.
9. The coordinator workspace must load people, lunch days, and outstanding balances through one dashboard request rather than separate initial requests.
10. After a successful person or lunch-day mutation, the interface must update its local state from the mutation response without refetching the complete dashboard.
11. Hosted deployments must use a persistent external database; Vercel `/tmp` storage is development-only and must not be treated as durable production storage.

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Resiliency Baseline | N/A | User selected no. |
| Security Baseline | N/A | User selected no. |
| Property-Based Testing | N/A | User selected no. |

## Acceptance Criteria

1. Given 14 attendees, two groups, and four home-food attendees, the system creates two groups of seven with two home-food attendees in each.
2. Given an attendee count or home-food count that cannot be divided exactly between groups, the relevant group counts differ by no more than one.
3. Given 10 attendees who did not bring lunch and a parcel capacity of two, the system recommends five parcels.
4. Given a recommended quantity, the coordinator can store a different final order quantity, and the input starts pre-filled with the current recommendation or previously confirmed quantity.
5. Given a total cost in rupees and eligible attendees, the system creates charges only for those attendees, in the smallest currency unit, and the charges sum to the total cost after rounding.
6. Given unpaid charges for a person across multiple dates, the system displays the sum as their outstanding balance; marking a charge paid reduces that balance by its charge amount.
7. Given a coordinator selects a date that already has a lunch record, the system shows a clear inline message that disappears once a different date is chosen.
8. Given a person with no recorded lunch-day history, removing them deletes the record; given a person with history, removing them archives the record and states why.
9. Given an attendee moved to a different group, the destination group gains the member and its counts update immediately, provided the destination has fewer than seven members.