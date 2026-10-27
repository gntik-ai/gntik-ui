import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Combobox',
  group: 'Forms',
  status: 'stable',
  description:
    'Searchable select: typing filters the list. Single select (ComboboxInput) or multi-select with removable chips (ComboboxChipsInput), an announced empty state, and rich rows via ComboboxItem children. Async options (`loadOptions(query, { signal })`: debounced, stale requests aborted, announced loading and error states with a Retry row) and creatable (`onCreate(input)` adds a “Create …” row). Opt-in `virtualized` windows flat items arrays (including async, Create and Retry rows); grouped items and static children retain full rendering. ComboboxContent accepts itemHeight (fixed pixels), estimatedItemHeight (default 32) and overscan (default 4). Keyboard highlights stay mounted; filtering resets scroll and reopening reveals the selection. Find-in-page and screen-reader browse mode reach mounted rows only; keyboard navigation reaches all options. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries.',
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox (list autocomplete) + listbox',
  anatomy:
    '<Combobox items={options}>\n  <ComboboxInput placeholder="Search" />\n  <ComboboxContent><ComboboxItem value={options[0]}>Option</ComboboxItem></ComboboxContent>\n</Combobox>',
  dataAttributes: [
    ['data-popup-open', 'chevron', 'The associated popup is open.'],
    ['data-highlighted', 'chip', 'The option is highlighted by pointer or keyboard navigation.'],
    ['data-starting-style', 'popup', 'The part is entering; transition styles apply.'],
    ['data-ending-style', 'popup', 'The part is leaving; transition styles apply.'],
    ['data-empty', 'list', 'No matching options are available.'],
    ['data-highlighted', 'item', 'The option is highlighted by pointer or keyboard navigation.'],
    ['data-selected', 'item', 'The option is selected.'],
    ['data-disabled', 'item', 'The part is disabled and cannot be activated.'],
    ['data-invalid', 'inputGroup', 'The field has a validation error.'],
    ['data-invalid', 'chipsGroup', 'The field has a validation error.'],
  ],
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
