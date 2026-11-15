import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DatePicker',
  group: 'Forms',
  status: 'beta',
  description:
    "Opt-in editable on DatePicker and DateRangePicker composes DateField segments with a separate Choose date button. DatePickerEditable and DateRangePickerEditable demonstrate typing, ISO or locale-numeric paste, inherited invalid/disabled state, and date-time entry with seconds in UTC. Segment order follows the locale. Alt+ArrowDown opens on the typed date; a calendar pick closes the popup even withTime and restores Choose date focus. Numeric segments commit when filled or on leaving; 12-hour entry waits for an explicit AM/PM, while paste supplies the parsed or default period. Typed dates outside bounds or isDateDisabled are emitted and marked invalid. Range start/end groups are named Start date and End date; incomplete or reversed ranges are drafts, and only a fully cleared range emits null endpoints. Complete pairs rejected by bounds, range limits or isDateDisabled still emit with invalid styling; end validation receives the typed rangeStart. Controlled rejections restore the controlled value without replacing focused segments. defaultMonth applies until typing or a pick; typed months call onMonthChange. With editable unset, the read-only trigger DOM is unchanged. Date field with a focusable trigger ref: a read-only input with the Intl-formatted date that opens a Popover with a Calendar. DateRangePicker (alias DateRangeInput) adds presets — Today, Last 7 days, Last 30 days, This month, Last month, Custom — beside a two-month range calendar. DateRangePickerRetention demonstrates maxRange={90}, minRange={3} and onCalendarChange for partial picks. Limits count inclusive calendar days, apply on both sides only while an end is pending, reset on reopening and disable presets outside the limits. Invalid limits (non-positive or non-integer) are ignored; minRange > maxRange leaves no selectable end. onCalendarChange reports every calendar pick, including { start, end: null }; onValueChange still applies only complete ranges. A polite live region announces the maximum once per start pick, in English or Spanish; minRange alone adds no announcement. isDateDisabled(date, { rangeStart }) receives the pending start in range mode and null otherwise, including DatePicker presets; one-argument predicates still work. Min/max, disabled dates, locale, sizes, invalid state; works inside Field. `withTime` adds a TimePicker under the calendar (date + time value, 12/24h, minute step), closed with Done. With editable unset, DatePicker and DateRangePicker accept ref on their input; calling focus leaves the popup closed. Editable mode has no input ref or field-level clear button: Backspace/Delete clears a segment, and the popup Clear action clears the value. Both pickers support `clearable`, `onClear` and `clearLabel`: reset from the field button, Delete/Backspace, or the popup Clear action. Clearing closes the popup and restores field focus. `readOnly` prevents edits. DatePicker accepts `timeZone` (IANA, UTC or system), defaulting to I18nProvider then the browser; invalid names fall back to the browser. Calendar days, today, min/max, time segments and edits use that wall clock while values stay Date instants. isDateDisabled receives a local-midnight proxy of the zoned calendar day. DST gaps move forward and overlaps choose the earlier occurrence. Non-system zones appear in field text and time labels unless `hideTimeZone` is true. With time, hidden values include the wall time and UTC offset (and seconds with `withSeconds`); date-only values submit YYYY-MM-DD and emit zoned midnight. Custom formatOptions retain their format but use the effective zone. DatePicker `presets` adds app-defined quick dates ({ id, label, date(today) }) in a Quick dates group before the calendar, wrapping into a row on narrow screens: activating one sets the day (with `withTime` it keeps the time, or 00:00 when empty, and the popup stays open), otherwise closes the popup and returns focus to the field; a preset returning null clears the value. Presets before `min`, after `max` or rejected by `isDateDisabled` are disabled; the preset on the value day (or the null preset when empty) has aria-pressed. Today for presets is the `today` prop or the current day in the effective zone. `onValueChange` receives an optional second argument { reason: calendar | preset | time, presetId? }. DatePickerExpiryPresets shows In 7 days, In 30 days, End of quarter and No expiry; DatePickerPresetsTimeLimits shows presets with `withTime` keeping the time and the popup open, and a preset disabled by `max`. DatePickerUtc demonstrates UTC, seconds, hidden zone labels and a provider-inherited date-only zone; DateRangePicker is unchanged. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. The internal calendar selectors and time field in the popup stay outlined, including inside a ghost or filled provider. Size auto follows density (36px comfortable, 32px compact); explicit sm/md stay fixed. Size lg stays 44px with 14.5px text in either density. See Input FieldSizes for a live comparison. Large field icons and steppers are 17px; popup metrics are unchanged. DatePicker and DateRangePicker forward the Calendar props getDayMarkers, highlightedDates, highlightedLabel, loading, renderDay and onMonthChange to the popup calendar, so a picker can show per-day markers and load the month the user pages to (see Calendar CalendarMarkers); with a non-system timeZone the dates they receive are calendar (proxy) days at local midnight. DatePicker also forwards the Calendar props `month` and `defaultMonth` in the day granularity (DatePickerVisibleMonth shows a controlled month with onMonthChange and a defaultMonth). `granularity` (day by default, week, month, quarter or year) on DatePicker and DateRangePicker opens the shared period grid instead of the day calendar, so a whole period is one value: DatePicker emits the period's first day at local midnight, and DateRangePicker emits the first day of the earlier period to the last day of the later one, in either click order, after a two-step pick with a whole-period hover preview. Weeks start on `weekStartsOn` (or the locale's first day when unset), so the same click yields another value in another locale. Field text is Intl-formatted (`Mar 2026`, `2026`, `Mar 2 – 8, 2026`, `Jan – Jun 2026`) with the catalog quarter label (`Q2 2026`, es `T2 2026`; quarter ranges join two labels with an en dash); `formatOptions` overrides it. `min` and `max` disable periods that end before or start after them; `isDateDisabled`, `withTime`, `maxRange`, `minRange` and `numberOfMonths` apply to day only. Hidden inputs keep `YYYY-MM-DD`: the period start, or `<name>-start` and `<name>-end` as the first and last day. The day presets of DateRangePicker are hidden for other granularities unless `presets` is passed (their ranges widen to whole periods). DatePicker presets in a period granularity snap to the period start and are disabled by `min` and `max` on the whole period, not by `isDateDisabled`. DatePickerMonth shows month, week and year pickers and DateRangePickerQuarters a quarter range.",
  primitive: '@base-ui/react/popover + Calendar (+ TimePicker with `withTime`)',
  pattern: 'combobox with a dialog popup (date picker dialog)',
  keyboard: [
    ['0–9 / Paste', 'With editable: types or pastes a locale-ordered date; full segments advance'],
    ['A / P', 'With editable and 12-hour time: explicitly selects AM / PM before emitting'],
    ['Alt+ArrowDown', 'With editable: flushes the segment and opens the calendar on that date'],
    ['ArrowUp / ArrowDown / Home / End', 'With editable: changes the focused segment within its bounds'],
    ['ArrowLeft / ArrowRight', 'With editable: moves between segments'],
    ['Backspace / Delete', 'With editable: clears a segment; incomplete ranges do not emit'],
    ['Enter / Space', 'On Choose date: opens the calendar; a pick closes and returns focus to Choose date'],
    ['Delete / Backspace', 'With clearable on a non-empty read-only trigger: clears and keeps focus'],
    ['Enter / Space', 'On the field: opens the calendar with focus on the selected day (or today)'],
    ['Arrow keys / PageUp / PageDown / Home / End', 'Move through the calendar (see Calendar)'],
    ['Enter', 'In the calendar: picks the day (range: start, then end) and closes (`withTime`: stays open)'],
    [
      'Tab / Shift+Tab',
      'With `presets`: the preset buttons come before the calendar; Shift+Tab from the calendar reaches them',
    ],
    ['Enter / Space', 'On a preset: applies it (disabled presets do nothing)'],
    [
      'Arrow keys / PageUp / PageDown / Home / End',
      'With `granularity` other than day: move through the period grid (see PeriodPicker)',
    ],
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
