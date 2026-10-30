import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Combobox',
  group: 'Forms',
  status: 'stable',
  description:
    "ComboboxTrigger offers a field-style button (size auto/sm/md/lg), or a custom element through render. ComboboxContent accepts optional header and footer slots; put ComboboxPopupInput in header to focus search on open. The popup input uses the localized search placeholder and shares virtualized keyboard navigation. Optional listClassName and emptyClassName customize presentation. With no slots the original input/list structure is preserved. See ComboboxPopupSearch for the trigger, header and footer together. Searchable select: typing filters the list. Single select (ComboboxInput) or multi-select with removable chips (ComboboxChipsInput), an announced empty state, and rich rows via ComboboxItem children. Async options (`loadOptions(query, { signal })`: debounced, stale requests aborted, announced loading and error states with a Retry row) and creatable (`onCreate(input)` adds a “Create …” row). Opt-in `virtualized` windows flat items arrays (including async, Create and Retry rows); grouped items and static children retain full rendering. ComboboxContent accepts itemHeight (fixed pixels), estimatedItemHeight (default 32) and overscan (default 4). Keyboard highlights stay mounted; filtering resets scroll and reopening reveals the selection. Find-in-page and screen-reader browse mode reach mounted rows only; keyboard navigation reaches all options. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Grouped `{ value, items }` collections use ComboboxGroup, ComboboxGroupLabel, ComboboxSeparator and ComboboxCollection. Pass each filtered group's items to ComboboxGroup; ComboboxCollection renders its options (renderless unless className supplies a container). Labels and separators share Select styles. useComboboxFilter exposes Base UI's locale-aware matching for custom filters. Filtering hides empty groups and labels; keyboard navigation crosses groups. Async results may be grouped, and Create/Retry rows stay outside groups. See ComboboxGrouped for grouped creatable and async previews.",
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox (list autocomplete) + listbox',
  keyboard: [
    ['Enter / Space / ArrowDown on ComboboxTrigger', 'Opens the popup and focuses ComboboxPopupInput in the header'],
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
  anatomy: `<Combobox>
  <ComboboxInput />
  <ComboboxContent>
    <ComboboxGroup>
      <ComboboxGroupLabel>Group</ComboboxGroupLabel>
      <ComboboxItem value="option">Option</ComboboxItem>
    </ComboboxGroup>
  </ComboboxContent>
</Combobox>`,
  dataAttributes: [
    ['data-disabled', 'inputGroup', 'The control cannot be changed or activated.'],
    ['data-invalid', 'inputGroup', 'The control value is invalid.'],
    ['data-popup-open', 'chevron', 'The associated popup is open.'],
    ['data-disabled', 'chipsGroup', 'The control cannot be changed or activated.'],
    ['data-invalid', 'chipsGroup', 'The control value is invalid.'],
    ['data-highlighted', 'chip', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-empty', 'list', 'There are no items to show.'],
    ['data-highlighted', 'item', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-selected', 'item', 'The item is selected.'],
    ['data-disabled', 'item', 'The control cannot be changed or activated.'],
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
