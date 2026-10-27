import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Menu',
  group: 'Overlays',
  status: 'stable',
  description:
    'Dropdown list of actions or options: items with icon, shortcut hint and destructive tone, checkbox and radio items, labelled groups, separators and submenus. MoreMenu is the row-actions shorthand (icon button + items array).',
  primitive: '@base-ui/react/menu',
  pattern: 'menu button',
  anatomy:
    '<Menu>\n  <MenuTrigger>Actions</MenuTrigger>\n  <MenuContent><MenuItem>Action</MenuItem></MenuContent>\n</Menu>',
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering; transition styles apply.'],
    ['data-ending-style', 'popup', 'The part is leaving; transition styles apply.'],
    ['data-instant', 'popup', 'The popup transition is skipped.'],
    ['data-highlighted', 'item', 'The option is highlighted by pointer or keyboard navigation.'],
    ['data-checked', 'item', 'The checkable item is checked.'],
    ['data-disabled', 'item', 'The part is disabled and cannot be activated.'],
    ['data-checked', 'checkbox', 'The checkable item is checked.'],
    ['data-popup-open', 'subTrigger', 'The associated popup is open.'],
    ['data-highlighted', 'subTrigger', 'The option is highlighted by pointer or keyboard navigation.'],
    ['data-checked', 'subTrigger', 'The checkable item is checked.'],
    ['data-disabled', 'subTrigger', 'The part is disabled and cannot be activated.'],
  ],
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the menu and focuses the first item'],
    ['ArrowDown / ArrowUp', 'Moves between items (wraps)'],
    ['Enter', 'Activates the highlighted item'],
    ['ArrowRight', 'Opens the submenu of a submenu trigger; ArrowLeft closes it'],
    ['Escape', 'Closes the menu and returns focus to the trigger'],
  ],
  tokens: [
    'popover',
    'popover-foreground',
    'border',
    'secondary',
    'muted-foreground',
    'destructive',
    'destructive-text',
    'primary',
    'primary-text',
    'focus-ring',
  ],
};
