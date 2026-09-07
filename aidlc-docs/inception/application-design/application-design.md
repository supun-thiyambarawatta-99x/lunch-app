# Application Design Summary

## Architecture

The first release is a modular monolith: one internal web application containing a Coordinator Web Interface, application-service layer, reusable domain calculation components, and local file-based persistence. This fits the small one-office deployment while preserving clear boundaries for future change.

## Component Model

- **Coordinator Web Interface**: Coordinator-only desktop views and actions.
- **Roster Component**: Active and archived people.
- **Lunch Day Component**: Daily attendance, home food, groups, parcel settings, recommendations, and final orders.
- **Allocation Component**: Reusable balanced-group and parcel-recommendation calculations.
- **Billing Component**: Charges, payment status, and outstanding balances.
- **History and Balance Component**: Historical daily records and current balances.
- **Local Persistence Component**: File-based durable records behind repositories.

## Design Decisions

1. Application services, rather than user-interface components, invoke calculation logic.
2. Calculation rules are reusable pure domain operations and will be specified in the Functional Design stage.
3. A local file-based database is sufficient for the first-release scale and deployment expectation.
4. A coordinator may override the calculated parcel recommendation, while both quantities remain stored.
5. Charges and payment state are separate from attendance so historical financial information persists after roster changes.

## Artifact Index

- [Components](components.md)
- [Component methods](component-methods.md)
- [Services](services.md)
- [Component dependencies](component-dependency.md)