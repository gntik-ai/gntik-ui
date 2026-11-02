import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'MultiSelect',
  group: 'Forms',
  status: 'beta',
  description:
    'Searchable multi-select: selected options as removable chips (extra ones collapse into "+N"), a "Select all" row, a clear button and rows with descriptions. Built on Base UI Combobox (multiple) with the Combobox house styles; works inside Field. Optional async options (`loadOptions`, debounced and abortable, with loading/error states) and creatable rows (`onCreate`). Opt-in virtualized renders only visible rows, with itemHeight, estimatedItemHeight (default 32) and overscan (default 4). Select all applies to the full enabled data set. Keyboard highlights stay mounted; find-in-page and browse mode reach rendered rows only. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component. Read-only mode preserves the selection and prevents edits. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. MultiSelectOption.group adds headings in first-seen order after ungrouped options; filtering removes empty groups. ComboboxGroup, ComboboxGroupLabel and ComboboxCollection provide the shared grouped presentation. Select all selects or clears enabled options across every group. Grouped options retain full rendering even with virtualized. See MultiSelectGrouped for mixed groups, a disabled option and creation. Size auto (default) follows density: comfortable fields are at least 36px with 12px field padding and 22px chips; compact fields are at least 32px with 10px field padding and 20px chips. Vertical padding is half the control height minus chip height and both borders (6px comfortable, 5px compact). Wrapping grows the field. Explicit sm/md retain their existing metrics; lg stays at least 44px in either density with 28px chips and 14.5px field text. See Input FieldSizes for a live comparison of every field size and density. Large chip remove buttons are reachable with Tab, including wrapped chips.',
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox (multi-select listbox)',
  keyboard: [
    ['Home / End, PageUp / PageDown', 'Virtualized: jumps to the first / last option or moves by a viewport'],
    ['Type a character', 'Opens the popup and filters the options'],
    ['ArrowDown / ArrowUp', 'Moves the highlight between options'],
    ['Enter', 'Toggles the highlighted option (on "Select all": selects or clears every option)'],
    ['Escape', 'Closes the popup, keeping focus in the input'],
    ['Backspace', 'On an empty input, removes the last chip'],
    [
      'Enter on “Create …” / “Retry”',
      'Creates and selects an option from the typed text / loads the options again after an error',
    ],
  ],
  dataAttributes: [['data-invalid', 'group', 'The control value is invalid.']],
  tokens: [
    'background',
    'border',
    'popover',
    'popover-foreground',
    'primary',
    'primary-text',
    'secondary',
    'muted-foreground',
    'destructive',
    'focus-ring',
  ],
};
