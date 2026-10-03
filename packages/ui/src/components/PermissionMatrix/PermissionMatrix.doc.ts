import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PermissionMatrix',
  group: 'Forms',
  status: 'beta',
  description:
    'Roles (columns) × permissions (rows grouped in sections) editor. Cells are tri-state — allowed, denied, inherited — shown with an icon and a word, never colour alone; inherited cells are dashed and can say what they resolve to. Read-only columns (e.g. owner) and per-cell disabled reasons in a tooltip; controlled `value` + `onChange`; one tab stop with grid arrow-key navigation.',
  primitive: 'native table (role="grid") + @base-ui/react/tooltip',
  pattern: 'data grid (roving tabindex)',
  keyboard: [
    ['Tab', 'Enters and leaves the grid (one tab stop, on the last focused cell)'],
    ['ArrowLeft / ArrowRight / ArrowUp / ArrowDown', 'Moves between cells (left/right mirror in RTL); section headings are skipped'],
    ['Home / End', 'First / last cell of the row'],
    ['Ctrl+Home / Ctrl+End', 'First / last cell of the grid'],
    ['PageUp / PageDown', 'First / last cell of the column'],
    ['Enter / Space', 'Cycles the cell: allowed → denied → inherited'],
    ['A / D / I', 'Sets the cell to allowed / denied / inherited'],
  ],
  tokens: ['card', 'border', 'secondary', 'foreground', 'muted-foreground', 'success', 'success-chip-text', 'destructive', 'destructive-chip-text', 'focus-ring'],
};
