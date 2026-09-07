# Lunch Management System Requirements Questions

Please answer every question by entering the chosen letter after its `[Answer]:` tag. For `X) Other`, add the details after the letter.

## Question 1
What is the intended first delivery format?

A) Internal web application for office staff and lunch coordinators

B) Mobile application for office staff and lunch coordinators

C) Responsive web application designed primarily for mobile use

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should people be organized for lunch allocation?

A) Administrators create fixed groups and assign people to them

B) The system creates equal-sized groups automatically from the daily attendees

C) No groups are required; calculate lunch parcels for the whole office only

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 3
How should people bringing food from home be balanced across groups?

A) Distribute them as evenly as possible, allowing a difference of at most one person between groups

B) Require an exactly equal number in every group; report when this is impossible

C) Let the coordinator assign them manually

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How is the number of parcels determined?

A) One parcel for every attendee who does not bring food from home

B) The coordinator enters a parcel quantity after reviewing the calculated recommendation

C) Support a configurable number of people served by each parcel

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 5
How should lunch cost be handled?

A) Enter the total daily cost and divide it equally among attendees who do not bring food from home

B) Enter a fixed per-person price for attendees who do not bring food from home

C) Support either total-cost splitting or a fixed per-person price for each lunch date

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 6
Which payment capabilities are required initially?

A) Coordinators manually mark each person's payment as paid or unpaid, with a running outstanding balance

B) In addition to manual tracking, record payment date, amount, and notes for partial payments

C) Integrate with an online payment provider

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 7
Who will use the system and manage its data?

A) One coordinator manages people, attendance, orders, and payments; employees have no login

B) Coordinators manage records; employees log in to declare home food and view their own balance

C) All employees can manage shared daily lunch records and their own payment status

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 8
Which historical views are necessary for the first release?

A) Daily history and each person's current outstanding balance

B) Daily history, per-person balances, and monthly cost/payment summaries

C) Exportable reports for finance or administration

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 9
What scale and deployment are expected for the first release?

A) One office with fewer than 50 people; local or simple internal deployment is sufficient

B) One office with 50-500 people; deploy to a managed cloud environment

C) Multiple offices; deploy to a managed cloud environment with organization-level access control

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 10: Resiliency Extension
Should the resiliency baseline be applied to this project?

A) Yes - apply the resiliency baseline as directional design-time guidance for fault tolerance, availability, observability, and recovery

B) No - skip the resiliency baseline for this project

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 11: Security Extension
Should security extension rules be enforced for this project?

A) Yes - enforce all security rules as blocking constraints

B) No - skip all security rules

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 12: Property-Based Testing Extension
Should property-based testing rules be enforced for this project?

A) Yes - enforce all property-based testing rules

B) Partial - enforce them only for pure functions and serialization round-trips

C) No - skip all property-based testing rules

X) Other (please describe after [Answer]: tag below)

[Answer]:C