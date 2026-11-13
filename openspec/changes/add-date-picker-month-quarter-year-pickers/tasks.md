# Tasks

## 1. Implementation

- [x] 1.1 DatePicker.tsx and DateRangePicker.tsx: `granularity` branch rendering PeriodCalendar, period start and end values, range ordering and hover preview by period; forward `month` and `defaultMonth`.
- [x] 1.2 `startOfPeriod`, `endOfPeriod`, WeekGrid and PeriodCalendar take an optional `weekStartsOn` (default 1); DatePicker/period-field.ts holds the field text and snapping.
- [x] 1.3 i18n en.ts and es.ts: `datePicker.quarter` and the example strings; examples DatePickerMonth.tsx and DateRangePickerQuarters.tsx; DatePicker.doc.ts.

## 2. Tests

- [x] 2.1 DatePicker.granularity.test.tsx and DateRangePicker.granularity.test.tsx: each granularity, both click orders, week start, bounds, hidden inputs, en and es text, `month` forwarding; axe on the new examples.
- [x] 2.2 calendar-utils.test.ts: `weekStartsOn` for start and end of week periods.
- [x] 2.3 Browser axe spec for the new examples in dark, light and high_contrast (PR CI).

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-date-picker-month-quarter-year-pickers --strict`.
