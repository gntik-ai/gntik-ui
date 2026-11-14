## Purpose

DatePicker and DateRangePicker: form fields that open a Calendar in a popover, with presets, min/max and disabled dates, locale formatting, sizes, Field support and hidden form values.

## ADDED Requirements

### Requirement: Editable trigger shows locale-ordered date segments

With `editable`, DatePicker SHALL render its date as spinbutton segments in the locale's order with a separate button that opens the calendar, and the segment group SHALL be the Field control.

#### Scenario: US order

- **GIVEN** `editable` and locale `en-US` inside a Field labelled `Expires on`
- **WHEN** the field renders
- **THEN** the group named `Expires on` holds month, day and year segments in that order
- **AND** a button named `Choose date` follows it

#### Scenario: Spanish order

- **GIVEN** `editable` and locale `es-ES`
- **WHEN** the field renders
- **THEN** the segments are day, month and year

#### Scenario: Unset keeps the read-only trigger

- **GIVEN** `editable` is not set
- **WHEN** the field renders
- **THEN** the trigger is the read-only combobox input, unchanged

### Requirement: Typed dates emit once complete

An editable DatePicker SHALL emit `onValueChange` when every segment is filled and SHALL emit null when a filled segment is cleared.

#### Scenario: Typing a date

- **GIVEN** `editable` and locale `en-US`
- **WHEN** the user types 10, 01 and 2026
- **THEN** `onValueChange` is called once with 2026-10-01

#### Scenario: Clearing a segment

- **GIVEN** the value 2026-10-01
- **WHEN** the user presses Backspace on the day segment
- **THEN** `onValueChange` is called with null

#### Scenario: A 12-hour value waits for its period

- **GIVEN** `editable`, `withTime` and locale `en-US`
- **WHEN** the user types 10012026 and 0230
- **THEN** `onValueChange` is not called
- **WHEN** the user then types `p`
- **THEN** `onValueChange` is called once with 2026-10-01 14:30

### Requirement: Calendar and segments stay in sync

A calendar pick SHALL rewrite the segments and return focus to the calendar button, and a typed date SHALL become the calendar's visible month and focused day.

#### Scenario: Pick in the calendar

- **WHEN** the user opens the calendar, with the button or with Alt+ArrowDown, and picks March 3, 2026
- **THEN** the segments read 03/03/2026
- **AND** the popup closes and focus is on the calendar button

#### Scenario: Typed date drives the calendar

- **GIVEN** `defaultMonth` is January 2026
- **WHEN** the user types 10012026 and opens the calendar
- **THEN** October 2026 is shown with October 1 focused
- **AND** a controlled `month` receives October 2026 through `onMonthChange`

### Requirement: Pasted dates fill every segment

Pasting an ISO `YYYY-MM-DD` date or a numeric date in the locale's order into any segment SHALL fill all segments in one change, including a 12-hour picker.

#### Scenario: ISO paste

- **WHEN** the user pastes `2026-10-01` into the day segment
- **THEN** all three segments are filled
- **AND** `onValueChange` is called once with 2026-10-01

### Requirement: Typed range ends are validated

An editable DateRangePicker SHALL NOT emit an incomplete range, SHALL mark an end before the start as invalid without emitting it, and SHALL emit a complete valid pair once.

#### Scenario: End before start

- **GIVEN** the start field holds 2026-03-10
- **WHEN** the user types 2026-03-05 in the end field
- **THEN** the end field is marked invalid
- **AND** `onValueChange` is not called

#### Scenario: Partial clear

- **GIVEN** a complete range
- **WHEN** the user clears only the day of one or both ends
- **THEN** `onValueChange` is not called
- **WHEN** every segment of both ends is cleared
- **THEN** `onValueChange` is called once with an empty range

#### Scenario: Disabled end

- **GIVEN** `isDateDisabled` rejects an end given the start
- **WHEN** the user types that pair
- **THEN** `isDateDisabled` receives the typed start as `rangeStart`
- **AND** the pair is emitted and marked invalid

### Requirement: Out-of-bounds typed dates are marked invalid

A typed date before `min`, after `max` or rejected by `isDateDisabled` SHALL be emitted and the field SHALL be marked invalid.

#### Scenario: After max

- **GIVEN** `max` is 2026-12-31
- **WHEN** the user types 2027-01-05
- **THEN** `onValueChange` receives 2027-01-05
- **AND** the group has `aria-invalid="true"`

### Requirement: Zoned wall times never use the host clock

With `timeZone` or `utc`, typed and displayed wall times SHALL be converted through the zone, never through host-local dates.

#### Scenario: UTC on a New York host

- **GIVEN** the host zone is America/New_York and `timeZone` is `UTC`
- **WHEN** the user types 2026-03-08 02:30
- **THEN** `onValueChange` receives 02:30 UTC

### Requirement: Inherited Field state reaches the editable pickers

An inherited Field `disabled` SHALL disable the segments and the calendar button, and an inherited Field `invalid` SHALL mark the group and segments invalid, on a fresh render and after an edit.

#### Scenario: Disabled Field

- **GIVEN** the picker is inside a disabled Field
- **THEN** the segments and the `Choose date` button are disabled
- **AND** no value changes through the calendar
