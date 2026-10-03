import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TokenInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Free-entry chips for emails, labels or hosts: Enter, Tab or a separator commits, pasted lists are split, `validate` marks bad entries as invalid chips, `maxItems` caps the list. Additions and removals are announced; works inside Field.',
  primitive: '@base-ui/react/field (Field.Control)',
  pattern: 'textbox + list of removable entries',
  keyboard: [
    ['Enter / Tab', 'Commits the typed text as a chip (Tab only when there is text)'],
    [', / ;', 'Commits the typed text (configurable separators)'],
    ['Backspace', 'On an empty input, removes the last chip'],
    ['Paste', 'Splits the clipboard on separators and new lines into chips'],
    ['Tab to a chip button, Enter', 'Removes that chip'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'primary-text', 'destructive', 'destructive-text', 'secondary', 'focus-ring'],
};
