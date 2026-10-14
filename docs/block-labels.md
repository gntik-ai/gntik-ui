# Per-instance table block labels

Import `PaginationFooterLabels`, `FilterBarLabels` and `DataTableLabels` from `@gntik-ai/blocks`.
Each block accepts `labels?: Partial<...Labels>`. Replacement is independent per key. Explicit
labels take precedence over existing search props and the I18nProvider catalog; omitted keys
keep their existing provider translations or English literals. No locale provider is added.
Formatter arguments are raw numbers and caller strings, and results render verbatim. Empty
strings are valid overrides. Caller fields, options, view names, row data, captions, page numbers
and row-count numerals are not translated by the block. Single-selection radio names remain
caller-owned. Caller errors from `onCellEdit` remain verbatim.

```tsx
import { FilterBar, type FilterBarLabels } from '@gntik-ai/blocks';
const labels: Partial<FilterBarLabels> = {
  clearAll: 'Clear filters',
  resultCount: (count) => `${count} matching records`,
};
<FilterBar labels={labels} resultCount={1200} />;
```

Without labels, existing strings, roles, markup, focus and callbacks stay unchanged. Range and
result-count formatters replace the complete summary; their default styled numeric spans remain
unchanged when the formatter is omitted. DataTable includes PaginationFooter keys directly in its
labels prop. Saved views delete immediately; Save as and Rename are the only built-in dialogs.

## PaginationFooter

| Key                | Type                                                  | State / surface                                                                                            |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `rowsPerPage`      | `string`                                              | Always: visible page-size text                                                                             |
| `rowsPerPageLabel` | `string`                                              | Always: page-size Select accessible name                                                                   |
| `rangeSummary`     | `(from: number, to: number, total: number) => string` | Every page and page-size change: visible summary and polite live region                                    |
| `paginationNav`    | `(noun: string) => string`                            | Always: navigation accessible name; noun is caller content or defaults to the provider translation of rows |
| `previous`         | `string`                                              | Always: previous-page button name                                                                          |
| `next`             | `string`                                              | Always: next-page button name                                                                              |
| `page`             | `(page: number) => string`                            | Always: numbered-page button name; number stays caller content                                             |

## FilterBar

| Key                    | Type                                       | State / surface                                                          |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `searchLandmark`       | `string`                                   | Always: search landmark name                                             |
| `searchLabel`          | `string`                                   | Always: search input accessible name                                     |
| `searchPlaceholder`    | `string`                                   | Always: search input placeholder                                         |
| `savedViewLabel`       | `string`                                   | When views exist: Select accessible name                                 |
| `savedViewPlaceholder` | `string`                                   | When no view selected: Select placeholder                                |
| `addFilter`            | `string`                                   | Always: Add filter trigger text and name                                 |
| `activeFilters`        | `string`                                   | When filters or search exist: active-filters list name                   |
| `filters`              | `string`                                   | When filters or search exist: chip section heading                       |
| `clearAll`             | `string`                                   | When filters or search exist: clear button text and name                 |
| `removeFilter`         | `(field: string, value: string) => string` | When chip exists: remove button name; field and value are caller content |
| `resultCount`          | `(count: number) => string`                | When resultCount supplied: visible count and polite live region          |

## DataTable

| Key                 | Type                                                  | State / surface                                                                                      |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `scrollRegion`      | `string`                                              | Non-virtual table overflow: focusable scroll region name; virtualized regions use the caller caption |
| `selectionCount`    | `(count: number) => string`                           | Multiple selection: toolbar count and polite live region                                             |
| `columns`           | `string`                                              | Column visibility trigger text and name                                                              |
| `visibleColumns`    | `string`                                              | Open column menu: visibility heading                                                                 |
| `pinColumns`        | `string`                                              | Open column menu with pinning: pin heading                                                           |
| `pinnedLeft`        | `string`                                              | Open pin submenu trigger: left side suffix                                                           |
| `pinnedRight`       | `string`                                              | Open pin submenu trigger: right side suffix                                                          |
| `pinLeft`           | `string`                                              | Open pin submenu: left option                                                                        |
| `pinRight`          | `string`                                              | Open pin submenu: right option                                                                       |
| `unpinned`          | `string`                                              | Open pin submenu: unpinned option                                                                    |
| `density`           | `string`                                              | Density group accessible name                                                                        |
| `comfortable`       | `string`                                              | Comfortable density button name                                                                      |
| `compact`           | `string`                                              | Compact density button name                                                                          |
| `resizeColumn`      | `(label: string) => string`                           | Resizable header: separator name; label is caller column header                                      |
| `columnWidth`       | `(width: number) => string`                           | Resizable header: separator aria-valuetext in pixels                                                 |
| `defaultView`       | `string`                                              | View trigger when no active view                                                                     |
| `defaultViewOption` | `string`                                              | Open views menu: default option                                                                      |
| `modified`          | `string`                                              | Dirty view trigger: screen reader suffix                                                             |
| `views`             | `string`                                              | Open views menu: heading                                                                             |
| `saveChanges`       | `string`                                              | Open views menu: save current view action                                                            |
| `saveAs`            | `string`                                              | Open views menu: save as action                                                                      |
| `renameView`        | `string`                                              | Open views menu: rename action                                                                       |
| `deleteView`        | `string`                                              | Open views menu: immediate delete action; no confirmation dialog                                     |
| `resetChanges`      | `string`                                              | Open views menu: reset action                                                                        |
| `saveViewTitle`     | `string`                                              | Save as dialog: title and accessible name                                                            |
| `renameViewTitle`   | `string`                                              | Rename dialog: title and accessible name                                                             |
| `viewName`          | `string`                                              | Save as and Rename dialogs: input label                                                              |
| `cancel`            | `string`                                              | Save as and Rename dialogs: cancel button                                                            |
| `saveView`          | `string`                                              | Save as dialog: submit button                                                                        |
| `rename`            | `string`                                              | Rename dialog: submit button                                                                         |
| `closeDialog`       | `string`                                              | Save as and Rename dialogs: close button name                                                        |
| `selection`         | `string`                                              | Single selection: screen reader column heading                                                       |
| `selectAll`         | `string`                                              | Multiple selection: header checkbox name                                                             |
| `selectRow`         | `(label: string) => string`                           | Multiple selection: row checkbox name; label is caller row name                                      |
| `selectGroup`       | `(group: string) => string`                           | Grouped multiple selection: group checkbox name                                                      |
| `groupRows`         | `(count: number) => string`                           | Grouped header: screen reader row-count unit; numeric count stays unchanged                          |
| `noGroup`           | `string`                                              | Grouped header: fallback when group key is empty                                                     |
| `actions`           | `string`                                              | Row actions present: screen reader column heading                                                    |
| `rowActions`        | `(label: string) => string`                           | Row action menu trigger name; label is caller row name                                               |
| `emptyTitle`        | `string`                                              | Empty rows: default empty-state title                                                                |
| `emptyDescription`  | `string`                                              | Empty rows: default empty-state description                                                          |
| `loading`           | `(caption: string) => string`                         | Loading: status announcement; receives original caller caption                                       |
| `editHint`          | `string`                                              | Editable table: shared keyboard instruction description                                              |
| `editLabel`         | `(column: string, row: string) => string`             | Editing cell: input accessible name                                                                  |
| `editError`         | `string`                                              | Rejected cell edit without caller error message: alert                                               |
| `enterNumber`       | `string`                                              | Editing number: invalid numeric value alert                                                          |
| `minimumValue`      | `(min: number) => string`                             | Editing number below minimum: alert                                                                  |
| `maximumValue`      | `(max: number) => string`                             | Editing number above maximum: alert                                                                  |
| `rowsPerPage`       | `string`                                              | Always: visible page-size text                                                                       |
| `rowsPerPageLabel`  | `string`                                              | Always: page-size Select accessible name                                                             |
| `rangeSummary`      | `(from: number, to: number, total: number) => string` | Every page and page-size change: visible summary and polite live region                              |
| `paginationNav`     | `(noun: string) => string`                            | Always: navigation accessible name; noun is the caller caption                                       |
| `previous`          | `string`                                              | Always: previous-page button name                                                                    |
| `next`              | `string`                                              | Always: next-page button name                                                                        |
| `page`              | `(page: number) => string`                            | Always: numbered-page button name; number stays caller content                                       |
