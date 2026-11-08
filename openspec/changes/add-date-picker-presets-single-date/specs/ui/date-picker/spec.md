## Purpose

DatePicker and DateRangePicker: form fields that open a Calendar in a popover, with presets, min/max and disabled dates, locale formatting, sizes, Field support and hidden form values.

## ADDED Requirements

### Requirement: Single-date presets compute the value from today

DatePicker SHALL render each entry of `presets` as a button that, when activated, sets the value to the preset's `date(today)` result, where today is the `today` prop or the current day in the effective time zone; a `null` result MUST clear the value.

#### Scenario: In 30 days

- **GIVEN** `today` is 2026-03-01 and a preset `In 30 days` adds 30 days
- **WHEN** the user activates the preset
- **THEN** the value becomes 2026-03-31
- **AND** the popup closes and focus returns to the field

#### Scenario: No expiry

- **GIVEN** the value is 2026-05-01 and a preset returns `null`
- **WHEN** the user activates it
- **THEN** the value becomes `null`
- **AND** the field shows the placeholder

### Requirement: Value changes report their reason

`onValueChange` SHALL accept an optional second argument whose reason is `preset` (with the preset's id) for preset picks, `calendar` for day picks and `time` for time edits.

#### Scenario: Reason details

- **WHEN** the user activates the preset with id `in-30`
- **THEN** `onValueChange` receives `{ reason: 'preset', presetId: 'in-30' }` as its second argument

### Requirement: Presets outside the allowed dates are disabled

A preset whose date is before `min`, after `max` or rejected by `isDateDisabled` SHALL be disabled and MUST NOT change the value.

#### Scenario: Beyond max

- **GIVEN** `max` is 2026-03-15 and today is 2026-03-01
- **WHEN** the popup opens with an `In 30 days` preset
- **THEN** the preset is disabled
- **AND** clicking it leaves the value unchanged

### Requirement: The preset matching the value is pressed

Each preset button SHALL expose aria-pressed, true when its date is the same day as the value or when both are null, and false otherwise.

#### Scenario: Matching day

- **GIVEN** the value is 2026-03-31 and today is 2026-03-01
- **WHEN** the popup opens
- **THEN** `In 30 days` has `aria-pressed="true"`
- **AND** the other presets have `aria-pressed="false"`

### Requirement: Presets with time keep the time and the popup

With `withTime`, a preset SHALL set the day while keeping the current time of day, or midnight when the value is empty, and SHALL leave the popup open.

#### Scenario: Time kept

- **GIVEN** `withTime` and a value of 2026-03-01 14:30
- **WHEN** the user activates `In 30 days`
- **THEN** the value becomes 2026-03-31 14:30
- **AND** the popup stays open
