import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'JsonViewer',
  group: 'Display',
  status: 'beta',
  description:
    'Collapsible JSON inspector built on TreeList: objects and arrays expand, values are coloured by type with contrast-safe text tokens (keys primary-text, strings warning-text, numbers destructive-text, booleans foreground, null muted), `search` highlights matches and expands their ancestors, `maxDepth` caps nesting, and a toolbar copies the selected node path or value.',
  pattern: 'tree view',
  keyboard: [
    ['Tab', 'Moves between the toolbar buttons and the tree'],
    ['ArrowDown / ArrowUp', 'Next / previous visible key'],
    ['ArrowRight / ArrowLeft', 'Expands / collapses an object or array (or moves to child / parent)'],
    ['Home / End', 'First / last visible key'],
    ['Enter / Space', 'Selects the key (its path shows in the toolbar)'],
    ['Type a character', 'Moves to the next key starting with it'],
  ],
  tokens: ['card', 'border', 'secondary', 'foreground', 'muted-foreground', 'primary-text', 'warning-text', 'destructive-text', 'warning', 'warning-chip-text', 'focus-ring'],
};
