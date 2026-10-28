## Purpose

Combobox: a searchable single or multiple select on Base UI with chips, clear, debounced and abortable async options, a creatable row and announced empty, loading and error states.

## ADDED Requirements

### Requirement: Group parts render labelled option groups

Combobox SHALL expose ComboboxGroup, ComboboxGroupLabel, ComboboxSeparator and ComboboxCollection, their prop types and useComboboxFilter (Base UI's locale-aware filter hook). Parts SHALL accept className merged with cn, and group labels and separators SHALL share Select's canonical token classes. Combobox SHALL render grouped items as groups exposed with role group and named by their group label, and keyboard navigation SHALL move across groups while skipping labels and separators.

#### Scenario: Regions

- **GIVEN** grouped items Europe (Madrid, Paris) and Americas (Toronto)
- **WHEN** the user opens the list and presses ArrowDown from Paris
- **THEN** Toronto is highlighted
- **AND** the groups are named `Europe` and `Americas`
- **AND** Enter, Escape and typeahead retain their existing behavior

### Requirement: Filtering hides groups without matches

When the query filters out every option of a group, the Combobox MUST NOT render that group or its label, and SHALL show the empty state when no group has a match.

#### Scenario: Single group left

- **WHEN** the user types `par`
- **THEN** only the Europe group with Paris is rendered
- **AND** the Americas group and label are absent from the DOM

#### Scenario: No match

- **WHEN** the user types `zzz`
- **THEN** no group is rendered
- **AND** the empty text is shown

### Requirement: Async and creatable modes accept grouped items

Combobox SHALL keep loadOptions and onCreate working when its items or loaded results are grouped, rendering the create and retry rows after the groups and outside any group. Special rows SHALL use the same collection shape as grouped options. Exact-label matching SHALL inspect options inside every group, case-insensitively.

#### Scenario: Create with groups

- **GIVEN** grouped items and onCreate
- **WHEN** the user types `Lisbon`
- **THEN** `Create “Lisbon”` appears after the last group, outside any group
- **AND** selecting it calls onCreate('Lisbon')

#### Scenario: Exact match inside a group

- **GIVEN** Paris in the Europe group and onCreate
- **WHEN** the user types `paris`
- **THEN** no Create row is rendered

#### Scenario: Grouped async results

- **GIVEN** loadOptions resolving to grouped options
- **WHEN** the user types a query
- **THEN** the loading status is announced
- **AND** the loaded groups render with their labels without additional client filtering
- **AND** requests are debounced and stale requests aborted
- **AND** errors offer a keyboard-operable Retry row outside groups

### Requirement: Flat compatibility and grouped accessibility

Flat items SHALL retain their existing DOM. Grouped items SHALL retain full non-windowed rendering when virtualized is set. The grouped live example SHALL have no axe violations in dark, light and high_contrast themes.

#### Scenario: Flat list

- **GIVEN** a flat items array
- **WHEN** the user opens the list
- **THEN** options remain direct children of the listbox without group wrappers
