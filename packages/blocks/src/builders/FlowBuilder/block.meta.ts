import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Flow builder',
  family: 'builders',
  status: 'beta',
  description:
    'Visual flow editor: node palette, brand React Flow canvas (drag, connect, zoom/pan), inspector for the selected node and a run console, in resizable panels that stack on small screens.',
  uses: ['FlowCanvas', 'useFlowState', 'ResizablePanelGroup', 'ResizablePanel', 'ResizeHandle', 'Button', 'Field', 'Input', 'SimpleSelect'],
};
