# Display time zones

Pass `timeZone="UTC"` or an IANA zone such as `Europe/Madrid` to `I18nProvider`. The default, `system`, preserves the runtime clock. Invalid provider zones fall back to `system` with a development warning. Pass the same zone on the server and client to avoid hydration differences.

`useI18n().timeZone` exposes the zone. `createFormatters(locale, messages, timeZone?)` accepts the same optional default. `formatDate` uses it unless `options.timeZone` overrides it. Timestamp applies it to absolute text and tooltips; `dateOptions.timeZone` and `tooltipOptions.timeZone` independently override it. Relative time remains elapsed time.

ScheduleInput inherits the provider zone for upcoming cron runs and labels; its own `timeZone` prop takes precedence. Cron skips nonexistent minutes and retains its existing overlap resolution (the local Madrid path chooses the earlier instant, the explicit Madrid path the later one).

MonthCalendar, WeekCalendar and AgendaList inherit the provider zone or accept an explicit `timeZone`. Their day grouping, navigation, today, event times, hour placement and now line use that zone. Callbacks still receive Date instants; a selected day is midnight in the display zone. Headers name non-system zones; the abbreviation uses the visible period and ICU data, with GMT offsets when needed. The TimeZone live examples show UTC defaults, New York overrides and Spanish Madrid output.

The public `@gntik-ai/ui` entry exports:

- `zonedParts(date, timeZone?)`: wall fields with months 1–12, seconds and milliseconds.
- `fromZonedParts(parts, timeZone?, disambiguation?)`: Date or null. `compatible` (default) chooses the earlier overlap and moves gaps forward. `reject` returns null for both. Invalid calendar fields return null.
- `isValidTimeZone(name)`: validates `system`, UTC and supported IANA zones.
- `formatTimeZoneLabel(timeZone, date?, locale?)`: short ICU name or GMT offset; UTC always reads UTC. Abbreviations depend on locale and ICU data.

The TimestampTimeZone example demonstrates conversion, validation, zone parts, labels and provider formatting. DatePicker, DateTimeRangePicker, TimePicker and TimeSlotPicker have no new zone prop. Values remain instants; zone selection, persistence, floating events and recurring block events are outside this change.
