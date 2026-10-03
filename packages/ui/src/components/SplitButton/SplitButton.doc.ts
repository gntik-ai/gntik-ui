import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SplitButton',
  group: 'Actions',
  status: 'beta',
  description:
    'A primary action joined to a menu of secondary actions. Two real buttons in a role="group": the action, and a chevron menu button (aria-haspopup="menu", aria-expanded) that opens the kit Menu. Takes Button\'s variants and sizes (`auto` follows the density), `actions` for a simple list or `menu` for custom MenuItems.',
  primitive: '@base-ui/react/menu',
  pattern: 'button + menu button',
  keyboard: [
    ['Tab', 'Moves from the primary action to the menu button'],
    ['Enter / Space', 'On the action: runs it. On the menu button: opens the menu with the first item highlighted'],
    ['ArrowDown', 'On the menu button: opens the menu'],
    ['ArrowDown / ArrowUp', 'Moves between menu items (wraps)'],
    ['Enter', 'In the menu: runs the highlighted action and closes the menu'],
    ['Escape', 'Closes the menu and returns focus to the menu button'],
  ],
  tokens: ['primary', 'primary-foreground', 'card', 'border', 'secondary', 'destructive', 'destructive-foreground', 'popover', 'focus-ring'],
};
