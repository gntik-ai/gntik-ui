import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'TreeList',
  group: 'Navigation',
  status: 'beta',
  description:
    'Hierarchical list on the WAI-ARIA tree pattern (role tree / treeitem / group, aria-expanded, aria-level): roving focus, arrow keys, Home/End and typeahead, single or multiple selection, icons per node and children loaded on first expand with loading and error states. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. filter (default empty) searches loaded labels with case- and accent-insensitive matching; filterNode can override matching. Matches and ancestors are shown, and matching branches keep their whole subtree reachable when expanded. Unloaded lazy children are not searched; debounce filter for large trees. Filtering preserves selection and uses a separate expansion set that never calls onExpandedChange; clearing restores previous expansion. Plain matched labels are highlighted; rich content and containment-only ancestors are not. A status announces match counts only during filtering, and no matches hides the tree. Optional node.href renders a LinkProvider anchor treeitem owning its group; currentHref marks the current page. Disabled links cannot navigate. Groups animate height with motion tokens and toggle immediately under reduced motion. TreeListFilter demonstrates filtering, custom files-only matching, highlights and empty results; TreeListNavigation demonstrates link nodes, currentHref, disabled links and filtering. See TransferList for Spanish catalog defaults.',
  primitive: '@base-ui/react/collapsible',
  anatomy: '<TreeList nodes={nodes} filter={query} filterNode={matcher} currentHref="/docs/getting-started" />',
  pattern: 'tree view',
  keyboard: [
    ['Tab', 'Moves focus into the tree (selected or first node) and out of it'],
    ['ArrowDown / ArrowUp', 'Next / previous visible node'],
    ['ArrowRight', 'Closed node: expands it (loading children if needed). Open node: moves to its first child'],
    ['ArrowLeft', 'Open node: collapses it. Otherwise: moves to the parent'],
    ['Home / End', 'First / last visible node'],
    ['Enter', 'Link: navigates. Other nodes: selects and runs onAction'],
    ['Space', 'Selects the node (toggles in multiple mode)'],
    [
      'Ctrl/⌘ + A',
      'Multiple mode: selects every enabled node; while filtering, only visible nodes, retaining hidden selections',
    ],
    ['Type a character', 'Moves to the next node whose label starts with the typed text'],
  ],
  tokens: [
    'foreground',
    'muted-foreground',
    'secondary',
    'primary',
    'primary-chip-text',
    'primary-foreground',
    'border',
    'destructive-text',
    'focus-ring',
    'warning',
    'warning-chip-text',
    'duration-normal',
    'ease-standard',
  ],
};
