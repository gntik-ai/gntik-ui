import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TreeList',
  group: 'Navigation',
  status: 'beta',
  description:
    'Hierarchical list on the WAI-ARIA tree pattern (role tree / treeitem / group, aria-expanded, aria-level): roving focus, arrow keys, Home/End and typeahead, single or multiple selection, icons per node and children loaded on first expand with loading and error states.',
  pattern: 'tree view',
  keyboard: [
    ['Tab', 'Moves focus into the tree (selected or first node) and out of it'],
    ['ArrowDown / ArrowUp', 'Next / previous visible node'],
    ['ArrowRight', 'Closed node: expands it (loading children if needed). Open node: moves to its first child'],
    ['ArrowLeft', 'Open node: collapses it. Otherwise: moves to the parent'],
    ['Home / End', 'First / last visible node'],
    ['Enter', 'Selects the node and runs onAction'],
    ['Space', 'Selects the node (toggles in multiple mode)'],
    ['Ctrl/⌘ + A', 'Multiple mode: selects every node'],
    ['Type a character', 'Moves to the next node whose label starts with the typed text'],
  ],
  tokens: ['foreground', 'muted-foreground', 'secondary', 'primary', 'primary-chip-text', 'primary-foreground', 'border', 'destructive-text', 'focus-ring'],
};
