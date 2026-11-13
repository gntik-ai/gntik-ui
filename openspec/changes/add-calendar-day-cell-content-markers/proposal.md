# Calendar day markers, highlighted dates, loading state and custom day cells

## Why

Day buttons render only the day number and an Intl label, and besides `min`, `max` and `isDateDisabled` nothing can mark a day, so days with runs, incidents or maintenance windows cannot be shown in a picker. DatePicker and DateRangePicker forward a fixed set of Calendar props and no `onMonthChange`, so apps cannot observe the visible month to load its data.

## What Changes

- Add `getDayMarkers`, `highlightedDates`, `highlightedLabel`, `loading` and `renderDay` to Calendar, with the exported types `CalendarMarkerTone`, `CalendarDayMarker` and `CalendarDayState`.
- Render up to three 4 px token-coloured dots per in-month day, extend the day button's accessible name with every marker label, and switch the dots to `bg-primary-foreground` on the selected day.
- Add a loading state: `aria-busy` on each grid, a decorative spinner beside the month heading, one visually hidden status, no markers, and unchanged keyboard and selection behaviour.
- Forward the new props and `onMonthChange` through DatePicker and DateRangePicker.
- Add the `calendar.highlighted` catalog key (en, es), the CalendarMarkers example, docs, tests, regenerated registry output and one UI minor changeset.

## Impact

Issue #158; R1. Capability: ui/calendar, all requirements ADDED. Optional props preserve existing behavior and DOM when unset. No dependency changes. Out of scope: MonthCalendar block cells, markers in the month and year views, data fetching, category tones and free colours, the DatePicker footer slot. Roll back by reverting or pinning the preceding UI release.
