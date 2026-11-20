## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Page-mode sticky header pins the header row below the offset

With `stickyHeader` and a table that fits its container's width, the header row SHALL stay pinned `stickyHeaderOffset` below the top of the nearest scrolling ancestor while the rows scroll under it, with opaque header cells, and SHALL scroll away with the end of the table.

#### Scenario: Inside SidebarLayout

- **GIVEN** a 60-row DataTable with `stickyHeader` in SidebarLayout's main
- **WHEN** main scrolls by 800 px
- **THEN** the header row's top equals main's top
- **AND** body rows pass under the opaque header

#### Scenario: Under a StackedLayout header

- **GIVEN** `stickyHeaderOffset={60}` inside StackedLayout
- **WHEN** the page scrolls by 800 px
- **THEN** the header row's top is 60 px below the viewport top
- **AND** the layout header paints above the table

### Requirement: Wide page-mode tables switch to a bounded body with an on-screen scrollbar

With `stickyHeader` and a table wider than its container, the DataTable SHALL bound its scroll body to the visible height of the nearest scrolling ancestor minus the offset, keep the header pinned inside it and expose it as a focusable region named by the caption, and SHALL return to page mode once the table fits.

#### Scenario: Too many columns

- **GIVEN** 12 columns of 160 px in a main area 900 px wide and 700 px high
- **AND** `stickyHeader` with the default offset
- **WHEN** the table renders
- **THEN** the scroll body's max height is 700 px
- **AND** the root has `data-sticky-header="bounded"`
- **AND** the region is named after the caption

#### Scenario: Window widened

- **GIVEN** the bounded body from the previous scenario
- **WHEN** the container becomes wider than the table
- **THEN** the root has `data-sticky-header="page"`
- **AND** the body is no longer height-bounded

### Requirement: maxHeight bounds a non-virtual body and pins its header

With `maxHeight` set, the DataTable SHALL render its rows in a focusable scroll container of that maximum height, named by the caption, with the header pinned at its top, and MUST NOT virtualize rows because of it.

#### Scenario: Scrolling a bounded body

- **GIVEN** `maxHeight={320}` and 40 rows on the page
- **WHEN** the user scrolls the body
- **THEN** the header stays at the container top
- **AND** all 40 rows are in the DOM

### Requirement: Keyboard focus in rows is never hidden under a pinned header

In page and bounded modes, body rows SHALL have a top scroll margin of the offset plus the header height, so a control focused from the keyboard scrolls fully below the pinned header.

#### Scenario: Shift+Tab upwards

- **GIVEN** page mode with the header pinned and earlier rows scrolled under it
- **WHEN** the user presses Shift+Tab until a row checkbox above the visible rows has focus
- **THEN** that row is fully visible below the header

### Requirement: Tables without sticky props keep their card and container

Without `stickyHeader` or `maxHeight`, a non-virtual DataTable MUST keep its `overflow-hidden` card, its auto-overflow container and its unpinned header surface, so its DOM classes and visual baselines are unchanged.

#### Scenario: Default table

- **WHEN** a DataTable renders without the new props
- **THEN** the root keeps `overflow-hidden` and has no `data-sticky-header`
- **AND** header cells keep the `bg-secondary/30` surface
