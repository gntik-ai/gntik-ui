import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TimePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Accessible time field with a ref to its hours segment: hour and minute spinbutton segments, optional seconds, a 12-hour clock with AM/PM by locale or prop, minute step, min/max validation, controlled or uncontrolled (`"HH:mm"` strings). Digits type and auto-advance; arrows spin. Works inside Field; DatePicker `withTime` and DateTimeRangePicker reuse it. Opt-in `clearable` resets every segment to its placeholder and focuses hours. `onClear` runs after emitting null; `clearLabel` overrides the localized button name. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries.',
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
  dataAttributes: [
    ['data-invalid', 'root', 'The control value is invalid.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-placeholder', 'segment', 'No value has been entered or selected.'],
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
