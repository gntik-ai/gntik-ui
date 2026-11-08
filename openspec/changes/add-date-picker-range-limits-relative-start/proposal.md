# Date picker range limits relative to the start

## Why

Calendar predicates cannot inspect an in-progress start, and DateRangePicker accepts ranges of any length. Consumers can only reject retention windows after applying them.

## What Changes

- Add inclusive calendar-day `maxRange` and `minRange` limits while an end is pending, using UTC date parts across DST.
- Pass required context `{ rangeStart: Date | null }` to Calendar predicates and DatePicker presets; one-argument predicates remain supported.
- Forward limits through DateRangePicker, disable out-of-limit presets, report partial picks with `onCalendarChange` and announce the maximum once per start in English and Spanish.
- Add CalendarRangeLimits and DateRangePickerRetention live examples, regression tests, generated registry/docs output and one UI minor changeset.

## Impact

Issue #163; R1. Capabilities: ui/calendar and ui/date-picker, all requirements ADDED. Optional props preserve existing behavior and DOM when unset. No dependency changes. No open-ended ranges, typed entry, DateTimeRangePicker limits or additional preset bounds. Roll back by reverting or pinning the preceding UI release. Browser accessibility and visual checks run in PR CI.
