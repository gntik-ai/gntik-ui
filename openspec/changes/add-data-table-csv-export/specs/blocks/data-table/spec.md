## Purpose

DataTable block: a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Export menu offers all rows, the current page and selected rows as CSV

With csvExport, DataTable SHALL show an Export menu in its toolbar whose items download a CSV of every row in rows in current sort order, of the current page, and, only while rows are selected, of the selected rows. csvExport.scopes SHALL limit the items. Files SHALL include a BOM and use fileName or a slugged supplied caption, falling back to table.csv. Without csvExport the existing toolbar SHALL remain unchanged.

#### Scenario: All rows across pages

- **GIVEN** a client table with 95 rows, 10 per page, sorted by name
- **WHEN** the user chooses Export, then All rows (95)
- **THEN** a file named after the caption downloads with a header line and 95 data lines in name order

#### Scenario: Selected rows item

- **GIVEN** rows 2, 15 and 40 selected
- **WHEN** the user opens the Export menu
- **THEN** Selected rows (3) is offered and exports exactly those three rows, resolving include or exclude models against sorted client rows
- **AND** single selection exports selectedId

### Requirement: CSV export writes visible columns as raw, escaped values

The exported CSV SHALL contain visible columns in display order headed by header, each cell taken from exportValue or else accessor as a raw value, and every cell MUST pass through shared toCsv quoting and formula-trigger escaping. Hidden columns, exportable=false and columns with neither accessor nor exportValue SHALL be omitted. Group header rows SHALL never be exported.

#### Scenario: Formula in a cell

- **GIVEN** a header, accessor or exportValue string beginning with equals, plus, minus, at, tab or carriage return
- **WHEN** rows are exported or copied
- **THEN** the value starts with an apostrophe before the trigger, with shared CSV or TSV quoting

#### Scenario: Raw values

- **WHEN** a row with a Date, a boolean and a null value is exported
- **THEN** the cells read the ISO 8601 date, true and an empty value

### Requirement: onExport delegates DataTable exports to the caller

When onExport is supplied, every CSV export item SHALL call it with scope, visible exported column ids, selected ids, sort and filters instead of building a file. In server mode the Export menu SHALL appear only with onExport. While the callback promise is pending, the trigger SHALL have aria-busy=true and another export SHALL be ignored.

#### Scenario: Server-side full export

- **GIVEN** a server-paginated table with onExport
- **WHEN** the user chooses All rows, labelled with rowCount
- **THEN** onExport is called once with scope rows, sort and filters
- **AND** no file is built in the browser

### Requirement: Copy selected rows writes escaped tab-separated text

The Copy selected rows item, and Ctrl/Cmd+C pressed on non-editable table content with no document text selection, SHALL write a header line and one tab-separated line per selected row through shared toCsv and copyToClipboard. A polite status SHALL announce success or failure. All new chrome SHALL use overridable i18n labels with English and Spanish messages and token classes.

#### Scenario: Copy two rows

- **GIVEN** two rows selected
- **WHEN** the user chooses Copy selected rows
- **THEN** the clipboard holds three tab-separated lines
- **AND** Copied to clipboard is announced, or Copy failed when clipboard access rejects

#### Scenario: Shortcut on a row checkbox

- **GIVEN** two rows selected and focus on a row checkbox, row action trigger or cell
- **WHEN** the user presses Ctrl/Cmd+C
- **THEN** the clipboard holds the same three tab-separated lines

#### Scenario: Shortcut inside an editor

- **GIVEN** selected rows and focus in an input, textarea, select or contenteditable, or a document text selection
- **WHEN** the user presses Ctrl/Cmd+C
- **THEN** the browser copies normally and the table writes nothing and does not preventDefault
