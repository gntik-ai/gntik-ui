import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'NumberInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Numeric input with − / + steppers, a unit suffix, min/max/step clamping, locale formatting and an optional scrub label (drag to change). Sizes sm and md like Input; invalid, disabled and read-only states; works inside Field.',
  primitive: '@base-ui/react/number-field',
  pattern: 'spinbutton-like textbox (number field)',
  keyboard: [
    ['ArrowUp / ArrowDown', 'Increments / decrements by step (Shift: largeStep, Alt: smallStep)'],
    ['PageUp / PageDown', 'Increments / decrements by largeStep'],
    ['Home / End', 'Sets the value to min / max (when defined)'],
    ['Click on label', 'Inside a Field, focuses the input'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'destructive', 'secondary', 'focus-ring'],
};
