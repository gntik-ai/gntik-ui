# DatePicker granularity

## Why

DatePicker and DateRangePicker always open the day grid and format with `dateStyle: 'medium'`. Picking March takes two clicks in a range picker, and a quarter or a year cannot be expressed or shown as one value. DatePicker also hides the visible month: it forwards `onMonthChange` but not `month` or `defaultMonth`.

## What changes

- `granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year'` (default `'day'`) on DatePicker and DateRangePicker. Other values render the shared PeriodCalendar and its period grids instead of the day Calendar. The default takes the existing code path.
- DatePicker emits the first day of the period at local midnight; DateRangePicker emits the first day of the earlier period to the last day of the later one, in either click order. Non-system time zones go through the same `fromZonedParts` path as day picks.
- Weeks follow `weekStartsOn` (or the locale's first day). `startOfPeriod`, `endOfPeriod`, the week grid and PeriodCalendar take an optional `weekStartsOn` that defaults to 1, so PeriodPicker stays ISO and unchanged.
- Field text: `Mar 2026`, `2026`, `Mar 2 – 8, 2026`, `Jan – Jun 2026`, and the new `datePicker.quarter` key (`Q2 2026` / `T2 2026`). `formatOptions` overrides it.
- `min` and `max` disable periods outside them; `isDateDisabled`, `withTime`, `maxRange`, `minRange` and `numberOfMonths` apply to the day granularity only. The day presets of DateRangePicker are hidden unless `presets` is passed.
- Hidden inputs keep `YYYY-MM-DD` (the period start, or `<name>-start` and `<name>-end` as first and last day).
- DatePicker forwards `month` and `defaultMonth` to its Calendar.

## Impact

Minor `@gntik-ai/ui` release; new API is optional and additive. Examples DatePickerMonth and DateRangePickerQuarters, DatePicker docs, en and es catalog entries, regenerated registry. Rollback: revert, or pin the previous `@gntik-ai/ui` release. Not in scope: the standalone PeriodPicker API, fiscal years, typed period entry, DateTimeRangePicker periods, ISO week-number display, period-shaped hidden values.
