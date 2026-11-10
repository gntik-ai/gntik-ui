## Purpose

Filterable Base UI single or multiple choice control with optional chips.

## ADDED Requirements

### Requirement: Combobox inputs show and expose invalid state

ComboboxInput and ComboboxChipsInput SHALL accept invalid, setting aria-invalid=true on the input and data-invalid on the InputGroup. An explicit aria-invalid SHALL win. The group SHALL show destructive/70 borders for explicit invalid, invalid inputs or an invalid Field in every variant. Unset state SHALL add no attributes.

#### Scenario: Invalid prop

- **WHEN** either input renders with invalid
- **THEN** it exposes aria-invalid=true and its group exposes data-invalid with a destructive border

#### Scenario: Invalid Field

- **WHEN** either input renders inside an invalid Field without invalid
- **THEN** its group shows the destructive border
