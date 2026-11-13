# Tasks

## 1. Implementation

- [x] 1.1 Calendar.tsx: resolve markers per in-month day, extend the day `aria-label`, render the dots, the `loading` state (Spinner, status, `aria-busy`) and `renderDay`; export the new types from Calendar/index.ts.
- [x] 1.2 calendar.variants.ts: `markers` and `marker` slots with a `tone` variant mapped to token classes and the selected-day override.
- [x] 1.3 DatePicker.tsx and DateRangePicker.tsx: add the props to the Calendar pass-through and forward them.
- [x] 1.4 i18n messages en.ts and es.ts: `calendar.highlighted`; add the CalendarMarkers example and the new tokens in Calendar.doc.ts.

## 2. Tests

- [x] 2.1 Calendar.markers.test.tsx: dots and tone classes, accessible names with one and four markers, selected-day dot colour, outside days, `highlightedDates` in en and es, `loading` with keyboard selection, `renderDay` wrapper.
- [x] 2.2 DatePicker.markers.test.tsx: forwarding and `onMonthChange` on PageDown; axe on the CalendarMarkers example.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-calendar-day-cell-content-markers --strict`.
