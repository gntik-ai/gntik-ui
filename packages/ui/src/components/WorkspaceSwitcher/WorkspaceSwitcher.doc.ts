import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'WorkspaceSwitcher',
  group: 'Navigation',
  status: 'beta',
  description:
    'Two-line workspace picker (logo, name, plan/role meta) for the topbar or sidebar header. Short lists open a menu with the current workspace checked; long lists (or `searchable`) open a combobox with a search field. An optional "Create workspace" action closes the list.',
  primitive: '@base-ui/react/menu · @base-ui/react/combobox',
  pattern: 'menu button (short lists) / select-only combobox with search (long lists)',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the list'],
    ['ArrowDown / ArrowUp', 'Moves between workspaces and the create action'],
    ['Typing (searchable)', 'Filters workspaces by name or meta'],
    ['Enter', 'Switches to the highlighted workspace (or runs Create workspace) and closes'],
    ['Escape', 'Closes the list and returns focus to the trigger'],
  ],
  dataAttributes: [
    ['data-popup-open', 'trigger', 'The associated popup is open.'],
    ['data-highlighted', 'searchItem', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-selected', 'searchItem', 'The item is selected.'],
    ['data-disabled', 'searchItem', 'The control cannot be changed or activated.'],
  ],
  tokens: [
    'card',
    'border',
    'secondary',
    'popover',
    'primary',
    'primary-foreground',
    'primary-text',
    'accent',
    'accent-foreground',
    'muted-foreground',
    'focus-ring',
  ],
};
