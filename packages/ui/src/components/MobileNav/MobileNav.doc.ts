import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'MobileNav',
  group: 'Navigation',
  status: 'beta',
  description:
    'Small-screen navigation: a menu icon button opens a Drawer sheet (chrome surface) with the NavList groups and an optional footer slot. Activating an item closes the sheet; focus is trapped while open and returns to the button.',
  primitive: '@base-ui/react/drawer',
  pattern: 'modal dialog containing a navigation landmark',
  keyboard: [
    ['Enter / Space', 'On the menu button: opens the sheet and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles through the sheet (focus is trapped)'],
    ['Enter', 'Follows the focused link and closes the sheet'],
    ['Escape', 'Closes the sheet and returns focus to the menu button'],
  ],
  tokens: ['chrome', 'popover', 'border', 'accent', 'accent-foreground', 'primary', 'muted-foreground', 'focus-ring'],
};
