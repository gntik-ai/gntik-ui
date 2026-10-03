import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'MultiSelect',
  group: 'Forms',
  status: 'beta',
  description:
    'Searchable multi-select: selected options as removable chips (extra ones collapse into "+N"), a "Select all" row, a clear button and rows with descriptions. Built on Base UI Combobox (multiple) with the Combobox house styles; works inside Field.',
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox (multi-select listbox)',
  keyboard: [
    ['Type a character', 'Opens the popup and filters the options'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between options'],
    ['Enter', 'Toggles the highlighted option (on "Select all": selects or clears every option)'],
    ['Escape', 'Closes the popup, keeping focus in the input'],
    ['Backspace', 'On an empty input, removes the last chip'],
  ],
  tokens: ['background', 'border', 'popover', 'popover-foreground', 'primary', 'primary-text', 'secondary', 'muted-foreground', 'destructive', 'focus-ring'],
};
