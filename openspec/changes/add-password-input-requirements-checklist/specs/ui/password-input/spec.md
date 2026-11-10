## Purpose

PasswordInput: a password field on Input with a reveal toggle, an optional segmented strength meter and autocomplete hints, linked to its Field.

## ADDED Requirements

### Requirement: Requirements render as a checklist linked to the input

With `rules` or `requirements`, PasswordInput SHALL render a named list with one item per requirement under the field, SHALL add the list to the input's aria-describedby together with any existing description, and SHALL NOT render the empty-state hint sentence.

#### Scenario: Length and number policy

- **GIVEN** a PasswordInput with rules minLength 12 and number inside a Field with a description
- **WHEN** the user focuses the input
- **THEN** the accessible description includes At least 12 characters and A number
- **AND** the Field description is still included

### Requirement: Each requirement shows its state with an icon and text

Each requirement SHALL be neutral while the value is empty and SHALL otherwise show a check icon with the met text or an X icon with the not met text, so that its state never depends on colour alone.

#### Scenario: Partly met

- **WHEN** the user types abcdefghijkl into a field with rules minLength 12 and number
- **THEN** At least 12 characters shows the check icon and met
- **AND** A number shows the X icon and not met

#### Scenario: Empty value

- **WHEN** the field is empty
- **THEN** every item is neutral, with neither the success nor the destructive token

### Requirement: Checklist changes are announced as a debounced summary

PasswordInput SHALL announce the met count through a polite status 700 ms after the last change, and SHALL announce only when the met count differs from the last announcement.

#### Scenario: Fast typing

- **WHEN** the user types a password that meets both rules in under 700 ms
- **THEN** nothing is announced while typing
- **AND** 2 of 2 requirements met is announced once afterwards

### Requirement: Strength derives from the met requirements unless given

Without a `strength` prop, PasswordInput SHALL score the password as four times the share of met requirements, rounded, and 0 while empty; an explicit `strength` SHALL take precedence.

#### Scenario: Half met

- **WHEN** one of two rules is met and no strength is passed
- **THEN** the meter shows score 2 and the label Fair

#### Scenario: Explicit strength

- **WHEN** both rules are met and strength 1 is passed
- **THEN** the meter shows score 1

### Requirement: checkPasswordRules reports the same policy outside the UI

`checkPasswordRules` SHALL return the met count, the total and the ids of failed rules for a password, using the same tests as the checklist.

#### Scenario: Too short

- **WHEN** checkPasswordRules runs on abc with minLength 12
- **THEN** it returns met 0, total 1 and failed minLength
