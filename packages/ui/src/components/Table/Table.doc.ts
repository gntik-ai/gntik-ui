import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Table',
  group: 'Display',
  status: 'stable',
  description: 'Styled semantic table parts: Table, TableHeader, TableBody, TableFooter, TableRow (selected state), TableHead (optional sort button with aria-sort), TableCell and TableCaption. Compact or comfortable density and an optional sticky header.',
  pattern: 'table (sortable columns)',
  keyboard: [
    ['Tab', 'Moves focus between sortable column headers and interactive cells'],
    ['Enter', 'On a sortable header: sorts ascending, then toggles ascending ⇄ descending (aria-sort)'],
    ['Space', 'On a sortable header: same as Enter'],
  ],
  tokens: ['border', 'card', 'secondary', 'accent', 'primary', 'foreground', 'muted-foreground', 'focus-ring'],
};
