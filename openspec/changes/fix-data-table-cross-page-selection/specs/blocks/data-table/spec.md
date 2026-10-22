## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Server-mode selection keeps ids from pages not on screen

With `paginationMode` `server`, DataTable SHALL keep every selected id when `rows` changes, and `onSelectionChange`, the toolbar count and the first `bulkActions` argument SHALL list the whole selection, including ids whose rows are not in the current `rows`. With `preserveSelection` set to `false` the table SHALL report only ids present in `rows`.

#### Scenario: Selection survives a server page change

- **GIVEN** a server-paginated table with `rowCount` 95 and page size 20
- **AND** rows 1 and 2 selected on page 1
- **WHEN** the consumer passes the rows of page 2 and the user selects row 21
- **THEN** `onSelectionChange` is called with `['1', '2', '21']`
- **AND** the toolbar reads 3 selected

#### Scenario: Opting out restores page-only reporting

- **GIVEN** the same table with `preserveSelection={false}`
- **WHEN** row 21 is selected on page 2
- **THEN** `onSelectionChange` is called with `['21']`

### Requirement: Select-all-matching strip extends a full page selection to every match

When `selectAllMatching` is set and every selectable row of the page is selected while more rows match, DataTable SHALL offer to select all matching rows. In client mode this SHALL select every enabled row in `rows`; in server mode it SHALL switch to an exclude model, reported through `onSelectionModelChange` and passed to `bulkActions` as its second argument.

#### Scenario: Client table selects all rows across pages

- **GIVEN** a client table with 95 rows, 10 per page and `selectAllMatching`
- **WHEN** the user checks the page checkbox and activates Select all 95 rows
- **THEN** `onSelectionChange` reports 95 ids
- **AND** the strip reads All 95 rows are selected and focus stays on its button, now named Clear selection

#### Scenario: Server table switches to an exclude model

- **GIVEN** a server table with `rowCount` 95, `selectAllMatching` and `onSelectionModelChange`
- **WHEN** the user selects all matching rows and then unchecks row 3
- **THEN** `onSelectionModelChange` last receives `{ type: 'exclude', ids: ['3'] }`
- **AND** the toolbar reads 94 selected

### Requirement: All-matching selection clears when the table filters change

An exclude-model selection SHALL be cleared to an empty include selection, reported through `onSelectionChange` and `onSelectionModelChange`, when the `filters` prop changes value. Page, page-size and sort changes MUST keep the selection.

#### Scenario: New filters drop the all-matching selection

- **GIVEN** an active selection `{ type: 'exclude', ids: [] }`
- **WHEN** `filters` changes from `{ status: 'failed' }` to `{ status: 'paused' }`
- **THEN** `onSelectionModelChange` receives `{ type: 'include', ids: [] }`
- **AND** `onSelectionChange` receives an empty list

#### Scenario: Paging keeps the all-matching selection

- **GIVEN** an active selection `{ type: 'exclude', ids: ['3'] }`
- **WHEN** the consumer passes page 2
- **THEN** no selection callback fires and the toolbar still reads 94 selected

### Requirement: Multiple-selection checkboxes honour isRowDisabled

In multiple selection mode, a row for which `isRowDisabled` returns true SHALL render a disabled checkbox, and the page, group and select-all-matching toggles SHALL neither select it nor count it when computing the header's checked and indeterminate state.

#### Scenario: Locked row is skipped by the page checkbox

- **GIVEN** a page of 10 rows where row 4 is locked and `isRowDisabled` returns true for it
- **WHEN** the user checks the page checkbox
- **THEN** nine ids are reported and row 4's checkbox stays unchecked and disabled
- **AND** the page checkbox is checked, not indeterminate

### Requirement: Single selection keeps its choice across client and server pages

Single (radio) selection SHALL accept `paginated` and `paginationMode` `server`. The selected id SHALL persist across pages; when its row is not on the current page, no radio SHALL be checked and the first enabled radio SHALL be the tab stop.

#### Scenario: Selected row on another page

- **GIVEN** single mode, server pagination and `selectedId` 42
- **WHEN** page 1 with rows 1 to 20 is shown
- **THEN** no radio is checked
- **AND** Tab enters the group on the first enabled radio

#### Scenario: Returning to the selected row's page

- **WHEN** page 3 with rows 41 to 60 is shown
- **THEN** the radio of row 42 is checked and is the tab stop

### Requirement: hideSelectAll removes only the page select-all checkbox

With `hideSelectAll` set in multiple mode, DataTable SHALL render no header checkbox, SHALL keep an sr-only selection heading in that column, and row checkboxes MUST keep working.

#### Scenario: Header without select-all

- **WHEN** a multiple-selection table renders with `hideSelectAll`
- **THEN** no checkbox named Select all rows on this page exists
- **AND** the first column header has the accessible name Selection
- **AND** toggling a row checkbox still calls `onSelectionChange`
