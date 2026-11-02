import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TokenInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Free-entry chips for emails, labels or hosts: Enter, Tab or a separator commits, pasted lists are split, `validate` marks bad entries as invalid chips, `maxItems` caps the list. Additions and removals are announced; works inside Field. Read-only mode prevents text edits, committing entries and chip removal. Optional variant: outline (default), filled (secondary surface), or ghost (transparent chrome). FieldVariantProvider supplies the default; explicit props win. Ghost is for obvious editing contexts such as an edit-mode row or toolbar. Alternate variants retain focus, invalid and forced-colors boundaries. Size auto (default) follows density: comfortable fields are at least 36px with 12px field padding and 22px chips; compact fields are at least 32px with 10px field padding and 20px chips. Vertical padding is half the control height minus chip height and both borders (6px comfortable, 5px compact). Wrapping grows the field. Explicit sm/md retain their existing metrics; lg stays at least 44px in either density with 28px chips and 14.5px field text. See Input FieldSizes for a live comparison of every field size and density.',
  primitive: '@base-ui/react/field (Field.Control)',
  pattern: 'textbox + list of removable entries',
  keyboard: [
    ['Enter / Tab', 'Commits the typed text as a chip (Tab only when there is text)'],
    [', / ;', 'Commits the typed text (configurable separators)'],
    ['Backspace', 'On an empty input, removes the last chip'],
    ['Paste', 'Splits the clipboard on separators and new lines into chips'],
    ['Tab to a chip button, Enter', 'Removes that chip'],
  ],
  dataAttributes: [
    ['data-invalid', 'root', 'The control value is invalid.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-invalid', 'input', 'The control value is invalid.'],
    ['data-disabled', 'input', 'The control cannot be changed or activated.'],
    ['data-invalid', 'chip', 'The control value is invalid.'],
    ['data-disabled', 'chip', 'The control cannot be changed or activated.'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'primary-text',
    'destructive',
    'destructive-text',
    'secondary',
    'focus-ring',
  ],
};
