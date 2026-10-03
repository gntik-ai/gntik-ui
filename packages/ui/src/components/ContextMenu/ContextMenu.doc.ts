import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ContextMenu',
  group: 'Overlays',
  status: 'beta',
  description:
    'Menu that opens at the pointer on right click or long press, and from the keyboard with Shift+F10 or the ContextMenu key on the focused area. Uses the Menu item parts (icons, shortcuts, destructive tone, checkbox/radio items, groups, submenus).',
  primitive: '@base-ui/react/context-menu',
  pattern: 'menu',
  keyboard: [
    ['Shift+F10 / ContextMenu', 'On the focused area: opens the menu'],
    ['ArrowDown / ArrowUp', 'Moves between items (wraps)'],
    ['Enter', 'Activates the highlighted item and closes the menu'],
    ['ArrowRight', 'Opens the submenu of a submenu trigger; ArrowLeft closes it'],
    ['Escape', 'Closes the menu'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'secondary', 'muted-foreground', 'destructive', 'destructive-text', 'focus-ring'],
};
