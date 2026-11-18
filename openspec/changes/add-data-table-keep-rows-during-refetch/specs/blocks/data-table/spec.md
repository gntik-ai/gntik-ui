## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Refresh loading keeps rows, footer and controls on screen

With `loading` `refresh` and at least one row, DataTable SHALL keep rendering the current rows, selection, virtualization and pagination footer with their controls enabled, SHALL set `aria-busy` on the table and SHALL show an indeterminate progress bar without changing the table's height. With no rows it SHALL render skeleton rows as `loading` true does.

#### Scenario: Server page refresh

- **GIVEN** a server table showing rows 21 to 40 of 95
- **WHEN** the caller renders it with `loading` refresh
- **THEN** rows 21 to 40 and the footer stay on screen
- **AND** the table has `aria-busy` true and an indeterminate progressbar is shown

#### Scenario: First load in refresh mode

- **WHEN** the caller renders `loading` refresh with no rows
- **THEN** skeleton rows are shown

### Requirement: Refresh announcements follow requests the table emitted

DataTable SHALL announce the updating status politely only for a refresh that follows a page, page-size, sort or view request it emitted; a refresh started without such a request MUST NOT be announced.

#### Scenario: Refresh after Next

- **GIVEN** a server table with caption Deployments
- **WHEN** the user activates Next and the caller renders `loading` refresh
- **THEN** a polite status reads Updating deployments…

#### Scenario: Silent poll

- **GIVEN** the same table with no recent interaction
- **WHEN** the caller renders `loading` refresh for a poll
- **THEN** the status stays empty and the table has `aria-busy` true

### Requirement: Filtered empty DataTables show the no-results state

When there are no rows and `filtered` is true, DataTable SHALL render `noResultsState`, falling back to `emptyState` and then the default. When `filtered` is false or unset it SHALL render `emptyState` or the default as before.

#### Scenario: No matches for a search

- **GIVEN** `noResultsState` and `emptyState` both supplied
- **WHEN** the table renders no rows with `filtered` true
- **THEN** the no-results state is shown

#### Scenario: Nothing created yet

- **WHEN** the same table renders no rows with `filtered` false
- **THEN** the empty state is shown

### Requirement: Skeleton loading keeps its current behaviour

With `loading` true, DataTable SHALL keep rendering skeleton rows, hiding the pagination footer and announcing the loading status exactly as before this change.

#### Scenario: Classic loading

- **WHEN** a table with caption Items renders with `loading` true
- **THEN** skeleton rows replace the rows and the footer is hidden
- **AND** the status reads Loading items…
