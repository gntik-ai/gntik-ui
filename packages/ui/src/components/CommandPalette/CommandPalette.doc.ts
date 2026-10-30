import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'CommandPalette',
  group: 'Overlays',
  status: 'beta',
  description:
    '⌘K / Ctrl+K command palette: a modal dialog with a search input over grouped commands (icon, label, description, shortcut keys). Commands are data with an onSelect. Fuzzy-ish ranking (prefix, word start, substring, subsequence; keywords and descriptions count), recent items while the query is empty, an empty state and footer hints. useCommandPaletteShortcut() exposes the shortcut on its own.',
  primitive: '@base-ui/react/dialog + @base-ui/react/autocomplete (inline)',
  pattern: 'modal dialog with a combobox and listbox',
  keyboard: [
    ['⌘K / Ctrl+K', 'Opens the palette (and closes it when open)'],
    ['Typing', 'Filters and ranks the commands'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between commands across groups'],
    ['Enter', 'Runs the highlighted command and closes the palette'],
    ['Escape', 'Closes the palette and returns focus'],
  ],
  dataAttributes: [
    ['data-starting-style', 'backdrop', 'The part is entering.'],
    ['data-ending-style', 'backdrop', 'The part is leaving.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-highlighted', 'item', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-disabled', 'item', 'The control cannot be changed or activated.'],
    ['data-highlighted', 'itemIcon', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-highlighted', 'itemArrow', 'The item is highlighted for keyboard or pointer navigation.'],
  ],
  tokens: [
    'popover',
    'popover-foreground',
    'background',
    'border',
    'accent',
    'accent-foreground',
    'primary-text',
    'muted-foreground',
    'card',
    'ring',
    'focus-ring',
  ],
};
