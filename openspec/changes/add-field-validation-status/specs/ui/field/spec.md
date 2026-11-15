## Purpose

Accessible Base UI Field scaffolding with optional non-blocking feedback.

## ADDED Requirements

### Requirement: Warning status shows a non-blocking linked message

When status is warning and the field is valid, Field SHALL render FieldWarning linked through Base UI Description, SHALL NOT set aria-invalid and SHALL NOT block submission.

#### Scenario: Near-quota value

- **GIVEN** a warning Field with Input and FieldWarning reading Close to the plan limit.
- **WHEN** the input receives focus
- **THEN** its accessible description includes Close to the plan limit.
- **AND** it has no aria-invalid attribute

#### Scenario: Submit with a warning

- **WHEN** a form containing only a warning is submitted
- **THEN** its submit handler runs

### Requirement: Invalid takes precedence

Field SHALL resolve the effective status to error whenever Base UI marks it invalid, including external invalid, native constraints and validate. FieldWarning and FieldSuccess SHALL remain hidden while invalid, including with match. Valid feedback SHALL support hideIcon and match.

#### Scenario: Invalid with success requested

- **GIVEN** an invalid Field requesting success
- **WHEN** rendered with FieldError and FieldSuccess
- **THEN** FieldError is shown and FieldSuccess is hidden
- **AND** useFieldStatus returns error and invalid true

### Requirement: Feedback icon reflects effective status

With feedbackIcon, Input and NumberInput SHALL show one trailing aria-hidden spinner, warning triangle, success check or error alert for the corresponding effective status, and none while idle. Warning SHALL use border-warning/70 and success SHALL NOT tint the border. Only token classes SHALL be used.

#### Scenario: Validating then success

- **GIVEN** a Field with feedbackIcon and validating status
- **WHEN** status becomes success
- **THEN** its decorative spinner is replaced by a decorative check

#### Scenario: Without feedbackIcon

- **WHEN** status is validating without feedbackIcon
- **THEN** neither control renders a status icon

### Requirement: Status changes are announced through a polite region

When status is supplied, Field SHALL mount a visually hidden polite status region from the first render. Validating SHALL announce the localized field.validating text; leaving validating SHALL announce the active feedback text once. Synchronous invalid changes SHALL keep existing behavior.

#### Scenario: Async success

- **GIVEN** idle status and FieldSuccess reading Slug is available.
- **WHEN** status changes to validating then success
- **THEN** the existing region reads Checking… then Slug is available.

#### Scenario: Spanish catalog

- **GIVEN** locale es
- **WHEN** status becomes validating
- **THEN** the region reads Comprobando…

### Requirement: Custom controls can read status

useFieldStatus SHALL return effective status, invalid and validating from the nearest Field, or idle with both flags false outside Field.

#### Scenario: Custom control

- **WHEN** a child calls useFieldStatus in a validating Field
- **THEN** it receives status validating and validating true

#### Scenario: Outside Field

- **WHEN** useFieldStatus is called outside Field
- **THEN** status is idle, invalid false and validating false

### Requirement: Optional API preserves existing DOM

With the new props unset, Field, Input and NumberInput SHALL render their existing DOM without data-status, a region or a feedback icon. All new visible and accessible strings SHALL use the English and Spanish catalogs. Live examples SHALL demonstrate the API and pass axe in dark, light and high_contrast.

#### Scenario: Existing consumers

- **WHEN** existing consumers omit status and feedbackIcon
- **THEN** existing tests pass unchanged
