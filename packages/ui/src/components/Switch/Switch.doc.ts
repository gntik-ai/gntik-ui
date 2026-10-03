import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Switch',
  group: 'Forms',
  status: 'stable',
  description: 'On/off setting that applies immediately. Three sizes, optional inline label, works inside Field and Form.',
  primitive: '@base-ui/react/switch',
  pattern: 'switch',
  keyboard: [
    ['Space', 'Toggles the switch'],
    ['Enter', 'Toggles the switch'],
    ['Tab', 'Moves focus to and from the switch'],
  ],
  tokens: ['primary', 'secondary', 'background', 'focus-ring'],
};
