import type { ComponentDoc } from '../../doc';

/** Which-picker table, also shown in the field example. */
export const whichPicker = [
  ['Select', 'Short lists without search'],
  ['Combobox', 'Typed input with autocomplete'],
  ['MultiSelect', 'Selected values as chips in a field'],
  ['SearchableSelect', 'Field, button or toolbar trigger with popup search'],
] as const;

export const doc: ComponentDoc = {
  name: 'SearchableSelect',
  group: 'Forms',
  status: 'stable',
  description:
    'A button-triggered picker with search inside the popup. Options have value, label, description, icon, keywords and disabled; groups have label and options. getOptionKey defaults to String(value); supply a stable key for object values. Single value/defaultValue/onValueChange use Value | null; multiple uses Value[]. name, required, disabled and readOnly use the Combobox form contract; an empty selection submits nothing. label names the field and list; without it supply aria-label. The default trigger shows the selected icon and label or a localized count. trigger renders a kit Button through the Base UI render prop. size is auto (density), sm, md or lg. placeholder, searchPlaceholder and emptyText override catalog defaults. Search matches labels, descriptions and keywords without case or accent differences; filter replaces matching and onSearchChange reports queries. actions always follow options and run onSelect without entering selection or form values. Opt-in virtualized windows flat lists using the existing Combobox root; itemHeight and overscan configure the window. Groups retain full rendering. Mounted options expose aria-posinset/aria-setsize and the keyboard highlight stays rendered and scrolled into view. Browser find and screen-reader browse mode reach mounted options only. See the field example for the which-picker table: Select for short lists; Combobox for typed input; MultiSelect for chips in a field; SearchableSelect for field, button or toolbar triggers with popup search. The examples cover field and toolbar triggers, grouped regions, 5,000 options, and action rows. Built-in strings follow I18nProvider (en/es).',
  primitive: '@base-ui/react/combobox',
  pattern: 'button-triggered combobox + popup search + listbox',
  keyboard: [
    ['Enter / Space / ArrowDown on trigger', 'Opens the popup and focuses its search input'],
    ['Type a character', 'Filters the options, hides empty groups and highlights the first match'],
    ['ArrowDown / ArrowUp', 'Moves the highlight while focus stays in the search input'],
    ['Enter', 'Single: selects and closes; multiple: toggles and keeps the query and popup'],
    ['Escape', 'Closes without changing the value and returns focus to the trigger'],
    ['Enter on an action', 'Runs its callback once, closes and returns focus without changing the value'],
    ['Home / End / PageUp / PageDown', 'Virtualized: moves to the first/last option or by one viewport'],
  ],
  tokens: [
    'background',
    'foreground',
    'border',
    'popover',
    'popover-foreground',
    'primary-text',
    'secondary',
    'muted-foreground',
    'focus-ring',
  ],
};
