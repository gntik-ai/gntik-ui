## Purpose

Button-triggered Base UI listbox with compound parts and SimpleSelect for flat or async options.

## ADDED Requirements

### Requirement: Invalid select trigger shows the destructive border

Select triggers SHALL show the destructive/70 border for data-invalid or aria-invalid=true in outline, filled and ghost variants. The border SHALL persist on hover and popup open while keyboard focus retains the focus-ring outline.

#### Scenario: Required role left empty

- **GIVEN** a SimpleSelect inside an invalid Field
- **WHEN** the form renders in dark, light or high_contrast
- **THEN** the trigger has data-invalid and matches an equally invalid Input border

#### Scenario: Invalid trigger interaction

- **GIVEN** an invalid Select trigger
- **WHEN** it is hovered, focused with the keyboard or opened
- **THEN** its border stays destructive and its keyboard focus outline remains visible

### Requirement: Explicit invalid state reaches the trigger

SelectTrigger and SimpleSelect SHALL accept invalid and set aria-invalid=true and data-invalid when true. An explicit aria-invalid SHALL take precedence. SimpleSelect SHALL forward aria-invalid to the trigger. Unset invalid outside a Field SHALL add neither attribute. Base UI Field-provided invalid state SHALL be preserved.

#### Scenario: Standalone invalid select

- **WHEN** SimpleSelect renders with invalid and aria-label Region
- **THEN** its trigger exposes aria-invalid=true and data-invalid

#### Scenario: Valid default

- **WHEN** SimpleSelect renders outside Field without invalid or aria-invalid
- **THEN** its trigger has neither invalid attribute

#### Scenario: Form error clears

- **WHEN** FormInviteMember is submitted without a role
- **THEN** Choose a role. appears and the trigger is invalid
- **AND** choosing a role clears the message and invalid attributes
