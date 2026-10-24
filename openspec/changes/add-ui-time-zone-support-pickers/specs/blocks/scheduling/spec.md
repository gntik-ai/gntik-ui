## Purpose

Scheduling blocks show Date instants on the display clock while preserving native keyboard navigation.

## ADDED Requirements

### Requirement: Events are placed in the display time zone

MonthCalendar, WeekCalendar and AgendaList SHALL accept timeZone defaulting to the I18nProvider zone (system outside a provider). Day bucketing, hour placement, times, today, now line and calendar navigation SHALL use that zone. Intl formatters SHALL be cached per locale and zone. Blocks SHALL import helpers only from the public ui entry. TimeSlotPicker SHALL remain unchanged.

#### Scenario: UTC display on a Madrid machine

- **GIVEN** the runtime zone Europe/Madrid
- **WHEN** a UTC MonthCalendar shows an event at 2026-04-15T23:30:00Z
- **THEN** it is listed on 15 April

#### Scenario: New York week

- **WHEN** an America/New_York WeekCalendar for the week of 13 April 2026 shows an event at 2026-04-15T13:00:00Z
- **THEN** it starts in the 09:00 row
- **AND** AgendaList groups and formats in the same zone

### Requirement: Scheduling headers name a non-system zone

The scheduling headers SHALL use the en/es scheduling.timeZone message (Times in {zone} / Horas en {zone}) only for non-system zones, as plain text wrapping at narrow widths. New examples SHALL use token classes and be accessible in dark, light and high_contrast themes.

#### Scenario: Zone label

- **WHEN** a WeekCalendar renders the week of 13 April 2026 in America/New_York
- **THEN** its header reads Times in America/New_York (EDT)

#### Scenario: Unset zone parity

- **WHEN** all zone props are omitted
- **THEN** runtime output and existing scheduling visual compositions remain unchanged
