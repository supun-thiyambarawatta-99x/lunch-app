# Business Rules: UOW-02

## Charge Allocation Preconditions

1. The coordinator must provide a non-negative daily total cost in smallest currency units.
2. UOW-01 must provide a current eligible-attendee output for the lunch day.
3. UOW-01 must have a confirmed final parcel order; a lunch day requiring order reconfirmation cannot receive cost allocation.
4. The eligible-attendee output must contain at least one person. The system rejects allocation when nobody bought lunch.

## Equal Cost Allocation

1. Only eligible attendees receive a charge; absent and home-food attendees receive none.
2. Let $T$ be the total cost in smallest currency units and $n$ be the eligible-attendee count. Every attendee receives a base amount of $\lfloor T/n\rfloor$.
3. Let $r = T \bmod n$. The system assigns one additional smallest currency unit to each of the first $r$ attendees sorted by ascending display name, breaking equal-name ties by person identifier.
4. The sum of all charges must equal $T$ exactly.
5. Each newly allocated charge begins with payment status `Unpaid`.

## Cost-Change Rule

1. The coordinator may replace an existing day's cost only when no charge for that day is marked `Paid`.
2. When permitted, replacing the cost deletes that day's existing unpaid charges and creates a new equal allocation from the current eligible-attendee output.
3. When any charge is paid, the system rejects a cost change and requires the coordinator to preserve the settlement history.

## Payment and Balance Rules

1. The coordinator may mark an existing charge paid or unpaid to correct settlement status.
2. A current outstanding balance is the sum of all `Unpaid` charges for a person.
3. A `Paid` charge remains in the daily historical view with its amount and payment status, but contributes zero to the outstanding balance.
4. Updating payment status recalculates the affected person's outstanding balance immediately.

## History Rules

1. Daily history combines UOW-01 planning data and UOW-02 charge data for a lunch day.
2. Historical records remain accessible after a person is archived.
3. History is read-only from the coordinator interface except for the explicit payment-status correction action.