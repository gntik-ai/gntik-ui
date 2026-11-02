import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'NumberInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Numeric input with − / + steppers, a unit suffix, min/max/step clamping, locale formatting and an optional scrub label (drag to change). Sizes auto, sm, md and lg like Input; invalid, disabled and read-only states; works inside Field. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Size auto follows density (36px comfortable, 32px compact); explicit sm/md stay fixed. Size lg stays 44px with 14.5px text in either density. See Input FieldSizes for a live comparison. Large field icons and steppers are 17px; popup metrics are unchanged.',
  primitive: '@base-ui/react/number-field',
  pattern: 'spinbutton-like textbox (number field)',
  keyboard: [
    ['ArrowUp / ArrowDown', 'Increments / decrements by step (Shift: largeStep, Alt: smallStep)'],
    ['PageUp / PageDown', 'Increments / decrements by largeStep'],
    ['Home / End', 'Sets the value to min / max (when defined)'],
    ['Click on label', 'Inside a Field, focuses the input'],
  ],
  dataAttributes: [
    ['data-invalid', 'group', 'The control value is invalid.'],
    ['data-disabled', 'group', 'The control cannot be changed or activated.'],
    ['data-readonly', 'group', 'The value can be read but cannot be changed.'],
    ['data-invalid', 'input', 'The control value is invalid.'],
    ['data-disabled', 'input', 'The control cannot be changed or activated.'],
    ['data-readonly', 'input', 'The value can be read but cannot be changed.'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'destructive',
    'secondary',
    'focus-ring',
  ],
};
