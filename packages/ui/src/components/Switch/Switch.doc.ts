import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Switch',
  group: 'Forms',
  status: 'stable',
  description:
    'On/off setting that applies immediately. Three sizes, optional inline label, works inside Field and Form. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name). The optional invalid prop exposes aria-invalid and a destructive 1px track ring, checked or unchecked. Invalid Field also supplies this state. Pair invalid with a FieldError or description explaining how to correct the value; colour alone is insufficient.',
  // Invalid state is demonstrated in SwitchValidation.
  primitive: '@base-ui/react/switch',
  pattern: 'switch',
  keyboard: [
    ['Space', 'Toggles the switch'],
    ['Enter', 'Toggles the switch'],
    ['Tab', 'Moves focus to and from the switch'],
  ],
  dataAttributes: [
    ['data-checked', 'root', 'The control is checked.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-checked', 'thumb', 'The control is checked.'],
    ['data-disabled', 'thumb', 'The control cannot be changed or activated.'],
  ],
  tokens: ['destructive', 'primary', 'secondary', 'background', 'focus-ring'],
};
