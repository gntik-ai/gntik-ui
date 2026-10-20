## Purpose

Scheduling blocks and their shared native-Date helpers: month/week grids, event times and keyboard navigation.

## ADDED Requirements

### Requirement: Week grids start on the locale's first weekday

MonthCalendar and WeekCalendar SHALL use an explicit weekStartsOn when supplied, otherwise the I18nProvider locale's first weekday, otherwise the runtime locale, matching ui Calendar. Engines without week information SHALL fall back to Monday.

#### Scenario: US English

- **GIVEN** an en-US I18nProvider and April 2026
- **WHEN** MonthCalendar renders
- **THEN** Sunday is the first header and 29 March 2026 is the first cell

#### Scenario: Spanish

- **GIVEN** an es-ES I18nProvider and April 2026
- **WHEN** MonthCalendar renders
- **THEN** Monday is the first header and 30 March 2026 is the first cell

#### Scenario: Explicit week start and Today

- **GIVEN** en-US and weekStartsOn={1}
- **WHEN** either calendar renders or WeekCalendar navigates to Today
- **THEN** its weeks start on Monday

### Requirement: Event times follow the locale's hour cycle

MonthCalendar, WeekCalendar and AgendaList SHALL use an explicit hourCycle when supplied, otherwise the provider or runtime locale's hour cycle. Twelve-hour times SHALL use numeric hours; 24-hour times SHALL retain two-digit hours and h23. The ui package SHALL newly export only localeWeekStart and SHALL preserve the existing localeHourCycle(locale?): 12 | 24 API unchanged. Blocks SHALL reuse that numeric helper through an internal mapping to h12/h23. Defaults SHALL be resolved each render using useOptionalI18n()?.locale, otherwise undefined for the runtime locale; useI18n().locale SHALL NOT supply these defaults.

#### Scenario: Twelve-hour locale

- **GIVEN** en-US and an event from 09:30 to 10:00
- **WHEN** WeekCalendar renders
- **THEN** the event range reads 9:30 AM–10:00 AM and its 09:00 gutter label reads 9 AM

#### Scenario: Twenty-four-hour locale or override

- **GIVEN** es-ES, or en-US with hourCycle="h23"
- **WHEN** any of the three blocks renders the same event
- **THEN** the time reads 09:30 and ranges read 09:30–10:00

### Requirement: Week-based keys follow the week start

MonthCalendar SHALL move focus to the resolved week's first and last day on Home and End, preserving roving tabindex and RTL arrows.

#### Scenario: Sunday-first week

- **GIVEN** en-US and focus on Wednesday 15 April 2026
- **WHEN** Home or End is pressed
- **THEN** focus moves to Sunday 12 April or Saturday 18 April respectively

#### Scenario: Monday-first week

- **GIVEN** es-ES and focus on Wednesday 15 April 2026
- **WHEN** Home or End is pressed
- **THEN** focus moves to Monday 13 April or Sunday 19 April respectively

### Requirement: Weekend days are marked for styling

MonthCalendar cells and WeekCalendar columns SHALL carry data-weekend for locale weekend days, mapping Intl days 1–7 to JS days 0–6 and falling back to Saturday/Sunday. Classes and appearance SHALL remain unchanged.

#### Scenario: Default weekend

- **GIVEN** en-US
- **WHEN** either calendar renders
- **THEN** all Saturday and Sunday cells or columns have data-weekend and no weekday has it

#### Scenario: Existing public clock API

- **GIVEN** imports from the ui package root
- **WHEN** localeHourCycle is called with en-US or en-GB
- **THEN** it returns 12 or 24 respectively, with the existing TimePicker assertions unchanged
- **AND** localeWeekStart is importable from the same root

#### Scenario: No provider

- **GIVEN** no I18nProvider
- **WHEN** MonthCalendar and ui Calendar render beside each other
- **THEN** their first weekday matches localeWeekStart(undefined)
