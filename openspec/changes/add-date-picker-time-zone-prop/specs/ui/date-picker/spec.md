## Purpose

DatePicker and DateTimeRangePicker display and edit Date instants in an optional IANA time zone while preserving browser-zone behavior by default.

## ADDED Requirements

### Requirement: Time zone sets the wall clock of displayed values

DatePicker and DateTimeRangePicker SHALL resolve timeZone from the explicit prop, then I18nProvider, then system. Non-system zones SHALL control calendar days, time segments, today, min/max and field text. Calendar SHALL receive local-midnight proxy days, and isDateDisabled SHALL receive those proxy days. System behavior SHALL remain unchanged.

#### Scenario: UTC in a Madrid browser

- **GIVEN** TZ=Europe/Madrid, timeZone=UTC and value 2026-01-15T02:00:00Z
- **WHEN** DatePicker withTime renders with en-US
- **THEN** the field reads Jan 15, 2026, 2:00 AM UTC and time segments read 02:00

#### Scenario: Today in Tokyo

- **GIVEN** the current instant is 2026-01-15T23:30:00Z and timeZone=Asia/Tokyo
- **WHEN** the calendar opens
- **THEN** January 16 carries the today marker

#### Scenario: Provider zone

- **GIVEN** I18nProvider timeZone=UTC and no picker timeZone prop
- **WHEN** a picker renders
- **THEN** it uses UTC, including zone labels and DatePicker offset form values

### Requirement: Edits convert zoned wall time to an instant

Editing a day or time SHALL produce the instant of that wall time using the shared fromZonedParts compatible rule. Gaps SHALL move forward by the gap and repeated times SHALL resolve to the earlier occurrence. Date-only values SHALL emit midnight in the zone.

#### Scenario: UTC round trip

- **GIVEN** TZ=Europe/Madrid and timeZone=UTC
- **WHEN** the user picks January 20, 2026 and types 09:30
- **THEN** DatePicker emits 2026-01-20T09:30:00Z

#### Scenario: Spring-forward gap

- **GIVEN** timeZone=Europe/Madrid and day 2026-03-29
- **WHEN** the user types 02:30
- **THEN** the value is 2026-03-29T01:30:00Z

#### Scenario: Fall-back overlap

- **GIVEN** timeZone=Europe/Madrid and day 2026-10-25
- **WHEN** the user types 02:30
- **THEN** the value is 2026-10-25T00:30:00Z

#### Scenario: Date-only UTC selection

- **GIVEN** a date-only DatePicker with timeZone=UTC
- **WHEN** the user picks March 3, 2026
- **THEN** the value is 2026-03-03T00:00:00Z and the hidden input is 2026-03-03

### Requirement: Zoned values show their zone

Non-system field text SHALL include the short zone name and time row labels SHALL name the zone through English and Spanish catalog keys. hideTimeZone SHALL remove the zone from labels and field text. Caller formatOptions SHALL be respected while injecting the effective timeZone.

#### Scenario: Zone label

- **GIVEN** timeZone=UTC and withTime
- **WHEN** the popup opens
- **THEN** the row reads Time (UTC) in English or Hora (UTC) in Spanish via datePicker.timeIn

#### Scenario: Hidden zone

- **GIVEN** timeZone=UTC and hideTimeZone=true
- **WHEN** a picker renders
- **THEN** field text and time labels omit the zone while edits still use UTC

### Requirement: Zoned form values carry the offset

A DatePicker withTime in a non-system zone SHALL submit its wall time with a signed HH:mm UTC offset, including seconds with withSeconds. Date-only values SHALL submit the zoned YYYY-MM-DD. DateTimeRangePicker SHALL retain toISOString hidden values.

#### Scenario: Madrid offset

- **GIVEN** timeZone=Europe/Madrid, withTime, name=runAt and value 2026-03-03T02:00:00Z
- **WHEN** the field renders
- **THEN** runAt holds 2026-03-03T03:00+01:00

#### Scenario: UTC offset

- **GIVEN** timeZone=UTC and withTime
- **WHEN** the value is 2026-01-20T09:30:00Z
- **THEN** the hidden value is 2026-01-20T09:30+00:00

### Requirement: Absolute ranges use the display zone while relative ranges retain instants

DateTimeRangePicker SHALL edit both absolute endpoints in the effective zone. Relative preset values and resolved instants SHALL remain identical with and without timeZone.

#### Scenario: Absolute UTC editing

- **GIVEN** TZ=Europe/Madrid and timeZone=UTC
- **WHEN** the user applies January 20, 2026 from 09:30 to 10:45
- **THEN** start is 2026-01-20T09:30:00Z and end is 2026-01-20T10:45:00Z, submitted as ISO strings

#### Scenario: Relative preset

- **GIVEN** now is 2026-01-15T23:30:00Z
- **WHEN** Last 15 minutes is selected in any display zone
- **THEN** the resolved start is 2026-01-15T23:15:00Z and end is 2026-01-15T23:30:00Z

### Requirement: Unknown time zones fall back to the browser zone

An invalid timeZone MUST NOT throw and SHALL resolve to system for display, editing and submission, even when the provider specifies a valid zone.

#### Scenario: Typo in the zone

- **GIVEN** TZ=Europe/Madrid and timeZone=Not/AZone
- **WHEN** value 2026-01-15T02:00:00Z renders and is edited to 09:00
- **THEN** the field initially shows 03:00 without a zone and emits 2026-01-15T08:00:00Z after editing
