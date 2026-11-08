import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DatePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Date field with a focusable trigger ref: a read-only input with the Intl-formatted date that opens a Popover with a Calendar. DateRangePicker (alias DateRangeInput) adds presets — Today, Last 7 days, Last 30 days, This month, Last month, Custom — beside a two-month range calendar. Min/max, disabled dates, locale, sizes, invalid state; works inside Field. `withTime` adds a TimePicker under the calendar (date + time value, 12/24h, minute step), closed with Done. DatePicker and DateRangePicker accept ref on their input; calling focus leaves the popup closed. Both pickers support `clearable`, `onClear` and `clearLabel`: reset from the field button, Delete/Backspace, or the popup Clear action. Clearing closes the popup and restores field focus. `readOnly` prevents edits. DatePicker accepts `timeZone` (IANA, UTC or system), defaulting to I18nProvider then the browser; invalid names fall back to the browser. Calendar days, today, min/max, time segments and edits use that wall clock while values stay Date instants. isDateDisabled receives a local-midnight proxy of the zoned calendar day. DST gaps move forward and overlaps choose the earlier occurrence. Non-system zones appear in field text and time labels unless `hideTimeZone` is true. With time, hidden values include the wall time and UTC offset (and seconds with `withSeconds`); date-only values submit YYYY-MM-DD and emit zoned midnight. Custom formatOptions retain their format but use the effective zone. DatePicker `presets` adds app-defined quick dates ({ id, label, date(today) }) in a Quick dates group before the calendar, wrapping into a row on narrow screens: activating one sets the day (with `withTime` it keeps the time, or 00:00 when empty, and the popup stays open), otherwise closes the popup and returns focus to the field; a preset returning null clears the value. Presets before `min`, after `max` or rejected by `isDateDisabled` are disabled; the preset on the value day (or the null preset when empty) has aria-pressed. Today for presets is the `today` prop or the current day in the effective zone. `onValueChange` receives an optional second argument { reason: calendar | preset | time, presetId? }. DatePickerExpiryPresets shows In 7 days, In 30 days, End of quarter and No expiry; DatePickerPresetsTimeLimits shows presets with `withTime` keeping the time and the popup open, and a preset disabled by `max`. DatePickerUtc demonstrates UTC, seconds, hidden zone labels and a provider-inherited date-only zone; DateRangePicker is unchanged. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. The internal calendar selectors and time field in the popup stay outlined, including inside a ghost or filled provider. Size auto follows density (36px comfortable, 32px compact); explicit sm/md stay fixed. Size lg stays 44px with 14.5px text in either density. See Input FieldSizes for a live comparison. Large field icons and steppers are 17px; popup metrics are unchanged.',
  primitive: '@base-ui/react/popover + Calendar (+ TimePicker with `withTime`)',
  pattern: 'combobox with a dialog popup (date picker dialog)',
  keyboard: [
    ['Delete / Backspace', 'With clearable on a non-empty editable trigger: clears and keeps focus'],
    ['Enter / Space', 'On the field: opens the calendar with focus on the selected day (or today)'],
    ['Arrow keys / PageUp / PageDown / Home / End', 'Move through the calendar (see Calendar)'],
    ['Enter', 'In the calendar: picks the day (range: start, then end) and closes (`withTime`: stays open)'],
    [
      'Tab / Shift+Tab',
      'With `presets`: the preset buttons come before the calendar; Shift+Tab from the calendar reaches them',
    ],
    ['Enter / Space', 'On a preset: applies it (disabled presets do nothing)'],
    ['Escape', 'Closes the popup and returns focus to the field'],
    ['Tab', '`withTime`: from the calendar to the time segments and Done (see TimePicker for their keys)'],
  ],
  dataAttributes: [
    ['data-popup-open', 'input', 'The associated popup is open.'],
    ['data-invalid', 'input', 'The control value is invalid.'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'popover',
    'primary',
    'primary-text',
    'secondary',
    'destructive',
    'focus-ring',
  ],
};
