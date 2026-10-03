import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DiffViewer',
  group: 'Display',
  status: 'beta',
  description:
    'Compares two texts, or two JSON values pretty-printed with sorted keys, line by line (Myers diff, no dependencies). Split or unified layout with a switch, line numbers, added/removed tints plus +/− markers and screen-reader text (never colour alone), word-level highlights inside paired lines, long unchanged runs collapsed behind "Expand N lines", +/− stats and optional file or version labels. The pure `diffLines`, `diffWords`, `diffJson` and `stableStringify` are exported.',
  primitive: '@base-ui/react/toggle-group',
  pattern: 'region + toggle group',
  keyboard: [
    ['Tab', 'Moves to the view switch, the scrollable diff region and each "Expand N lines" button'],
    ['ArrowLeft / ArrowRight', 'In the view switch: moves between Unified and Split'],
    ['Enter / Space', 'In the view switch: selects the layout'],
    ['Enter / Space', 'On "Expand N lines": reveals the hidden lines and focuses the diff region'],
    ['ArrowUp / ArrowDown', 'In the focused region: scrolls the diff'],
  ],
  tokens: ['card', 'border', 'foreground', 'muted-foreground', 'secondary', 'success', 'success-text', 'destructive', 'destructive-text', 'focus-ring'],
};
