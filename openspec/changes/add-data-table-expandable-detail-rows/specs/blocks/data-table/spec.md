## Purpose

DataTable block: typed sortable, selectable and paginated data with optional inline detail panels.

## ADDED Requirements

### Requirement: Expand toggle reveals a full-width detail row under its row

With renderDetail, each eligible row SHALL render a button named Details for its row label with aria-expanded and aria-controls. Expanding SHALL insert a detail row immediately after its row, with a single cell spanning all columns and a region with the same accessible name. Collapsing SHALL remove it. Panel and toggle ids SHALL remain stable. Without renderDetail, DOM and layout SHALL remain unchanged.

#### Scenario: Keyboard disclosure

- **GIVEN** an expandable inv-42 row
- **WHEN** the focused toggle receives Enter or Space
- **THEN** its detail toggles, focus stays on the button and Tab continues through row controls into panel content

### Requirement: hasDetail limits eligible rows

Rows rejected by hasDetail SHALL have an empty toggle cell and SHALL never render details, including when their ids are controlled as expanded.

#### Scenario: Failed rows only

- **GIVEN** two failed and eight succeeded rows with hasDetail accepting only failed rows
- **WHEN** the table renders
- **THEN** exactly two detail toggles exist

### Requirement: Controlled and persistent expansion

expandedDetailIds SHALL control visible panels and onExpandedDetailIdsChange SHALL request the next ids without changing controlled DOM. detailExpandMode SHALL default to multiple and opening a row in single mode SHALL replace other ids. Uncontrolled ids SHALL persist across pages and sorting.

#### Scenario: Single mode replaces the open row

- **GIVEN** single mode with controlled inv-42 expanded
- **WHEN** inv-43 is opened
- **THEN** the callback reports only inv-43 and DOM waits for updated props

### Requirement: Lazy detail content

renderDetail SHALL run only for expanded eligible rows and collapsing SHALL unmount its content.

#### Scenario: Lazy panel lifecycle

- **GIVEN** collapsed rows and a detail renderer
- **WHEN** one row opens and then collapses
- **THEN** only that row mounts content and its cleanup runs on collapse

### Requirement: Expandable tables disable virtualization

With renderDetail, automatic virtualization SHALL stay off and forced virtualization SHALL be ignored with one development warning explaining measured heights.

#### Scenario: Forced virtualization

- **GIVEN** 500 page rows with renderDetail and virtualize true
- **WHEN** the table renders
- **THEN** every page row renders, aria-rowcount is absent and one development warning names the cause

### Requirement: Row clicks exclude interactive descendants

Opt-in detailOnRowClick SHALL toggle plain row cells and SHALL exclude buttons, links, inputs, selects, textareas, checkboxes and editors without stopping existing control propagation.

#### Scenario: Selection and actions

- **GIVEN** a selectable expandable row with row-click activation
- **WHEN** its checkbox or action is clicked
- **THEN** the control works and its detail stays closed

### Requirement: Grouping and pinned layout retain alignment

Detail rows SHALL share their group's tbody and disappear while the group collapses. Selection SHALL count only data rows. Toggle cells SHALL participate in header, skeleton, empty, draft and group spans and sized pinned offsets. The detail region SHALL stick to inline start at the scroll viewport width.

#### Scenario: Pinned columns with selection

- **GIVEN** selection, a detail toggle, sized columns and pins at both edges
- **WHEN** the table scrolls horizontally
- **THEN** pins include the leading toggle width and the panel remains aligned with the visible viewport

### Requirement: Localized accessible documented details

The en and es catalogs SHALL provide toggle and heading names overridable by DataTableLabels. The live example SHALL demonstrate payloads in JsonViewer and errors in ErrorPanel. Motion SHALL respect reduced motion and styling SHALL use tokens.

#### Scenario: Spanish disclosure

- **GIVEN** an es locale and inv-42
- **WHEN** its detail toggle renders
- **THEN** its name is Detalles de inv-42 unless overridden
