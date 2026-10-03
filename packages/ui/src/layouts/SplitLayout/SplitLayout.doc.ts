import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SplitLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Master–detail layout: a resizable list pane beside a detail pane, built on ResizablePanelGroup (sizes can persist with autoSaveId). Below lg only one pane shows: the list, or the detail with a Back button; `showDetail` is controllable so selecting an item can switch panes. Both panes are labelled regions. Fills its container.',
  primitive: 'Resizable (role="separator")',
  pattern: 'window splitter + two labelled regions',
  keyboard: [
    ['Arrow Left / Right', 'On the resize handle: shrinks / grows the list pane (from Resizable)'],
    ['Home / End', 'On the resize handle: list pane to its minimum / maximum size'],
    ['Enter / Space', 'On Back (small screens): returns to the list and moves focus to it'],
  ],
  tokens: ['background', 'card', 'border', 'accent', 'muted-foreground', 'primary', 'focus-ring'],
};
