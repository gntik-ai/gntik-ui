import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Resizable',
  group: 'Layout',
  status: 'stable',
  description:
    'Split layouts with draggable dividers: ResizablePanelGroup (horizontal or vertical), ResizablePanel (default / min / max size in %, collapsible) and ResizeHandle (optional grip). Pointer drag and full keyboard support; the layout can be remembered in localStorage with `autoSaveId`. No extra dependencies.',
  pattern: 'window splitter',
  keyboard: [
    ['ArrowLeft / ArrowRight', 'Horizontal group: shrinks / grows the panel before the handle by `step` (default 5%)'],
    ['ArrowUp / ArrowDown', 'Vertical group: shrinks / grows the panel above the handle by `step`'],
    ['Home / End', 'Sets the panel before the handle to its minimum / maximum size'],
    ['Enter', 'Collapses the adjacent collapsible panel, or restores it to its previous size'],
  ],
  tokens: ['border', 'primary', 'card', 'muted-foreground', 'shadow-sm', 'focus-ring'],
};
