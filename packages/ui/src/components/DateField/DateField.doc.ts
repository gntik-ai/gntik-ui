import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DateField',
  group: 'Forms',
  status: 'beta',
  description:
    'Typed local date and date-time entry in Intl locale order. DateField and DateRangeField expose named spinbuttons, calendar/min/max/disabled-date validation, ISO or numeric locale paste, and hidden form values. Granularity adds hours, minutes or seconds; a 12-hour clock adds AM/PM. Two-digit years remain literal (26 means year 26); empty segments use the TimePicker placeholder. forceLeadingZeros pads supplied values; typed segments are padded. Works inside Field. DatePicker triggers remain read-only.',
  primitive: '@base-ui/react/field (control) + spinbutton segments',
  pattern: 'group of spinbuttons (date field)',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves between segments, then out of the field; finishes a partially typed year'],
    ['0–9', 'Types digits and advances when full; years accept up to four digits'],
    [
      'ArrowUp / ArrowDown',
      'Increments / decrements and wraps within the segment; day bounds follow month and leap year',
    ],
    ['Home / End', 'Sets the focused segment to its minimum / maximum'],
    ['ArrowLeft / ArrowRight', 'Moves to the previous / next segment, including across a range'],
    ['Backspace / Delete', 'Clears the segment and submitted value'],
    ['A / P', 'On the AM/PM segment: selects AM / PM'],
    ['Paste', 'Fills from ISO date/date-time or locale-ordered numeric date; ignores other text'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'primary-chip-text',
    'secondary',
    'destructive',
    'focus-ring',
  ],
};
