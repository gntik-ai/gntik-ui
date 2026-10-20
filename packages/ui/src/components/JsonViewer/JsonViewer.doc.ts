import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'JsonViewer',
  group: 'Display',
  status: 'beta',
  description:
    'Collapsible JSON inspector built on TreeList: objects and arrays expand, values use contrast-safe type tokens, `search` highlights matches and expands their ancestors, `maxDepth` caps nesting, and a toolbar copies the selected node path or value. Optional `maxDisplayChars` (finite integer >= 1) measures UTF-16 units: strings as-is, other values as two-space JSON. Over-cap values become read-only text with an ellipsis (dropping a trailing high surrogate) and a warning Badge labelled by `labels.truncated`. Search has no effect in this fallback; Copy value copies the full measured text, as explained by `labels.copyFullHint`, and Copy path is disabled. `maxHeight` bounds the scrollable body. Only in capped mode, null, undefined and empty strings show `emptyContent` (default a muted dash). Leaving the cap unset preserves existing behavior. The cap limits rendering, not serialization cost. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
  pattern: 'tree view',
  keyboard: [
    ['Tab', 'Moves between toolbar buttons and the tree or named capped-text scroll region'],
    ['ArrowDown / ArrowUp', 'Next / previous visible key'],
    ['ArrowRight / ArrowLeft', 'Expands / collapses an object or array (or moves to child / parent)'],
    ['Home / End', 'First / last visible key'],
    ['Enter / Space', 'Selects the key (its path shows in the toolbar)'],
    ['Type a character', 'Moves to the next key starting with it'],
    ['Arrow keys / PageDown / PageUp', 'Scrolls the focused capped-text region using native browser scrolling'],
  ],
  tokens: [
    'card',
    'border',
    'secondary',
    'foreground',
    'muted-foreground',
    'primary-text',
    'warning-text',
    'destructive-text',
    'warning',
    'warning-chip-text',
    'focus-ring',
  ],
};
