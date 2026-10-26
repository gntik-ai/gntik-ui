import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Button',
  group: 'Actions',
  status: 'stable',
  description:
    'Triggers an action. Five variants (primary, secondary, soft, ghost, destructive), three sizes, icons and a loading state. IconButton is the square, icon-only form. Requires the matching tokens minor for cursor utilities: set --cursor-interactive: default on :root to use the arrow. Disabled and loading buttons keep the disabled cursor, receive pointer events, ignore activation and suppress hover styles.',
  primitive: '@base-ui/react/button',
  pattern: 'button',
  keyboard: [
    ['Enter', 'Activates the button'],
    ['Space', 'Activates the button'],
    [
      'Tab',
      'Moves focus; a loading button stays focusable. Use focus-ring, or focus-ring-inset for flush or clipped rows. These keyboard-only utilities require the tokens minor release that introduces them.',
    ],
  ],
  tokens: [
    'primary',
    'primary-foreground',
    'card',
    'border',
    'secondary',
    'destructive',
    'primary-text',
    'focus-ring',
    'cursor-interactive',
    'cursor-disabled',
  ],
};
