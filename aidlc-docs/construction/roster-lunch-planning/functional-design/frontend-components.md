# Frontend Components: UOW-01

## Component Hierarchy

- `RosterPage`
  - `PersonList`
  - `PersonForm`
  - `ArchivePersonAction`
- `LunchDayPage`
  - `LunchDayForm`
  - `AttendanceEditor`
  - `AllocationSummary`
  - `GroupList`
  - `ParcelPlanPanel`

## Component Contracts

| Component | Inputs and state | Actions | Service integration |
|---|---|---|---|
| `PersonList` | Active and archived people | Open edit or archive action | `RosterService.listActivePeople`, archive operation |
| `PersonForm` | Display name, validation errors | Create or update person | `RosterService.createPerson`, `updatePerson` |
| `LunchDayForm` | Selected date, existing-day validation | Create or open lunch day | `LunchDayService.createLunchDay` |
| `AttendanceEditor` | Roster entries, attendance and home-food values | Save a changed declaration | `LunchDayService.recordAttendance` |
| `AllocationSummary` | Current/outdated status, group count, buying count | Refresh display after automatic calculation | `LunchDayService.getLunchDay` |
| `GroupList` | Group memberships and derived counts | Read-only review | `LunchDayService.getLunchDay` |
| `ParcelPlanPanel` | Parcel capacity, recommendation, final-order status and quantity | Change capacity; confirm or reconfirm order | `LunchDayService.setParcelCapacity`, `confirmParcelOrder` |

## User Interaction Rules

1. Attendance changes immediately refresh displayed group and parcel calculations after a successful save.
2. A home-food control is unavailable for an absent person.
3. The coordinator sees an explicit reconfirmation-required state when a confirmed order is affected by planning changes.
4. The parcel-confirmation action validates a positive whole-number quantity.
5. Every interactive control receives a stable automation identifier during implementation, following the project's `data-testid` naming convention.

## Form Validation

- Display name: required and unique among active people.
- Lunch date: required and unique.
- Parcel capacity: required positive whole number.

## Maintenance Amendments (2026-09-04)

1. **Removal actions**: `PersonList` and `LunchDayForm`'s day list each expose a destructive "Remove" action; person removal reports whether the person was deleted or archived, and lunch-day removal deletes the day's attendance, overrides, and charges.
2. **Date-conflict feedback**: `LunchDayForm` shows an inline validation message when the chosen date already has a lunch day, and clears it as soon as the coordinator edits the date.
3. **Immediate persistence**: Attendance and home-food toggles call `LunchDayService.recordAttendance` immediately; a manual "Reload" action remains only as a fallback full refresh, not a required save step.
4. **Aggregate group summary**: The planner displays one summary card with total people, calculated group count, total home food, people who did not bring lunch, and the global parcel recommendation. Per-member names and group-move controls are not shown in the group summary UI.
5. **Bound order input**: `ParcelPlanPanel`'s order field initializes to the current recommendation or previously confirmed quantity instead of remaining empty with only a placeholder.
6. **Toast notifications and button styling**: Actions report success or failure through non-blocking toast messages; primary, secondary, and destructive actions use visually distinct button colors.
- Final parcel order: required positive whole number when confirmed.
- Attendance and home-food changes: rejected if they reference a person not available to the lunch day.