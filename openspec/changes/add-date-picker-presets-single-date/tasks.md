# Tasks

## 1. Implementation

- [x] 1.1 Add `DatePreset` in DatePicker/date-presets.ts and export it from DatePicker/index.ts.
- [x] 1.2 DatePicker.tsx: presets panel, disabled and pressed states, close and focus rules, and the `details` argument of `onValueChange`.
- [x] 1.3 i18n en.ts and es.ts: `datePicker.quickDates`; add the DatePickerExpiryPresets example and update DatePicker.doc.ts.

## 2. Tests

- [x] 2.1 DatePicker.presets.test.tsx: preset value and details, the null preset, disabled presets (min, max, isDateDisabled), aria-pressed, `withTime`, zone, focus order; axe on the example.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-date-picker-presets-single-date --strict`.
