## Purpose

RadioGroup: a single-choice group of radios on Base UI RadioGroup and Radio, with optional label, description and trailing content per option, in plain, list and card variants.

## ADDED Requirements

### Requirement: Horizontal orientation lays options out in a wrapping row

With `orientation="horizontal"`, RadioGroup SHALL lay plain options out in a row that wraps onto new lines when space runs out, and card options in equal-width columns, and MUST NOT cause horizontal page scroll.

#### Scenario: Billing cycle on a wide form

- **GIVEN** a horizontal plain group with Monthly and Annual
- **WHEN** it renders 600px wide
- **THEN** both radios are on one line
- **AND** Annual follows Monthly in reading order

#### Scenario: Five options at phone width

- **WHEN** a horizontal plain group with five options renders 240px wide
- **THEN** the options wrap onto several lines
- **AND** the page has no horizontal scrollbar

#### Scenario: Card options side by side

- **WHEN** a horizontal card group with three options renders 720px wide
- **THEN** the three cards have equal widths

#### Scenario: Card options at phone width

- **WHEN** a horizontal card group with three options renders 320px wide
- **THEN** the cards form a single column

#### Scenario: Right-to-left reading order

- **WHEN** a horizontal plain group renders under `dir="rtl"`
- **THEN** the first radio is the rightmost one

### Requirement: Horizontal groups keep the radio group keyboard model

A horizontal RadioGroup SHALL keep role radiogroup, a single Tab stop on the selected radio, Arrow Right or Arrow Down to select the next radio and Arrow Left or Arrow Up to select the previous one, wrapping at both ends.

#### Scenario: Arrow Right selects the next option

- **GIVEN** a horizontal group with Monthly selected and focused
- **WHEN** the user presses Arrow Right
- **THEN** Annual is focused
- **AND** Annual is checked

#### Scenario: Wrap at the end

- **GIVEN** Annual, the last option, is selected and focused
- **WHEN** the user presses Arrow Right
- **THEN** Monthly is focused and checked

### Requirement: List variant and default orientation keep the vertical layout

RadioGroup SHALL render its vertical layout when `orientation` is unset or `vertical`, and for `variant="list"` whatever the orientation; a group without the prop MUST keep the same DOM as before this change.

#### Scenario: Default group

- **WHEN** a RadioGroup renders without `orientation`
- **THEN** the options stack vertically
- **AND** the group has no `data-orientation` attribute

#### Scenario: List ignores horizontal

- **WHEN** a RadioGroup renders with `variant="list"` and `orientation="horizontal"`
- **THEN** the options render as vertical divided rows
