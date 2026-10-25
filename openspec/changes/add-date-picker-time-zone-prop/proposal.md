# Date picker time zones

## Why

DatePicker and DateTimeRangePicker currently display and edit in the browser zone, requiring manual conversion when scheduling in UTC or a tenant zone. The shared zone helpers and I18nProvider zone from add-ui-time-zone-support-pickers have landed.

## What changes

Add optional timeZone and hideTimeZone props to both pickers. Resolve the zone from the explicit prop, then I18nProvider, then system; invalid names use system. Non-system zones control calendar days, min/max, today, time segments, edits and field formatting. Calendar remains unchanged and receives local-midnight proxy days; isDateDisabled receives those same proxy days. Use the existing zonedParts, fromZonedParts with compatible disambiguation, formatTimeZoneLabel and isValidTimeZone helpers.

Show short zone names in field text and translated time labels unless hideTimeZone is true. Respect caller formatOptions while injecting the effective zone. DatePicker submits zoned wall time with an offset (optional seconds), or YYYY-MM-DD for date-only values, which emit zoned midnight. DateTimeRangePicker keeps ISO hidden values and instant-based relative presets. System paths retain existing behavior.

## Impact

Minor @gntik-ai/ui release. Provider-inherited non-system zones also activate zone labels and DatePicker form offsets. Add English/Spanish catalog messages, live examples, fixed-Madrid-runtime tests and accessibility coverage, then regenerate registry and llms output. No dependency changes, Calendar changes, standalone TimePicker changes, ScheduleInput API changes, date-only range changes, zone selector, persistence, publishing or deployment. Revert or pin the previous UI release to roll back; no migration.
