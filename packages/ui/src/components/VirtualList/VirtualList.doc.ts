import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'VirtualList',
  group: 'Display',
  status: 'beta',
  description:
    'Windowed list for thousands of rows: only the visible rows plus `overscan` are mounted, with a fixed `itemHeight` or measured rows from an estimate. One roving tab stop, aria-setsize/posinset on every row, `scrollToIndex` through a ref, and a single-select `listbox` mode. No dependencies.',
  pattern: 'list / listbox with roving tabindex',
  keyboard: [
    ['Tab', 'Moves focus to the active row (one tab stop)'],
    ['ArrowDown / ArrowUp', 'Moves to the next / previous row, scrolling it into view'],
    ['PageDown / PageUp', 'Moves one viewport down / up'],
    ['Home / End', 'Moves to the first / last row'],
    ['Enter', 'Activates the row (selects it in listbox mode)'],
    ['Space', 'Listbox mode: selects the focused option'],
  ],
  tokens: ['card', 'border', 'secondary', 'primary', 'foreground', 'muted-foreground', 'focus-ring'],
};
