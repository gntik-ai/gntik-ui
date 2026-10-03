import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Select',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick one value from a short list in a popup. Compound parts (Select, SelectLabel, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator) plus a one-line SimpleSelect. Three trigger sizes; rich rows (avatar, status dot) via item children. SimpleSelect can load its options on first open (`loadOptions(query, { signal })`) with announced loading, empty and error states. Creatable lives in Combobox / MultiSelect (a select has no text input).',
  primitive: '@base-ui/react/select',
  pattern: 'select-only combobox + listbox',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the popup'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between options'],
    ['Enter', 'Selects the highlighted option and closes the popup'],
    ['Escape', 'Closes the popup and returns focus to the trigger'],
    ['Type a character', 'Typeahead: highlights the next option starting with it'],
    ['Escape, then Enter / ArrowDown', 'After a failed async load: closing and reopening the popup retries'],
  ],
  tokens: ['background', 'border', 'popover', 'popover-foreground', 'primary', 'primary-text', 'secondary', 'muted-foreground', 'ring', 'focus-ring'],
};
