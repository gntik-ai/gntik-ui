## Purpose

Base UI on/off setting with optional inline label and Field support.

## ADDED Requirements

### Requirement: Invalid switch exposes a destructive ring

Switch SHALL accept invalid and expose aria-invalid=true and data-invalid on its switch element. An invalid Field SHALL also expose the state. Invalid switches SHALL show a 1px destructive/70 ring checked and unchecked; it SHALL reach 3:1 against the background in high_contrast. Explicit aria-invalid SHALL win; unset state SHALL add no attributes. Consumers SHALL pair invalid with a FieldError or description.

#### Scenario: Invalid track

- **WHEN** Switch renders invalid checked or unchecked
- **THEN** its switch exposes aria-invalid=true and shows the destructive ring

#### Scenario: Invalid Field

- **WHEN** Switch renders inside an invalid Field without invalid
- **THEN** it exposes the invalid state and ring
