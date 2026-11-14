import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DateField',
  group: 'Forms',
  status: 'beta',
  description:
    'Typed local date and date-time entry in Intl locale order. DateField and DateRangeField expose named spinbuttons, calendar/min/max/disabled-date validation, ISO or numeric locale paste, and hidden form values. Granularity adds hours, minutes or seconds; a 12-hour clock adds AM/PM. Two-digit years remain literal (26 means year 26); empty segments use the TimePicker placeholder. forceLeadingZeros pads supplied values; typed segments are padded. Works inside Field. DatePicker and DateRangePicker use these fields as their trigger with `editable`. `timeZone` (IANA) or `utc` reads and writes the wall clock of that zone without host-local Date math, and `utc` submits UTC wall times in the hidden inputs (DateFieldTime shows a UTC date-time). `isDateDisabled(date, { rangeStart })` gets the typed start as `rangeStart` for a range end. A 12-hour date-time is reported once its AM/PM is entered or pasted; an hour alone does not choose one. An invalid group also carries aria-invalid, including one inherited from a Field marked `invalid`.',
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
  dataAttributes: [
    ['data-invalid', 'root', 'The control value is invalid.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-placeholder', 'root', 'No value has been entered or selected.'],
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
