# Tasks

## 1. Implementation

- [x] 1.1 EditableDateTrigger.tsx: DateField or DateRangeField plus a calendar PopoverTrigger button; DateTrigger.tsx and the read-only path are unchanged.
- [x] 1.2 DatePicker.tsx and DateRangePicker.tsx: `editable`, two-way sync with the calendar, focus return, inherited disabled, range emission rules, `withTime` granularity.
- [x] 1.3 DateField, DateRangeField and date-parts.ts: `timeZone` and `utc` without host-local Date math, 12-hour period rule, `rangeStart`, inherited `invalid`, group `aria-invalid`.
- [x] 1.4 i18n en.ts and es.ts: `datePicker.startDate`, `datePicker.endDate`; examples DatePickerEditable.tsx, DateRangePickerEditable.tsx and a UTC DateFieldTime field; DatePicker.doc.ts and DateField.doc.ts.

## 2. Tests

- [x] 2.1 DatePicker.editable.test.tsx and DateRangePicker.editable.test.tsx: order, naming, typing, paste, clear, bounds, range rules, calendar sync and focus return, Field disabled and invalid, zones, axe on the examples.
- [x] 2.2 DateField.zones.test.tsx: 12-hour period, `utc` and `timeZone`, UTC hidden inputs, group validity.
- [x] 2.3 Browser axe spec for the new examples in dark, light and high_contrast (PR CI).

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-date-picker-typed-date-entry --strict`.
