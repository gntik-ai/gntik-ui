import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Menu',
  group: 'Overlays',
  status: 'stable',
  description: 'Dropdown list of actions or options: items with icon, shortcut hint and destructive tone, checkbox and radio items, labelled groups, separators and submenus. MoreMenu is the row-actions shorthand (icon button + items array).',
  primitive: '@base-ui/react/menu',
  pattern: 'menu button',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the menu and focuses the first item'],
    ['ArrowDown / ArrowUp', 'Moves between items (wraps)'],
    ['Enter', 'Activates the highlighted item'],
    ['ArrowRight', 'Opens the submenu of a submenu trigger; ArrowLeft closes it'],
    ['Escape', 'Closes the menu and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'secondary', 'muted-foreground', 'destructive', 'destructive-text', 'primary', 'primary-text', 'focus-ring'],
};
