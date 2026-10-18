import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Combobox',
  group: 'Forms',
  status: 'stable',
  description:
    'Searchable select: typing filters the list. Single select (ComboboxInput) or multi-select with removable chips (ComboboxChipsInput), an announced empty state, and rich rows via ComboboxItem children. Async options (`loadOptions(query, { signal })`: debounced, stale requests aborted, announced loading and error states with a Retry row) and creatable (`onCreate(input)` adds a “Create …” row). Opt-in `virtualized` windows flat items arrays (including async, Create and Retry rows); grouped items and static children retain full rendering. ComboboxContent accepts itemHeight (fixed pixels), estimatedItemHeight (default 32) and overscan (default 4). Keyboard highlights stay mounted; filtering resets scroll and reopening reveals the selection. Find-in-page and screen-reader browse mode reach mounted rows only; keyboard navigation reaches all options.',
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox (list autocomplete) + listbox',
  keyboard: [
    ['Home / End, PageUp / PageDown', 'Virtualized: jumps to the first / last option or moves by a viewport'],
    ['Type a character', 'Opens the popup and filters the options'],
    ['ArrowDown / ArrowUp', 'Opens the popup and moves the highlight between options'],
    ['Enter', 'Selects the highlighted option (adds a chip in multi-select)'],
    ['Escape', 'Closes the popup, keeping focus in the input'],
    ['Backspace', 'Multi-select, empty input: removes the last chip'],
    [
      'Enter on “Create …” / “Retry”',
      'Creates an item from the typed text (onCreate) / loads the options again after an error',
    ],
  ],
  tokens: [
    'background',
    'border',
    'popover',
    'popover-foreground',
    'primary',
    'primary-text',
    'secondary',
    'muted-foreground',
    'focus-ring',
  ],
};
