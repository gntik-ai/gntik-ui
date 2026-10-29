## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Server pagination keeps sortable headers when sorting is handled

With paginationMode server, a sortable column SHALL render its sort button and aria-sort whenever onSortChange or onQueryChange is supplied, and activating it SHALL call onSortChange with the next SortState without reordering rows. Without either callback the header MUST render as a plain header. A controlled sort SHALL change aria-sort only when its prop changes.

#### Scenario: Sorting a server page by name

- **GIVEN** a server table at page 1 with a sortable name column and onSortChange
- **WHEN** the user activates the Name header
- **THEN** onSortChange is called once with { columnId: 'name', direction: 'ascending' }
- **AND** the header exposes aria-sort ascending
- **AND** the rows keep the order in which they were supplied
- **AND** activating the header again requests descending

#### Scenario: Server table without sort handling

- **GIVEN** a server table with sortable columns and neither onSortChange nor onQueryChange
- **WHEN** it renders, with or without resizable headers
- **THEN** no header contains a sort button, sort icon or aria-sort

### Requirement: Server-mode sort change requests the first page

When the sort changes in server mode and the controlled page is not 1, DataTable SHALL call onPageChange(1) exactly once. At page 1 it SHALL NOT call onPageChange for sorting.

#### Scenario: Sorting from page 3

- **GIVEN** a server table at page 3 with onPageChange
- **WHEN** the user activates a sortable header
- **THEN** onPageChange is called once with 1

### Requirement: onQueryChange reports page, page size, sort and filters in one call

DataTable SHALL call onQueryChange synchronously exactly once per user change of page, page size, sort or saved view in either pagination mode, with the complete next query: page, pageSize, sort, filters and cause. A page-size change that also moves the page SHALL produce a single call carrying both values. Existing callbacks SHALL retain their order and arguments. Consumer filter prop changes SHALL NOT emit query changes.

#### Scenario: Page-size change with keep-first-row

- **GIVEN** a server table at page 2 with page size 20, sort by name ascending and filters { status: 'failed' }
- **WHEN** the user picks 50 rows per page
- **THEN** onQueryChange is called once with { page: 1, pageSize: 50, sort: { columnId: 'name', direction: 'ascending' }, filters: { status: 'failed' }, cause: 'pageSize' }
- **AND** onPageSizeChange(50) precedes onPageChange(1)

#### Scenario: Next page

- **GIVEN** the same table at page 1 with page size 50
- **WHEN** the user activates Next
- **THEN** onQueryChange is called once with page 2 and cause page

### Requirement: Saved views restore sort in server-paginated tables

Applying a saved view whose sort differs from the current one in server mode SHALL call onSortChange with the view's non-null sort, request page 1 and call onQueryChange with cause view and the view's filters. An unchanged sort SHALL NOT call onSortChange or reset the server page. A cleared sort SHALL be reported as null through onQueryChange.

#### Scenario: View sorted by id

- **GIVEN** a server table at page 2 sorted by name and a saved view sorted by id ascending
- **WHEN** the user selects that view
- **THEN** onSortChange is called with { columnId: 'id', direction: 'ascending' }
- **AND** onQueryChange is called once with page 1 and cause view
