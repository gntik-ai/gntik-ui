import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Switch',
  group: 'Forms',
  status: 'stable',
  description:
    'On/off setting that applies immediately. Three sizes, optional inline label, works inside Field and Form. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name).',
  primitive: '@base-ui/react/switch',
  pattern: 'switch',
  keyboard: [
    ['Space', 'Toggles the switch'],
    ['Enter', 'Toggles the switch'],
    ['Tab', 'Moves focus to and from the switch'],
  ],
  tokens: ['primary', 'secondary', 'background', 'focus-ring'],
};
