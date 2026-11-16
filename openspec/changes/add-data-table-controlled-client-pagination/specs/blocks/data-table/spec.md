## Purpose

DataTable client pagination supports externally owned pagination and automatic whole-row sizing.

## ADDED Requirements

### Requirement: Client pagination honours controlled page and size

DataTable SHALL accept page, onPageChange, pageSize and onPageSizeChange without paginationMode. Controlled props SHALL remain authoritative until the consumer changes them. Uncontrolled pagination SHALL start at defaultPage (default 1) and defaultPageSize (default 10). rowCount MUST remain exclusive to server mode.

#### Scenario: Page from the URL

- **GIVEN** 95 client rows, page 3 and size 10
- **WHEN** Next is activated
- **THEN** onPageChange requests 4 once, rows 21–30 remain, and the summary reads 21–30 of 95 until the prop changes

#### Scenario: Uncontrolled start

- **WHEN** defaultPage is 2 without page
- **THEN** rows 11–20 render and Next moves internally to page 3

#### Scenario: Size preserves the first visible row

- **GIVEN** controlled page 3 and size 10
- **WHEN** size 25 is chosen
- **THEN** onPageSizeChange requests 25 and onPageChange requests 1, with one complete pageSize query

### Requirement: Client resets and display clamping are consistent

A sort change or saved-view application SHALL request page 1 once when the controlled page is not 1 and SHALL NOT request it when already 1. Stale pages SHALL clamp for both body and footer without callbacks on render. Client pagination SHALL continue reporting complete onQueryChange values.

#### Scenario: Stale shared page

- **GIVEN** 95 rows, size 10 and controlled page 20
- **WHEN** the table renders
- **THEN** rows 91–95 render with page 10 current, no callback fires, and Previous requests 9

### Requirement: Automatic size fits the body viewport

autoPageSize SHALL default to false. With client pagination enabled, it SHALL fill a definite-height parent, measure space independent of row count, and fit max(1, floor(bodyHeight / rowHeight)) rows. rowHeight SHALL default to 44 comfortable or 36 compact. Resize changes SHALL report onPageSizeChange, retain the first visible row and hide the size select. Unchanged measurements SHALL NOT cause repeated reports. Without a definite height it SHALL fall back to defaultPageSize with a development warning. ResizeObserver SHALL be SSR-safe and disconnect on unmount.

#### Scenario: Taller container

- **GIVEN** a 480px parent whose body fits 8 comfortable rows
- **WHEN** the parent grows to fit 12 rows
- **THEN** 12 rows render, onPageSizeChange reports 12 once, and the first previously visible row remains in view

#### Scenario: Existing consumers

- **WHEN** none of the new props are supplied
- **THEN** existing client rendering and pagination behavior remain unchanged, as do server mode and single-selection pagination rules
