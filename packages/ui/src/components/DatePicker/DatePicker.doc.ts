import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DatePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Date field: a read-only input with the Intl-formatted date that opens a Popover with a Calendar. DateRangePicker (alias DateRangeInput) adds presets — Today, Last 7 days, Last 30 days, This month, Last month, Custom — beside a two-month range calendar. Min/max, disabled dates, locale, sizes, invalid state; works inside Field.',
  primitive: '@base-ui/react/popover + Calendar',
  pattern: 'combobox with a dialog popup (date picker dialog)',
  keyboard: [
    ['Enter / Space', 'On the field: opens the calendar with focus on the selected day (or today)'],
    ['Arrow keys / PageUp / PageDown / Home / End', 'Move through the calendar (see Calendar)'],
    ['Enter', 'In the calendar: picks the day (range: start, then end) and closes'],
    ['Escape', 'Closes the popup and returns focus to the field'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'popover', 'primary', 'primary-text', 'secondary', 'destructive', 'focus-ring'],
};
