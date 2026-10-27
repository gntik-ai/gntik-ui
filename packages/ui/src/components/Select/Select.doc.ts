import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Select',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick one value from a short list in a popup, with SimpleSelect ref and triggerRef aliases for its trigger button. Compound parts (Select, SelectLabel, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator) plus a one-line SimpleSelect. Three trigger sizes; rich rows (avatar, status dot) via item children. SimpleSelect can load its options on first open (`loadOptions(query, { signal })`) with announced loading, empty and error states. Creatable lives in Combobox / MultiSelect (a select has no text input). SimpleSelect `clearable` adds a sibling reset button; Delete or Backspace on its trigger clears to null and retains focus. `onClear` runs after the value change; `clearLabel` overrides the localized name. For long lists, use Combobox with virtualized and a flat items array (see ComboboxVirtualized); Select requires its options to stay mounted for typeahead. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries.',
  primitive: '@base-ui/react/select',
  pattern: 'select-only combobox + listbox',
  anatomy:
    '<Select>\n  <SelectLabel>Region</SelectLabel>\n  <SelectTrigger placeholder="Choose a region" />\n  <SelectContent><SelectItem value="region">Region</SelectItem></SelectContent>\n</Select>',
  dataAttributes: [
    ['data-popup-open', 'trigger', 'The associated popup is open.'],
    ['data-disabled', 'trigger', 'The part is disabled and cannot be activated.'],
    ['data-placeholder', 'value', 'No value is selected; placeholder text is shown.'],
    ['data-popup-open', 'icon', 'The associated popup is open.'],
    ['data-starting-style', 'popup', 'The part is entering; transition styles apply.'],
    ['data-ending-style', 'popup', 'The part is leaving; transition styles apply.'],
    ['data-highlighted', 'item', 'The option is highlighted by pointer or keyboard navigation.'],
    ['data-selected', 'item', 'The option is selected.'],
    ['data-disabled', 'item', 'The part is disabled and cannot be activated.'],
    ['data-invalid', 'trigger', 'The field has a validation error.'],
  ],
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
