## Purpose

Input and field controls: single-line, multi-line, numeric, selection, token, date and time fields with inherited chrome, accessible focus and visible validation.

## ADDED Requirements

### Requirement: Ghost fields show chrome only on hover, focus and error

With variant ghost, a field control SHALL use transparent background and border and no shadow at rest, secondary/50 background on hover, a primary/60 border and focus-ring outline on keyboard focus, and a destructive/70 border when invalid, including aria-invalid. Disabled and read-only feedback SHALL apply on all variants. Forced-colors mode SHALL retain a system-colour border for alternate chrome.

#### Scenario: Keyboard focus

- **GIVEN** a ghost Input
- **WHEN** the user tabs into it
- **THEN** its root shows the primary/60 border and focus-ring outline

#### Scenario: Invalid at rest

- **WHEN** a ghost or filled field is invalid and not focused
- **THEN** its destructive border remains visible

### Requirement: Filled fields use the secondary surface without a border

With variant filled, a field control SHALL use bg-secondary with border-transparent and no shadow. Foreground and muted-foreground placeholders SHALL meet 4.5:1 contrast on secondary in :root, .dark and .high_contrast without changing frozen brand values.

#### Scenario: Filled toolbar search

- **WHEN** a filled Input renders in the light theme
- **THEN** its background is secondary
- **AND** its text and placeholder meet AA contrast

### Requirement: FieldVariantProvider sets the default variant

Field controls inside FieldVariantProvider SHALL use its variant unless they set variant explicitly. Nested providers SHALL override outer providers. Without a prop or provider the default SHALL be outline, with byte-identical existing slot classes and unchanged snapshots and markup fixtures. FieldVariantProps SHALL retain its existing meaning.

#### Scenario: Editable table

- **GIVEN** a FieldVariantProvider with variant ghost
- **WHEN** it contains a SimpleSelect, DatePicker and Input with variant outline
- **THEN** the selectors are ghost and the Input stays bordered

#### Scenario: Nested provider

- **GIVEN** a ghost provider containing a filled provider
- **WHEN** an Input has no explicit variant
- **THEN** the nearest provider determines its chrome

### Requirement: Field chrome is documented and localized

The Input page SHALL show a ghost inline-edit row and a filled toolbar, and every changed control SHALL show its alternate variants. Ghost guidance SHALL limit use to obvious editing contexts. New preview labels SHALL use the English and Spanish catalogs. Examples SHALL be axe-clean in dark, light and high_contrast.

#### Scenario: Live previews

- **WHEN** a consumer visits the Input or another changed control page
- **THEN** the live examples demonstrate the additive API and remain accessible in every theme
