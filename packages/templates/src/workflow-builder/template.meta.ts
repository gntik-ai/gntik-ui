import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Flow builder',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description:
    'Full-screen workflow editor with optional nodeTypes, onConnectEdge, onConnect, isValidConnection, onConnectionRejected, validationIssues, mode="run", nodeStatus and onNodeSelect passed to FlowBuilder; codePanel passes readOnly, markers, onValidityChange, onMonacoReady and loader to an optional CodePanel (branch, parallel, sequence and worker-backed YAML examples). The app must import \'@gntik-ai/flow/styles.css\' once for the canvas styles. Optional nodeTypes, onConnectEdge, onConnect, isValidConnection, onConnectionRejected, validationIssues, mode, nodeStatus and onNodeSelect pass to FlowBuilder unchanged (see its branch, parallel and sequence examples). mode="run" hides Save, Publish and the saved notice, and preserves focus and node selection. Optional codePanel renders a companion CodePanel and passes all its extensions: readOnly, markers, onValidityChange, onMonacoReady and loader; run mode forces its readOnly to true. For example, WorkflowBuilderPage mode="run" nodeStatus={{step:"running"}} onNodeSelect={openDetails}; codePanel={{files,problems:[],loader:yamlLoader,markers}} uses consumer-owned same-origin YAML workers and inline schemas.',
  layout: 'CanvasLayout',
  blocks: ['flow-builder', 'code-panel'],
};
