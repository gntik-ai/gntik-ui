import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Select',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick one value from a popup list using compound parts or SimpleSelect. SimpleSelect exposes ref and triggerRef aliases for its trigger button. Compound parts (Select, SelectLabel, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator) plus a one-line SimpleSelect. Three trigger sizes; rich rows (avatar, status dot) via item children. SimpleSelect can load its options on first open (`loadOptions(query, { signal })`) with announced loading, empty and error states. Creatable lives in Combobox / MultiSelect (a select has no text input). SimpleSelect `clearable` adds a sibling reset button; Delete or Backspace on its trigger clears to null and retains focus. `onClear` runs after the value change; `clearLabel` overrides the localized name. For long lists, use Combobox with virtualized and a flat items array (see ComboboxVirtualized); Select requires its options to stay mounted for typeahead. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries.',
  primitive: '@base-ui/react/select',
  anatomy: `<Select>
  <SelectLabel>Label</SelectLabel>
  <SelectTrigger />
  <SelectContent>
    <SelectGroup>
      <SelectGroupLabel>Group</SelectGroupLabel>
      <SelectItem value="option">Option</SelectItem>
    </SelectGroup>
    <SelectSeparator />
  </SelectContent>
</Select>`,
  dataAttributes: [
    ['data-popup-open', 'trigger', 'The options popup is open.'],
    ['data-popup-open', 'icon', 'The trigger popup is open.'],
    ['data-disabled', 'trigger', 'The control cannot be changed.'],
    ['data-disabled', 'item', 'The option cannot be selected.'],
    ['data-highlighted', 'item', 'The option is highlighted for keyboard or pointer navigation.'],
    ['data-selected', 'item', 'The option is selected.'],
    ['data-placeholder', 'value', 'No value has been selected.'],
    ['data-starting-style', 'popup', 'The popup is entering.'],
    ['data-ending-style', 'popup', 'The popup is leaving.'],
    ['data-invalid', 'trigger', 'The control value is invalid.'],
  ],
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
