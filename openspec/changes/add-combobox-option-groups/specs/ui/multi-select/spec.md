## Purpose

MultiSelect: a searchable multiple select on Base UI Combobox with removable chips, a +N overflow, select all, clear, async options and a creatable row.

## ADDED Requirements

### Requirement: Options with a group render under group headings

MultiSelect SHALL accept an optional MultiSelectOption.group string and render options that set group under one heading per group in first-seen order, after the options without a group. Filtering SHALL remove empty groups and their labels. Grouped lists SHALL retain non-windowed rendering even with virtualized set.

#### Scenario: Mixed options

- **GIVEN** options `All regions` (no group), `Madrid` (Europe), `Toronto` (Americas) and `Paris` (Europe)
- **WHEN** the list opens
- **THEN** `All regions` comes first
- **AND** the Europe heading holds Madrid and Paris, followed by the Americas heading

#### Scenario: Filtered groups

- **WHEN** the user types `par`
- **THEN** only the Europe group with Paris remains
- **AND** typing `zzz` removes all groups and shows the empty state

### Requirement: Select all spans every group

The MultiSelect Select all row SHALL remain above and outside all groups and select, or clear, every enabled option across all groups.

#### Scenario: Select all

- **GIVEN** grouped options with one disabled option
- **WHEN** the user activates Select all
- **THEN** every enabled option in every group is selected
- **AND** the disabled option is not selected
- **AND** activating Deselect all clears every enabled option

### Requirement: Ungrouped compatibility and grouped accessibility

Options without group SHALL retain the current flat items array and DOM. The grouped live example SHALL have no axe violations in dark, light and high_contrast themes. Kit-owned strings SHALL retain English and Spanish catalog entries; group labels SHALL come from consumer data.

#### Scenario: Ungrouped options

- **GIVEN** no option sets group
- **WHEN** the user opens the list
- **THEN** the flat list renders without group wrappers
