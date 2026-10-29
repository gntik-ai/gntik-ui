## Purpose

A picker opened from a field or button trigger whose popup contains search, filtered options, optional groups, multiple selection and persistent action rows.

## ADDED Requirements

### Requirement: Search field in the popup filters options

Opening SearchableSelect SHALL move focus to the popup search input. Matching SHALL ignore case and accents across label, description and keywords. A custom filter SHALL replace matching and onSearchChange SHALL report each query. Groups without matches MUST be hidden and emptyText SHALL be announced when no rows match. All built-in strings SHALL come from the en/es catalogs.

#### Scenario: Accent-insensitive match and empty state

- **GIVEN** grouped options Zürich, Zagreb and Lisbon
- **WHEN** the user opens Region with Enter, Space or ArrowDown and types zur
- **THEN** the Region listbox contains only Zürich and empty groups disappear
- **AND** focus stays in the Search combobox
- **WHEN** the user replaces the query with qqq
- **THEN** there are no options and No matches. (es: Sin coincidencias.) is shown

### Requirement: Single selection closes and restores focus

Single mode SHALL accept Value | null for value/defaultValue/onValueChange. Choosing an enabled option SHALL call onValueChange exactly once, close and return focus to the trigger displaying its icon and label. Escape SHALL close without changing the value. Disabled options MUST expose aria-disabled and prevent click or Enter selection.

#### Scenario: Keyboard selection and cancellation

- **GIVEN** an open Region picker
- **WHEN** the user presses ArrowDown and Enter
- **THEN** onValueChange receives the highlighted value once, the popup closes and the updated trigger has focus
- **WHEN** the picker is reopened, a query is typed and Escape is pressed
- **THEN** no additional value change occurs and focus returns to the trigger

### Requirement: Multiple selection keeps the query and popup

Multiple mode SHALL use Value[] for value/defaultValue/onValueChange. Selection SHALL toggle aria-selected and an aria-hidden check icon, retain the popup and query, and show the localized selected count on the default trigger.

#### Scenario: Toggle two values

- **WHEN** Running and Failed are selected
- **THEN** onValueChange last receives [running, failed]
- **AND** the popup and query remain and the trigger reads 2 selected (es: 2 seleccionados)

### Requirement: Action rows never enter selection

Action rows SHALL remain after filtered options under every query. Enter or click SHALL invoke their callback once, close and return focus without changing the value or form data.

#### Scenario: Action survives filtering

- **GIVEN** a Manage labels action
- **WHEN** zzz is typed and the action is chosen with Enter or click
- **THEN** only the action remains, its callback runs once, the popup closes and onValueChange is not called

### Requirement: Native forms serialize values

name, required, disabled and readOnly SHALL use the existing Combobox root contract. getOptionKey SHALL default to String(value), supporting stable object keys. Single selection SHALL submit one named value, multiple SHALL submit one entry per value, and empty selection SHALL submit nothing.

#### Scenario: Form data

- **GIVEN** name=region and the selected value eu-west-1
- **WHEN** the form is submitted
- **THEN** its data contains region=eu-west-1
- **AND** multiple values produce separate region entries and an empty value produces none

### Requirement: Custom triggers share the picker behavior

trigger SHALL render a supplied React element through the Combobox trigger render prop with aria-haspopup=listbox and the current aria-expanded. A visible label SHALL name the trigger and listbox; without it the caller SHALL provide aria-label. Size SHALL accept auto, sm, md and lg.

#### Scenario: Toolbar button

- **GIVEN** a secondary small Button labelled Status as trigger
- **WHEN** Enter, Space or ArrowDown is pressed on it
- **THEN** the popup opens with focus in Search and aria-expanded=true

### Requirement: Virtualization windows flat lists

With virtualized, flat lists SHALL reuse the existing Combobox windowing, itemHeight and overscan. Grouped lists SHALL retain full rendering. Rendered rows MUST expose aria-posinset and aria-setsize for the filtered list and keep keyboard highlights rendered and scrolled into view.

#### Scenario: Five thousand options

- **GIVEN** 5,000 flat options and virtualized
- **WHEN** opened
- **THEN** fewer than 60 options are mounted and the first has aria-posinset=1 and aria-setsize=5000
- **WHEN** ArrowDown reaches option 80
- **THEN** option 80 is rendered and visible in the scroll viewport

### Requirement: Shared picker preserves workspace behavior and documentation

WorkspaceSearch SHALL use SearchableSelect with its existing workspace strings, matchText matching, trigger label, presentation and Create workspace action. Existing picker test suites SHALL continue to pass unchanged. New API and states SHALL have live docs examples, a which-picker table and a keyboard table, token-only styles, and axe checks across dark, light and high_contrast.

#### Scenario: Existing workspace picker

- **WHEN** the unchanged WorkspaceSwitcher suite runs
- **THEN** workspace selection, search, action rows, focus restoration and accessibility still pass
