# DatePicker typed date entry

## Why

`DateTrigger` is a read-only `role="combobox"` input whose only job is to open the popover. DatePicker, DateRangePicker and `withTime` cannot take a typed or pasted date, and screen-reader users must work the grid. Operators in musematic and Falcone type known dates when filtering audit logs or setting key expiry. DateField and DateRangeField (`add-ui-date-field`) already provide the segment engine.

## What changes

- `editable?: boolean` (default `false`) on DatePicker and DateRangePicker. With it the trigger becomes a DateField or DateRangeField (the Field control, so FieldLabel and FieldDescription keep wiring) plus a calendar button (`aria-label` from `datePicker.choose`, `aria-haspopup="dialog"`, `aria-expanded`) that opens the same popover. With it unset the trigger is byte-identical.
- Segments follow the locale order. Typing emits `onValueChange` once the date is complete and `null` when a filled segment is cleared. Alt+ArrowDown on a segment opens the calendar. Pasting an ISO or locale-ordered numeric date fills every segment.
- Two-way sync: a typed date becomes the calendar's visible month and focused day (and calls `onMonthChange` in controlled month mode; `defaultMonth` applies only to the first open). A calendar pick rewrites the segments, closes the popup and focuses the calendar button, however it was opened.
- Typed dates before `min`, after `max` or rejected by `isDateDisabled` are emitted and marked `aria-invalid` with the error border.
- DateRangePicker `editable`: ends named `datePicker.startDate` and `datePicker.endDate`. An incomplete pair is not emitted, an end before the start is marked invalid and not emitted, a complete valid pair is emitted once, and only fully cleared segments emit an empty range. `isDateDisabled` gets the typed start as `rangeStart`.
- `withTime` + `editable`: granularity minute (second with `withSeconds`) and the `hourCycle`. A 12-hour value is emitted once its period is entered, never from an inferred one; a paste uses its own period.
- DateField and DateRangeField gain `timeZone` and `utc` (wall-time conversion through the zone helpers, UTC hidden inputs), a `rangeStart` argument for `isDateDisabled`, an inherited Field `invalid`, and `aria-invalid` on the group. DateRangeField gains `onEdit`, `startLabel` and `endLabel`.

## Impact

Minor `@gntik-ai/ui` release; new API is optional and additive. Rollback: revert, or pin the previous `@gntik-ai/ui` release. Not in scope: natural-language entry, typed entry in DateTimeRangePicker, zone segments, making `editable` the default, and `editable` with a granularity other than day (the read-only trigger stays there).
