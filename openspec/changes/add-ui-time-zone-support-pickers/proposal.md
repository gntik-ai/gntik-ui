# Display time zones for i18n and scheduling

## Why

Dates are instants, but tenant calendars need to display them in a zone independent of the runtime. The existing ScheduleInput conversion is private and cron must retain its DST choices.

## What changes

Add optional I18nProvider timeZone (system by default), shared zonedParts, fromZonedParts, formatTimeZoneLabel and isValidTimeZone helpers, and zone-aware formatDate, Timestamp and ScheduleInput defaults. MonthCalendar, WeekCalendar and AgendaList inherit the zone with optional overrides, grouping, navigating and formatting in that zone. Their headers name non-system zones using en/es catalog messages.

Compatible wall-time conversion takes the earlier overlap and moves gaps forward; reject returns null for either. Cron keeps skipping gaps and preserves its distinct local/explicit overlap choices. Intl formatters are cached. Server and client must receive the same zone for hydration.

## Impact

Minor releases for @gntik-ai/ui and @gntik-ai/blocks. No date picker or time picker zone props, zone selector, persistence, floating events, storage changes, deployment or migration. Pin previous releases or revert to roll back. Unset zones preserve runtime behavior and existing visual compositions.
