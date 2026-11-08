# DatePicker single-date presets

## Why

DateRangePicker renders `presets` as a pressed-state button group beside the calendar, but DatePicker has none: a relative expiry such as "In 30 days" always means paging through the calendar. `onValueChange` also cannot tell a form which preset was picked.

## What changes

- New exported type `DatePreset` (`{ id; label; date(today) => Date | null }`) and `presets?: DatePreset[]` (default `[]`) on DatePicker. `date` receives today (the `today` prop or the current day, in the effective `timeZone`); `null` clears the value.
- With presets, the popup uses the `panel`, `presets` and `preset` slots: a `role="group"` named by the new key `datePicker.quickDates` (en `Quick dates`, es `Fechas rápidas`), before the calendar, wrapping into a row on narrow screens.
- Activating a preset sets the value, closes the popup and returns focus to the field. With `withTime` it keeps the time (00:00 when empty) and leaves the popup open.
- Presets before `min`, after `max` or rejected by `isDateDisabled` are natively disabled. A preset on the value's day, or the null preset when the value is empty, has `aria-pressed="true"`.
- `onValueChange` gains an optional second argument `{ reason: 'calendar' | 'preset' | 'time'; presetId?: string }`. Clear paths still call it with one argument.
- DatePickerExpiryPresets example and DatePicker docs.

## Impact

Minor `@gntik-ai/ui` release; additive and optional. With `presets` unset or empty the DOM is unchanged. Handlers that compare all arguments of `onValueChange` (for example `toHaveBeenLastCalledWith(date)`) now also see the details argument. Out of scope: built-in preset sets, CreateApiKeyDialog, footer actions, any change to DateRangePicker or Calendar. Revert or pin the previous release to roll back.
