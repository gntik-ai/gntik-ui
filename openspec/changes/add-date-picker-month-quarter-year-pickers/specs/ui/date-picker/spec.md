## Purpose

DatePicker and DateRangePicker: form fields that open a Calendar in a popover, with presets, min/max and disabled dates, locale formatting, sizes, Field support and hidden form values.

## ADDED Requirements

### Requirement: Granularity picks the first day of a whole period

With `granularity` set to week, month, quarter or year, DatePicker SHALL open the matching period grid and SHALL emit the first day of the picked period at local midnight, honouring `weekStartsOn` for weeks.

#### Scenario: Month

- **GIVEN** `granularity` is `month`
- **WHEN** the user picks March 2026
- **THEN** `onValueChange` receives 2026-03-01 00:00 local
- **AND** the popup closes

#### Scenario: Week starting on Monday

- **GIVEN** `granularity` is `week` and `weekStartsOn` is 1
- **WHEN** the user picks the week that contains 2026-03-04
- **THEN** `onValueChange` receives 2026-03-02

### Requirement: Range granularity spans whole periods in either click order

DateRangePicker with a granularity other than day SHALL emit a range from the first day of the earlier picked period to the last day of the later one, regardless of the order of the two clicks.

#### Scenario: Reverse clicks

- **GIVEN** `granularity` is `month`
- **WHEN** the user clicks June 2026 and then January 2026
- **THEN** `onValueChange` is called once with 2026-01-01 to 2026-06-30

### Requirement: Period values are formatted with Intl and the catalog

Unless `formatOptions` is set, the field SHALL format month and year values with Intl.DateTimeFormat in the active locale, week values as a day range and quarter values with the catalog quarter label.

#### Scenario: Spanish quarter

- **GIVEN** locale `es-ES` and `granularity` is `quarter`
- **WHEN** the value is 2026-04-01
- **THEN** the field reads `T2 2026`

#### Scenario: Month range

- **GIVEN** locale `en-US` and a month range from January to June 2026
- **WHEN** the field renders
- **THEN** it reads `Jan – Jun 2026`

### Requirement: Periods outside min and max are disabled

A period SHALL be disabled and MUST NOT be pickable when it ends before `min` or starts after `max`.

#### Scenario: Minimum mid-February

- **GIVEN** `granularity` is `month` and `min` is 2026-02-15
- **WHEN** the month grid of 2026 is shown
- **THEN** January is aria-disabled
- **AND** February is enabled

### Requirement: DatePicker exposes the visible month

DatePicker SHALL accept `month`, `defaultMonth` and `onMonthChange` and forward them to its Calendar in the day granularity.

#### Scenario: Observed paging

- **GIVEN** a DatePicker with `onMonthChange`, open on March 2026
- **WHEN** the user activates the next-month button
- **THEN** `onMonthChange` is called with 2026-04-01
