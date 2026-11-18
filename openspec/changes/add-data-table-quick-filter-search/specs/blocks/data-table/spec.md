## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Quick filter keeps rows where every term matches a searchable column

In client mode the DataTable SHALL keep only rows in which every whitespace-separated term of the quick filter matches the text of at least one searchable column, ignoring case and accents, and SHALL apply it before grouping, sorting and pagination.

#### Scenario: Two terms across columns

- **GIVEN** rows `orders-api` in `eu-west-1` and `billing-sync` in `us-east-1`
- **WHEN** the quick filter is `orders eu`
- **THEN** only `orders-api` is rendered
- **AND** the pagination footer reports 1 row

#### Scenario: Accent-insensitive term

- **GIVEN** a row named `Función`
- **WHEN** the quick filter is `funcion`
- **THEN** the row is rendered

#### Scenario: Term change returns to the first page

- **GIVEN** a client table showing page 3
- **WHEN** the quick filter changes
- **THEN** page 1 is shown

### Requirement: Column quickFilter setting decides whether and how a column is searched

A column with `quickFilter: false` MUST NOT be searched; a hidden column SHALL be searched only when it sets `quickFilter: true`; a function value SHALL replace the text match for its column and receive the row and one term.

#### Scenario: Opted-out column

- **GIVEN** the `region` column sets `quickFilter: false`
- **WHEN** the quick filter is `eu-west`
- **THEN** no row matches through the region column

#### Scenario: Custom matcher on an undisplayed field

- **GIVEN** an actor column whose `quickFilter` function checks the actor's name and email
- **WHEN** the quick filter is `ana@example.test`
- **THEN** the row of that actor is rendered although the email is not displayed

### Requirement: Server-mode quick filter reports the term and requests the first page

In `paginationMode="server"` the DataTable MUST NOT filter `rows`; it SHALL report each applied term through `onQuickFilterChange` and through `onQueryChange` with `quickFilter` set and `cause: 'quickFilter'`, and SHALL call `onPageChange(1)` when the current page is not 1.

#### Scenario: Search on a later server page

- **GIVEN** a server table on page 4
- **WHEN** the built-in field applies `eu`
- **THEN** `onQuickFilterChange` receives `eu` once
- **AND** `onQueryChange` receives `quickFilter: 'eu'` with `cause: 'quickFilter'`
- **AND** `onPageChange` receives 1
- **AND** the rendered rows stay as passed until new `rows` arrive

### Requirement: Built-in quick filter field debounces typing and can collapse to a button

With `showQuickFilter` the toolbar SHALL render a search field named after the caption that applies its text `quickFilterDebounceMs` after the last keystroke, at once on Enter, and clears at once on Escape; with `'collapsible'` it SHALL start as an icon button with `aria-expanded="false"` that shows and focuses the field.

#### Scenario: Debounced typing

- **GIVEN** `showQuickFilter` with the default 300 ms delay
- **WHEN** the user types `ord` within 300 ms
- **THEN** `onQuickFilterChange` fires once with `ord`, 300 ms after the last key
- **AND** a polite status then reports the match count

#### Scenario: Collapsing an empty field

- **GIVEN** `showQuickFilter="collapsible"` and no term
- **WHEN** the user activates the search button and then presses Escape in the empty field
- **THEN** the field was shown with focus after activation
- **AND** after Escape the field is hidden and focus is on the search button
