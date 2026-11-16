## Purpose

PaginationFooter offers optional page-size controls while retaining range and page navigation.

## ADDED Requirements

### Requirement: showPageSize false hides the size control

showPageSize SHALL default to true. With false, PaginationFooter SHALL omit both the rows-per-page label and select while retaining the summary and page buttons. Defaults SHALL preserve existing rendering.

#### Scenario: Footer without a size select

- **WHEN** showPageSize is false with 95 rows, page 2 and size 10
- **THEN** no rows-per-page text or combobox exists, the summary reads 11–20 of 95, and page navigation remains available
