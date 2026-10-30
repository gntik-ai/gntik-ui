import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Menu',
  group: 'Overlays',
  status: 'stable',
  description:
    'Dropdown list of actions or options: items with icon, shortcut hint and destructive tone, checkbox and radio items, labelled groups, separators and submenus. MoreMenu is the row-actions shorthand (icon button + items array).',
  primitive: '@base-ui/react/menu',
  pattern: 'menu button',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the menu and focuses the first item'],
    ['ArrowDown / ArrowUp', 'Moves between items (wraps)'],
    ['Enter', 'Activates the highlighted item'],
    ['ArrowRight', 'Opens the submenu of a submenu trigger; ArrowLeft closes it'],
    ['Escape', 'Closes the menu and returns focus to the trigger'],
  ],
  anatomy: `<Menu>
  <MenuTrigger>Actions</MenuTrigger>
  <MenuContent>
    <MenuGroup>
      <MenuGroupLabel>Group</MenuGroupLabel>
      <MenuItem>Action</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuCheckboxItem>Setting</MenuCheckboxItem>
  </MenuContent>
</Menu>`,
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-instant', 'popup', 'The state changes without a transition.'],
    ['data-highlighted', 'item', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-checked', 'item', 'The control is checked.'],
    ['data-disabled', 'item', 'The control cannot be changed or activated.'],
    ['data-checked', 'checkbox', 'The control is checked.'],
    ['data-popup-open', 'subTrigger', 'The associated popup is open.'],
    ['data-highlighted', 'subTrigger', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-checked', 'subTrigger', 'The control is checked.'],
    ['data-disabled', 'subTrigger', 'The control cannot be changed or activated.'],
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
