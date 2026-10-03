---
"@gntik-ai/ui": minor
---

New form components: PermissionMatrix (roles × permissions grid, tri-state allowed / denied / inherited cells with icon + text, read-only columns, per-cell disabled reasons, grid keyboard navigation), QueryBuilder (nested AND/OR groups of typed conditions, plus `queryToString` and `evaluateQuery`), ScheduleInput (cron presets + raw field, validation, plain-language summary and next runs in a time zone, plus `parseCron`, `describeCron`, `nextRuns`), TimePicker (hour/minute/second spinbutton segments, 12/24h by locale, step) and DateTimeRangePicker (relative presets, "Last N" and absolute date + time ranges). DatePicker gains an optional `withTime` (with `hourCycle`, `timeStep`, `withSeconds`); its existing API is unchanged.
