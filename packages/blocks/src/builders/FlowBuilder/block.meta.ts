import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Flow builder',
  family: 'builders',
  status: 'beta',
  description:
    'FlowGraph<Kind> is {nodes,edges}; FlowGraphChange names the edit type and affected nodeIds/edgeIds. Optional onGraphChange(graph, change) reports each committed add, delete, move, connect or inspector update once, omitting selected, dragging and measured from nodes. Inspector updates report every value change: hosts persisting every call should debounce. Selection, measurement, panel resizing, rejected connections and run mode report nothing. Optional graph controls content: render the parent graph without applying edits locally, while selection, measured sizes and active drag positions stay internal by stable node id. nodes/edges remain initial values when uncontrolled. onRun keeps the canvas node objects. builderNodes and builderEdges expose the shared starter graph; cleanFlowGraph(graph) returns a graph without transient node fields for persistence. examples/ControlledGraph.tsx shows graph={graph} onGraphChange={setGraph}. Palette ids skip existing kind-n ids. Visual flow editor with optional nodeTypes for named handles (branch-arm, parallel and sequence examples), onConnectEdge for edge type/data mapping, isValidConnection and onConnectionRejected for rules, onConnect for accepted connections, validationIssues for node/flow problems, mode="run" for a read-only canvas, nodeStatus for live badges, and onNodeSelect for pointer/keyboard selection. Optional nodeTypes registers kit-owned {type, handles:[{id,kind,position?,label?}], render, decorations?} definitions (no React Flow NodeProps). Keep nodeTypes and its renderer definitions stable (module scope or useMemo) across nodeStatus updates: recreating the array rebuilds custom node components and remounts them, defeating per-node memoization. onConnectEdge({source,target,sourceType,targetType,sourceHandle,targetHandle}) returns {type,data}; examples/extensions.tsx maps branch arm-0 to {kind: "branch-arm", armIndex: 0}, parallel branch to {kind: "parallel"}, and sequence next to {kind: "sequence"}. isValidConnection returns true, false, or {code,nodeId?,message}; onConnectionRejected reports {code,nodeId,message} once (nodeId defaults to the source) so consumers can forward it into validationIssues and control its lifetime, while onConnect reports accepted connections only. validationIssues decorates nodes with an icon and accessible text; node issues select and focus their node, and flow issues have no node link. mode="run" removes the Run action, palette, inspector and graph mutation while keeping labelled keyboard-selectable nodes, pan/zoom, fit controls and the wide-screen minimap. nodeStatus maps node IDs to FlowTone badges (running, degraded, failed, paused, done, handoff, review); onNodeSelect(id) handles pointer and keyboard selection. RunFlowExample shows live updates with per-node memoization. FlowNode defaults to the built-in FlowNodeKind union; use FlowNode<string> (or a custom kind union) for custom graphs, inferred by FlowBuilder and WorkflowBuilderPage. Custom renderers use kit status overlays and issue decorations by default; set decorations:"consumer" when render owns them, using data.decoration with accessible text and icons (for example, render:({data}) => <NodeCard title={data.title} tone={data.decoration?.status} />). FlowCanvas showInteractiveControls=false retains zoom/fit without the editing toggle. Named handles are keyboard controls: Enter or Space starts or completes a connection in edit mode; handles are disabled in run mode.',
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
