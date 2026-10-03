import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TransferList',
  group: 'Forms',
  status: 'beta',
  description:
    'Two lists, available and selected, for picking and ordering a subset (columns, scopes, members): search each side, check several items, move them with the middle buttons, Enter or a double click, and reorder the selected side. Moves are announced.',
  pattern: 'two multi-select listboxes (aria-activedescendant) + action buttons',
  keyboard: [
    ['Tab', 'Moves between search fields, the two lists and the action buttons'],
    ['ArrowDown / ArrowUp, Home / End', 'Moves the active option in the focused list'],
    ['Space', 'Checks or unchecks the active option'],
    ['Shift+ArrowDown / Shift+ArrowUp', 'Moves and checks, extending the selection'],
    ['Ctrl/Cmd+A', 'Checks (or unchecks) every visible option'],
    ['Enter', 'Moves the checked options (or the active one) to the other list'],
    ['Alt+ArrowUp / Alt+ArrowDown', 'Selected list: moves the checked options (or the active one) up / down'],
  ],
  tokens: ['card', 'border', 'background', 'foreground', 'muted-foreground', 'primary', 'primary-foreground', 'secondary', 'focus-ring'],
};
