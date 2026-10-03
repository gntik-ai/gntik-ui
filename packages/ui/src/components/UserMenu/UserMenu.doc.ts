import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'UserMenu',
  group: 'Navigation',
  status: 'beta',
  description:
    'Account menu for the topbar: avatar trigger (optionally with the name) opening a name/email header, data-driven items (buttons or router links), a Theme submenu bound to useTheme(), and a destructive Sign out.',
  primitive: '@base-ui/react/menu',
  pattern: 'menu button',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the avatar: opens the menu and focuses the first item'],
    ['ArrowDown / ArrowUp', 'Moves between items (wraps)'],
    ['ArrowRight / ArrowLeft', 'Opens / closes the Theme submenu'],
    ['Enter', 'Runs the highlighted item (or selects a theme) and closes the menu'],
    ['Escape', 'Closes the menu and returns focus to the avatar'],
  ],
  tokens: ['popover', 'border', 'primary', 'primary-foreground', 'accent', 'accent-foreground', 'secondary', 'muted-foreground', 'destructive-text', 'focus-ring'],
};
