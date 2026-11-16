## Purpose

DataTable is a typed, sortable, selectable and paginated table on the kit Table, with grouping, column sizing and pinning, virtualization, inline editing and saved views.

## ADDED Requirements

### Requirement: Row edit mode edits every editable cell of a row together

With editMode row, activating Edit SHALL render every editable cell as an editor and focus the first. Enter in a single-line editor SHALL save through onRowSave, Escape SHALL cancel, and focus SHALL return to Edit. Tab SHALL move between editors without saving. Controlled editingRowIds SHALL support multiple rows and preserve drafts across paging, sorting and virtualization.

#### Scenario: Edit and save from the keyboard

- **GIVEN** editable name and quota columns in row mode
- **WHEN** the user activates Edit api-gateway, tabs to quota, types 500 and presses Enter
- **THEN** onRowSave is called once with rowId, values and previous including quota 500
- **AND** focus returns to Edit api-gateway

#### Scenario: Escape restores the row

- **GIVEN** a row with a changed name
- **WHEN** the user presses Escape
- **THEN** previous values render without calling onRowSave
- **AND** focus returns to Edit

#### Scenario: Drafts survive paging and virtualization

- **GIVEN** controlled editingRowIds a and b and a changed draft
- **WHEN** the row leaves the current page or virtual window and returns
- **THEN** the same draft remains editable

### Requirement: Rejected saves keep field and row errors accessible

onRowSave, onRowsSave and per-column validate rejections SHALL keep affected rows editable. Field errors SHALL set aria-invalid and link the message with aria-describedby. Strings and false SHALL show a row alert; thrown errors SHALL show their message. Column validation SHALL also gate onCellEdit.

#### Scenario: Server field error

- **GIVEN** onRowSave returns fieldErrors with quota Exceeds the plan limit
- **WHEN** the user saves
- **THEN** quota remains editable, invalid and described by Exceeds the plan limit

#### Scenario: Validation blocks callbacks

- **GIVEN** validate returns Required for empty text
- **WHEN** the user clears the editor and commits in row or cell mode
- **THEN** neither save callback is called and Required describes the editor

### Requirement: Save all and discard all apply pending rows together

With onRowsSave, a StickyActionBar SHALL show the changed count, Save all and Discard all. Save all SHALL validate every draft and call onRowsSave once with all changed edits. Results keyed by row id SHALL keep only rejected rows editable. Discard all SHALL restore drafts.

#### Scenario: Partial bulk rejection

- **GIVEN** two changed rows
- **WHEN** Save all returns a rejection for one row
- **THEN** one callback receives both edits, the accepted row closes and the rejected row retains its error

### Requirement: Typed and custom editors report compatible values

Textarea, switch, date and combobox SHALL reuse kit components and the cell editLabel. Values SHALL remain string, number or null, with switches encoded as true/false text and dates as YYYY-MM-DD. Custom renderEditor SHALL receive row, value, setValue, commit, cancel, error and inputProps carrying name, invalid, description and autofocus. Custom commit SHALL save a cell or retain the updated draft in row mode.

#### Scenario: Calendar date

- **GIVEN** a date editor
- **WHEN** the user picks 17 October 2026 and commits
- **THEN** the callback receives 2026-10-17

#### Scenario: Multi-line text

- **GIVEN** a textarea editor
- **WHEN** the user enters two lines separated by Shift+Enter and then presses Enter
- **THEN** one save receives the text including its newline

### Requirement: Add row inserts one editable draft

onRowAdd SHALL enable Add row, inserting one draft at newRowPosition (top by default) on the current page, seeded by newRowDefaults and focusing its first editor. Save SHALL call onRowAdd once; Cancel or Escape SHALL remove the draft and focus Add row.

#### Scenario: Bottom draft cancelled

- **GIVEN** newRowPosition bottom and default values
- **WHEN** Add row is activated and Escape pressed
- **THEN** a draft appears last with those values, then disappears without onRowAdd
- **AND** focus returns to Add row

### Requirement: Delete asks for confirmation

onRowDelete SHALL append Delete as the last row action and open ConfirmDestructive with Delete {label}? as its title. Only confirming SHALL call onRowDelete. Cancel SHALL focus the original actions trigger. Accepted deletion SHALL focus the next row's trigger or the previous row's when deleting the last.

#### Scenario: Confirmed deletion

- **GIVEN** api-gateway followed by billing
- **WHEN** deletion is confirmed and the consumer removes api-gateway
- **THEN** onRowDelete is called once and billing's actions trigger receives focus

### Requirement: Existing cell mode remains compatible

Without new props, DataTable SHALL preserve existing DOM semantics, default cell editing and onCellEdit types. InlineEditRow and InlineEditTable SHALL remain exported with deprecation documentation.

#### Scenario: Legacy regression

- **WHEN** the existing edit-views and inline-edit-focus tests run unchanged
- **THEN** they pass

### Requirement: Documentation and translations cover the additive API

New behavior SHALL have live docs examples, English and Spanish catalogs, token classes and accessible names in all three themes.

#### Scenario: Spanish row actions

- **GIVEN** the Spanish provider
- **WHEN** add and delete controls render
- **THEN** they show Añadir fila and ¿Eliminar {label}?
