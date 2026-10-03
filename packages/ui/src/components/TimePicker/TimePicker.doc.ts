import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TimePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Accessible time field: hour and minute spinbutton segments, optional seconds, a 12-hour clock with AM/PM by locale or prop, minute step, min/max validation, controlled or uncontrolled (`"HH:mm"` strings). Digits type and auto-advance; arrows spin. Works inside Field; DatePicker `withTime` and DateTimeRangePicker reuse it.',
  primitive: '@base-ui/react/field (control) + spinbutton segments',
  pattern: 'group of spinbuttons (time field)',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves between segments, then out of the field'],
    ['ArrowUp / ArrowDown', 'Increments / decrements the focused segment (minutes by `step`), wrapping around'],
    ['Home / End', 'Sets the segment to its minimum / maximum'],
    ['0–9', 'Types into the segment; moves to the next one when it is full'],
    ['A / P', 'On the AM/PM segment: picks AM or PM'],
    ['ArrowLeft / ArrowRight', 'Moves to the previous / next segment'],
    ['Backspace / Delete', 'Clears the segment (the value becomes null)'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'primary-chip-text', 'secondary', 'destructive', 'focus-ring'],
};
