# Unit of Work Plan

## Objective

Decompose the Office Lunch Management System into manageable development work while preserving the approved modular-monolith architecture. The approved outcome is two separately managed Units of Work in one deployable application.

## Proposed Decomposition

### UOW-01: Roster and Lunch Planning

**Scope**: Coordinator web interface features for roster management, daily attendance and home-food declarations, balanced group allocation, parcel capacity, parcel recommendation, and final order confirmation.

**Internal modules**: Roster, Lunch Day, Allocation, and shared local persistence access.

**Stories**: US-01 through US-04.

### UOW-02: Billing, History, and Balances

**Scope**: Coordinator web interface features for daily cost allocation, paid/unpaid status, outstanding balances, and historical record views.

**Internal modules**: Billing, History and Balances, and shared local persistence access.

**Stories**: US-05 through US-07.

**Rationale**: The units remain one deployable application but provide separately managed planning and financial work areas. Both units are owned by the same small team and communicate through application services rather than direct repository access.

## Category Assessment

- **Story grouping**: US-01 through US-04 belong to UOW-01; US-05 through US-07 belong to UOW-02.
- **Dependencies**: UOW-02 relies on completed lunch-day data from UOW-01; application services coordinate both units through repository interfaces over the shared local database.
- **Team alignment**: One small team owns both units.
- **Technical considerations**: The application runs locally on a coordinator-controlled machine or internal workstation as one deployable application.
- **Business domain**: Roster, planning, and billing are related capabilities serving one daily office-lunch domain.
- **Code organization**: The two units will be separate feature areas within one application codebase; exact directories will be selected during Code Generation planning.

## Execution Checklist

- [x] Review approved application design, requirements, user stories, and execution plan.
- [x] Identify the proposed single-unit boundary and its internal feature modules.
- [x] Confirm decomposition preferences from the questions below.
- [x] Analyze all responses for ambiguity or contradiction.
- [x] Obtain explicit approval of the unit-of-work plan.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`.
- [x] Document greenfield code organization strategy in `unit-of-work.md`.
- [x] Validate unit boundaries, dependencies, and story coverage.
- [x] Obtain explicit approval of generated unit artifacts.

## Questions

## Question 1
How should the approved stories be grouped for delivery within the single application unit?

A) Keep all stories in one cohesive unit and organize implementation internally by feature module

B) Split roster and lunch planning from billing and history into separately managed work units, while still deploying one application

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 2
How should team ownership be organized for the first release?

A) One small team owns the complete application unit

B) Separate owners handle the roster and planning modules versus billing and history modules within the same application unit

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Clarification Question 5
Question 1 selects separately managed work units, while the proposed plan defines one unit. Which unit boundary should be used for generation?

A) Create two work units in the same application: UOW-01 Roster and Lunch Planning; UOW-02 Billing, History, and Balances. Both are owned by the same small team and share the local database through application services.

B) Keep one work unit and use internal feature modules only.

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
What delivery model should the unit target initially?

A) Run locally on a coordinator-controlled machine or internal workstation

B) Deploy as a single internal application on office-managed hosting

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
How should internal modules share data?

A) Application services coordinate module interactions through repository interfaces over one local file-based database

B) Modules call each other's repositories directly when they need related data

X) Other (please describe after [Answer]: tag below)

[Answer]:A