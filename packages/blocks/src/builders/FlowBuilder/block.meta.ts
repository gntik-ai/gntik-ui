import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Flow builder',
  family: 'builders',
  status: 'beta',
  description:
    'Visual flow editor with optional nodeTypes for named handles (branch-arm, parallel and sequence examples), onConnectEdge for edge type/data mapping, isValidConnection and onConnectionRejected for rules, onConnect for accepted connections, validationIssues for node/flow problems, mode="run" for a read-only canvas, nodeStatus for live badges, and onNodeSelect for pointer/keyboard selection. Optional nodeTypes registers kit-owned {type, handles:[{id,kind,position?,label?}], render} definitions (no React Flow NodeProps). onConnectEdge({source,target,sourceType,targetType,sourceHandle,targetHandle}) returns {type,data}; examples/extensions.tsx maps branch arm-0 to {kind: "branch-arm", armIndex: 0}, parallel branch to {kind: "parallel"}, and sequence next to {kind: "sequence"}. isValidConnection returns true, false, or {code,nodeId?,message}; onConnectionRejected reports {code,nodeId,message} once (nodeId defaults to the source) and adds it to Problems, while onConnect reports accepted connections only. validationIssues decorates nodes with an icon and accessible text; node issues select and focus their node, and flow issues have no node link. mode="run" removes palette, inspector and graph mutation while keeping labelled keyboard-selectable nodes. nodeStatus maps node IDs to FlowTone badges (running, degraded, failed, paused, done, handoff, review); onNodeSelect(id) handles pointer and keyboard selection. RunFlowExample shows live updates with per-node memoization. Named handles are keyboard controls: Enter or Space starts or completes a connection in edit mode; handles are disabled in run mode.',
  uses: [
    'FlowCanvas',
    'useFlowState',
    'ResizablePanelGroup',
    'ResizablePanel',
    'ResizeHandle',
    'Button',
    'Field',
    'Input',
    'SimpleSelect',
  ],
};
