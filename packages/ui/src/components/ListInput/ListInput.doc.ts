import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ListInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Repeatable key/value rows for environment variables, headers or labels: add, remove and reorder (buttons or Alt+Arrow), paste `KEY=value` lines to bulk-add, per-row validation with duplicate-key detection, optional masked values with a reveal toggle. Changes are announced.',
  pattern: 'list of labelled text field pairs',
  keyboard: [
    ['Tab', 'Moves through key, value, reveal, move and remove controls row by row'],
    ['Enter (key field)', 'Moves to the row value'],
    ['Enter (last value)', 'Adds a row and focuses its key'],
    ['Alt+ArrowUp / Alt+ArrowDown', 'Moves the row up / down, keeping focus in the same field'],
    ['Paste', 'Multi-line or KEY=value text is split into rows'],
    ['Enter / Space on a remove button', 'Removes the row and focuses the next one'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'destructive', 'destructive-text', 'secondary', 'focus-ring'],
};
