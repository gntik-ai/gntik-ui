import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Select',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick one value from a short list in a popup, with SimpleSelect ref and triggerRef aliases for its trigger button. Compound parts (Select, SelectLabel, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator) plus a one-line SimpleSelect. Three trigger sizes; rich rows (avatar, status dot) via item children. SimpleSelect can load its options on first open (`loadOptions(query, { signal })`) with announced loading, empty and error states. Creatable lives in Combobox / MultiSelect (a select has no text input). SimpleSelect `clearable` adds a sibling reset button; Delete or Backspace on its trigger clears to null and retains focus. `onClear` runs after the value change; `clearLabel` overrides the localized name. For long lists, use Combobox with virtualized and a flat items array (see ComboboxVirtualized); Select requires its options to stay mounted for typeahead.',
  primitive: '@base-ui/react/select',
  pattern: 'select-only combobox + listbox',
  keyboard: [
    ['Delete / Backspace', 'With clearable on a non-empty editable trigger: clears and keeps focus'],
    ['Enter / Space / ArrowDown', 'On the trigger: opens the popup'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between options'],
    ['Enter', 'Selects the highlighted option and closes the popup'],
    ['Escape', 'Closes the popup and returns focus to the trigger'],
    ['Type a character', 'Typeahead: highlights the next option starting with it'],
    ['Escape, then Enter / ArrowDown', 'After a failed async load: closing and reopening the popup retries'],
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
    'ring',
    'focus-ring',
  ],
};
