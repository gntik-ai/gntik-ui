import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Autocomplete',
  group: 'Forms',
  status: 'stable',
  description:
    'A text field whose value is whatever the user types, with suggestions that fill the input when picked. Use Autocomplete when any text is valid and the list is only a hint; use Combobox when the value must be a listed item. Blur, Tab and Enter never replace or clear the typed text, and Enter with nothing highlighted submits the owning form (set `name` for the form value). `onItemSelect` receives the full item when a suggestion is picked. Suggestions are `items` (flat, or groups `{ label, items }`; groups with no match are hidden) filtered by the typed text, or `loadOptions(query, { signal })` for async suggestions: debounced (`debounceMs`, default 250), stale requests aborted, with an announced loading state, an error message and a Retry row that keeps the text and the popup. Async results are shown as returned. `limit` caps the rendered suggestions across groups and a status line reads how many more match. `mode="both"` selects the rest of the first matching suggestion as you type; Backspace removes it, and Tab or blur keep only what was typed. `clearable` adds a Clear button while the field is not empty. Inside Field the label, description and error are wired, and `invalid` and `disabled` follow the field. FieldVariantProvider supplies the chrome; `size` is auto, sm or md.',
  primitive: '@base-ui/react/autocomplete',
  pattern: 'combobox (list autocomplete)',
  keyboard: [
    ['Type a character', 'Opens the popup and filters the suggestions; the typed text stays the value'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between suggestions'],
    ['Enter on a highlighted option', 'Fills the input with the option, reports it with onItemSelect and closes'],
    ['Enter with nothing highlighted', 'Keeps the typed text and submits the owning form'],
    ['Escape', 'Closes the popup and keeps the text; with the popup closed it never clears the text'],
    ['Tab', 'Leaves the field with the typed text as the value'],
    ['Enter (mode both)', 'Accepts the inline completion and reports its item with onItemSelect'],
  ],
  anatomy: `<Autocomplete
  label="Region"
  items={['us-east-1', 'us-west-2']}
  onItemSelect={(item) => {}}
/>`,
  dataAttributes: [['data-invalid', 'invalidGroup', 'The control value is invalid.']],
  tokens: [
    'background',
    'border',
    'destructive',
    'popover',
    'popover-foreground',
    'secondary',
    'muted-foreground',
    'focus-ring',
  ],
};
