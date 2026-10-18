import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DatePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Date field with a focusable trigger ref: a read-only input with the Intl-formatted date that opens a Popover with a Calendar. DateRangePicker (alias DateRangeInput) adds presets — Today, Last 7 days, Last 30 days, This month, Last month, Custom — beside a two-month range calendar. Min/max, disabled dates, locale, sizes, invalid state; works inside Field. `withTime` adds a TimePicker under the calendar (date + time value, 12/24h, minute step), closed with Done. DatePicker and DateRangePicker accept ref on their input; calling focus leaves the popup closed. Both pickers support `clearable`, `onClear` and `clearLabel`: reset from the field button, Delete/Backspace, or the popup Clear action. Clearing closes the popup and restores field focus. `readOnly` prevents edits.',
  primitive: '@base-ui/react/popover + Calendar (+ TimePicker with `withTime`)',
  pattern: 'combobox with a dialog popup (date picker dialog)',
  keyboard: [
    ['Delete / Backspace', 'With clearable on a non-empty editable trigger: clears and keeps focus'],
    ['Enter / Space', 'On the field: opens the calendar with focus on the selected day (or today)'],
    ['Arrow keys / PageUp / PageDown / Home / End', 'Move through the calendar (see Calendar)'],
    ['Enter', 'In the calendar: picks the day (range: start, then end) and closes (`withTime`: stays open)'],
    ['Escape', 'Closes the popup and returns focus to the field'],
    ['Tab', '`withTime`: from the calendar to the time segments and Done (see TimePicker for their keys)'],
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
