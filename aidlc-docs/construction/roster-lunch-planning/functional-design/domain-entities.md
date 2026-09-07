# Domain Entities: UOW-01

## Person

| Field | Description | Constraints |
|---|---|---|
| Person ID | Stable person identifier | Required; immutable. |
| Display name | Coordinator-facing name | Required; unique among active people. |
| Status | Active or archived | Archived people cannot be selected for a new lunch day. |

## Lunch Day

| Field | Description | Constraints |
|---|---|---|
| Lunch day ID | Stable daily record identifier | Required; immutable. |
| Date | Lunch date | Required; unique per lunch-day record. |
| Attendance entries | People and their daily attendance states | One entry per included person. |
| Group count | Derived number of groups | Equal to $\lceil\text{attendees}/7\rceil$ for at least one attendee. |
| Allocation status | Current or outdated | Becomes current after automatic recalculation. |
| Parcel capacity | People served per parcel | Required positive whole number. |
| Parcel recommendation | Derived purchase recommendation | Equal to $\lceil\text{lunch-buying attendees}/\text{parcel capacity}\rceil$. |
| Final parcel order | Coordinator-confirmed parcel quantity | Positive whole number when confirmed; becomes outdated after impacted changes. |
| Order status | Unconfirmed, confirmed, or reconfirmation required | Communicates whether the final order may still be relied on. |

## Attendance Entry

| Field | Description | Constraints |
|---|---|---|
| Person ID | Person represented by the entry | Must refer to an active person when a new entry is created. |
| Attendance state | Attending or absent | Required. |
| Home-food state | Brings home food or buys lunch | Relevant only when attending. |

## Group Allocation

| Field | Description | Constraints |
|---|---|---|
| Group number | Stable position within a lunch-day allocation | Starts at one and is unique in the allocation. |
| Members | Assigned attending people | Each attendee belongs to exactly one group. |
| Home-food count | Derived count | Counts group members with home-food state. |
| Lunch-buying count | Derived count | Counts attending members without home food. |

## Group Override (added 2026-09-04)

| Field | Description | Constraints |
|---|---|---|
| Lunch day ID | Owning lunch day | Required. |
| Person ID | Attendee being reassigned | Must be an attending person on the lunch day. |
| Target group number | Coordinator-chosen destination group | Must be a valid group number for the lunch day; ignored if the destination is already full. |

Overrides are re-applied after every automatic allocation so a manual move persists across attendance and capacity changes, subject to the seven-person group limit.

## Eligibility Output

UOW-01 provides a current eligible-attendee set to UOW-02. It contains the lunch-day identifier and exactly those attending people whose home-food state is false. This output is invalid when the lunch-day allocation is outdated or when the attendee set has changed without recalculation.