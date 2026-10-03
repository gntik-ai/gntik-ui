import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Button',
  group: 'Actions',
  status: 'stable',
  description: 'Triggers an action.',
  primitive: '@base-ui/react/button',
  pattern: 'button',
  keyboard: [
    ['Enter', 'Activates the button'],
    ['Space', 'Activates the button'],
    ['Tab', "Moves focus; a loading button stays focusable"],
  ],
};
