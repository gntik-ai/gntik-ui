## Purpose

The kit i18n layer exposes locale, messages, direction and display time zone for Date instants.

## ADDED Requirements

### Requirement: I18nProvider exposes a display time zone

I18nProvider SHALL accept timeZone (system, UTC or an IANA name, default system) and expose it through useI18n().timeZone. formatDate and Timestamp SHALL use that zone unless an explicit timeZone option is passed. ScheduleInput SHALL inherit it for previews and labels. Invalid names MUST fall back to system with one development warning naming the invalid value and no production warning. system MUST never reach Intl. createFormatters SHALL accept an additive optional zone parameter.

#### Scenario: Madrid display zone

- **GIVEN** an en-GB provider with Europe/Madrid
- **WHEN** formatDate formats 2026-04-15T07:30:00Z with short timeStyle
- **THEN** it returns 09:30 and absolute Timestamp shows 09:30
- **AND** an explicit UTC option returns 07:30

#### Scenario: Invalid zone

- **WHEN** a provider receives Mars/Base
- **THEN** useI18n().timeZone is system
- **AND** development logs one warning naming Mars/Base, while production logs none

#### Scenario: Provider preview default

- **GIVEN** a UTC provider and a ScheduleInput without a zone prop
- **WHEN** next runs are previewed
- **THEN** the instants, display times and label use UTC

### Requirement: Zone helpers convert wall time without DST errors

The public ui and i18n entries SHALL export zonedParts, fromZonedParts, formatTimeZoneLabel and isValidTimeZone. fromZonedParts SHALL default to compatible disambiguation (earlier overlap, forward gap), or return null for either with reject. Months SHALL be 1–12. UTC SHALL round-trip exactly. Labels SHALL return UTC for UTC and short ICU names with GMT offset fallback for IANA zones.

#### Scenario: Spring-forward gap

- **WHEN** 02:30 on 29 March 2026 in Europe/Madrid is converted
- **THEN** the result is 2026-03-29T01:30:00Z
- **AND** reject returns null

#### Scenario: Autumn overlap

- **WHEN** 02:30 on 25 October 2026 in Europe/Madrid is converted
- **THEN** the result is 2026-10-25T00:30:00Z
- **AND** reject returns null

### Requirement: Existing runtime and cron behavior remains unchanged

Unset zones SHALL preserve formatter output, Timestamp, ScheduleInput previews and nextRuns. Cron SHALL skip gap minutes and retain local earlier-offset and explicit Madrid later-offset overlap behavior.

#### Scenario: Cron overlap compatibility

- **WHEN** nextRuns evaluates 30 2 * * * from 24 October 2026 in Madrid
- **THEN** the local path yields 2026-10-25T00:30:00Z
- **AND** the explicit Europe/Madrid path yields 2026-10-25T01:30:00Z
