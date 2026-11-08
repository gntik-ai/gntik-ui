## Purpose

DatePicker and DateRangePicker: form fields opening a Calendar in a popover, with presets, bounds, locale formatting, sizes, Field support and hidden form values.

## ADDED Requirements

### Requirement: Partial range picks are reported

DateRangePicker SHALL call `onCalendarChange` for every calendar pick including a partial range, while `onValueChange` SHALL retain its complete-range semantics. DateRangePicker SHALL forward minRange and maxRange and discard pending picks when reopening.

#### Scenario: Two clicks

- **WHEN** the user picks 2026-03-10 and then 2026-03-14
- **THEN** onCalendarChange receives `{ start: 2026-03-10, end: null }` followed by the complete range
- **AND** onValueChange fires once with the complete range

#### Scenario: Reopening

- **GIVEN** a pending start under maxRange 7
- **WHEN** the popup closes and reopens
- **THEN** range limits no longer disable any day until a new start is picked

### Requirement: Presets outside the range limits are disabled

DateRangePicker SHALL natively disable presets whose inclusive calendar-day spans violate valid minRange or maxRange. Custom SHALL remain available. Additional min/max/predicate bounds on range presets are outside this change.

#### Scenario: Seven-day cap

- **GIVEN** maxRange 7 and default presets
- **WHEN** the popup opens
- **THEN** Last 30 days is disabled
- **AND** Today and Last 7 days remain enabled

### Requirement: Range limits are announced when a start is picked

DateRangePicker SHALL announce a valid maxRange once per start pick through an already-mounted, visually hidden polite live region, using the active English or Spanish catalog. Without maxRange, including minRange alone, it SHALL add no limit live region.

#### Scenario: English announcement

- **GIVEN** maxRange 7
- **WHEN** the user picks a start day
- **THEN** the region announces The range can span up to 7 days. once
- **AND** hovering or moving focus does not change the announcement

#### Scenario: Spanish announcement

- **GIVEN** maxRange 7 under an es I18nProvider
- **WHEN** a start is picked
- **THEN** the region announces El rango puede abarcar hasta 7 días.

### Requirement: Single-date presets provide explicit null context

DatePicker SHALL pass `{ rangeStart: null }` when evaluating a non-empty date preset with isDateDisabled.

#### Scenario: Preset evaluation

- **GIVEN** a destructuring predicate in DatePicker
- **WHEN** its presets render
- **THEN** it receives explicit null rangeStart without throwing

### Requirement: Optional limits preserve the existing interface

Without maxRange, minRange or onCalendarChange, existing DOM and visual appearance SHALL remain unchanged. New behaviors SHALL have live docs examples and accessible localized copy.

#### Scenario: No limit supplied

- **GIVEN** a DateRangePicker without the new props
- **WHEN** the popup opens
- **THEN** no additional live region is present
