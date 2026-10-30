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
  anatomy: `<ContextMenu>
  <ContextMenuTrigger>Context target</ContextMenuTrigger>
  <ContextMenuContent><MenuItem>Action</MenuItem></ContextMenuContent>
</ContextMenu>`,
  dataAttributes: [
    ['data-popup-open', 'trigger', 'The associated popup is open.'],
    ['data-starting-style', 'positioner', 'The part is entering.'],
    ['data-ending-style', 'positioner', 'The part is leaving.'],
    ['data-instant', 'positioner', 'The state changes without a transition.'],
    ['data-checked', 'positioner', 'The control is checked.'],
    ['data-popup-open', 'positioner', 'The associated popup is open.'],
    ['data-highlighted', 'positioner', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-disabled', 'positioner', 'The control cannot be changed or activated.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-instant', 'popup', 'The state changes without a transition.'],
    ['data-checked', 'popup', 'The control is checked.'],
    ['data-popup-open', 'popup', 'The associated popup is open.'],
    ['data-highlighted', 'popup', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-disabled', 'popup', 'The control cannot be changed or activated.'],
  ],
  tokens: [
    'popover',
    'popover-foreground',
    'border',
    'secondary',
    'muted-foreground',
    'destructive',
    'destructive-text',
    'focus-ring',
  ],
};
