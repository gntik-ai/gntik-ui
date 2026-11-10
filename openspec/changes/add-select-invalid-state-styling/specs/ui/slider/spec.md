## Purpose

Base UI single value or range picker with labelled thumb inputs.

## ADDED Requirements

### Requirement: Invalid slider exposes state on every thumb

Slider SHALL accept invalid and expose aria-invalid=true on every thumb input and destructive/70 thumb borders. Invalid Field SHALL supply the same state without the prop. Explicit aria-invalid SHALL win; unset state SHALL add no attributes. Consumers SHALL pair invalid with a FieldError or description. State updates SHALL preserve keyboard focus.

#### Scenario: Invalid range

- **WHEN** a range Slider renders with invalid and two values
- **THEN** both inputs expose aria-invalid=true and both thumbs show destructive borders

#### Scenario: Invalid Field

- **WHEN** Slider renders inside an invalid Field without invalid
- **THEN** every thumb input exposes aria-invalid=true and every thumb border is destructive
