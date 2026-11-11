## Purpose

Slider: a single value or range picker on Base UI Slider with a visible label, per-thumb names, a value readout and two sizes, working inside Field and Form.

## ADDED Requirements

### Requirement: Paired input mirrors the slider value

With `withInput`, Slider SHALL render a kit NumberInput per thumb bound to the same value and named by the visible slider label or the thumb label, falling back to the slider aria-label. It SHALL update the input on every slider change and move the slider on every valid typed value within the bounds. It SHALL support controlled and uncontrolled values and notify onValueChange once per valid change.

#### Scenario: Labelled single slider

- **GIVEN** a Temperature slider with withInput, min 0, max 2, step 0.1 and defaultValue 0.7
- **THEN** one slider and one spinbutton are named Temperature
- **AND** the spinbutton shows 0.7

#### Scenario: Keyboard on the slider updates the input

- **GIVEN** a Temperature slider with withInput at 0.7 and step 0.1
- **WHEN** the user presses Arrow Right on the slider
- **THEN** the spinbutton shows 0.8

#### Scenario: Typing moves the slider

- **WHEN** the user enters 1.3 in the spinbutton as one edit
- **THEN** the slider aria-valuenow is 1.3
- **AND** onValueChange receives 1.3 once

### Requirement: Typed values are clamped and snapped on commit

On blur or Enter, the paired input SHALL clamp its value to the bounds and round to the nearest step from min, trimming floating point noise to the step precision. Empty or unparsable text SHALL restore the current value without calling onValueChange. Range inputs SHALL also clamp against neighbouring thumbs and respect minStepsBetweenValues.

#### Scenario: Above the maximum

- **WHEN** the user types 5 in a 0 to 2 slider input and presses Tab
- **THEN** both controls show 2

#### Scenario: Between steps

- **GIVEN** min 0 and step 0.1
- **WHEN** the user types 1.37 and presses Enter
- **THEN** both controls show 1.4 without floating point noise

#### Scenario: Empty input

- **WHEN** the user clears the input and blurs
- **THEN** the previous value is restored without a value change callback

#### Scenario: Minimum above the maximum thumb

- **GIVEN** a range slider with values 2 and 8 and thumb labels Minimum and Maximum
- **WHEN** the user types 9 in Minimum and blurs
- **THEN** the Minimum input and thumb show 8

### Requirement: The slider stays the form control when paired

With withInput, Slider SHALL keep name, Field registration, validation and form submission on the slider. Paired inputs MUST NOT submit values of their own or bind to the enclosing Field. Isolation SHALL use public Base UI APIs.

#### Scenario: Submitting a form

- **GIVEN** a paired slider inside a Field named temperature
- **WHEN** the form is submitted
- **THEN** exactly one temperature value is sent
- **AND** the Field label labels the slider
- **AND** Field invalid applies to the slider without marking the paired input invalid

### Requirement: Pairing is additive and follows kit presentation and accessibility

With withInput unset, Slider SHALL preserve its existing DOM and slot classes. With pairing enabled, Slider SHALL hide showValue, retain a label-only header, disable every input when disabled, and use token classes only. Input size SHALL default to the slider size; inputProps SHALL forward unit, hideSteppers and size. Bounds, step, largeStep, locale and format SHALL be shared. New example strings SHALL use English and Spanish i18n entries. Documentation SHALL demonstrate the behavior and explain snapping. The new example SHALL have no axe violations in dark, light and high_contrast themes.

#### Scenario: Paired presentation

- **GIVEN** withInput, showValue and disabled
- **THEN** no header value readout is shown
- **AND** every slider and spinbutton is disabled

#### Scenario: Input size follows slider size

- **GIVEN** a small Slider with withInput and no explicit input size
- **THEN** the paired input is small
- **AND** explicit inputProps.size overrides that default
