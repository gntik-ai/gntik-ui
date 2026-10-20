import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useFlowState, type FlowNode, type FlowNodeKind } from '@gntik-ai/flow';
import type { FlowGraph } from './FlowBuilder';
import type { FlowEdge } from './fixtures';

type Overlay<Kind extends string> = Partial<Pick<FlowNode<Kind>, 'selected' | 'measured' | 'dragging' | 'position'>>;

/** Parent graph content with a local overlay for canvas-only state. */
export function useBuilderGraph<Kind extends string>(initial: FlowGraph<Kind>, graph?: FlowGraph<Kind>) {
  type Node = FlowNode<Kind | FlowNodeKind>;
  const local = useFlowState<Node, FlowEdge>(initial.nodes, initial.edges);
  const [overlay, setOverlay] = useState<Record<string, Overlay<Kind | FlowNodeKind>>>({});
  const [edgeSelection, setEdgeSelection] = useState<Record<string, boolean>>({});
  const nodes = useMemo(
    () =>
      graph ? graph.nodes.map((node) => (overlay[node.id] ? { ...node, ...overlay[node.id] } : node)) : local.nodes,
    [graph, overlay, local.nodes],
  );
  const edges = useMemo(
    () =>
      graph
        ? graph.edges.map((edge) => (edge.id in edgeSelection ? { ...edge, selected: edgeSelection[edge.id] } : edge))
        : local.edges,
    [graph, edgeSelection, local.edges],
  );
  const setNodes: Dispatch<SetStateAction<Node[]>> = (action) => {
    if (!graph) return local.setNodes(action);
    const next = typeof action === 'function' ? action(nodes) : action;
    setOverlay(
      Object.fromEntries(
        next.map((node) => [
          node.id,
          {
            selected: node.selected,
            measured: node.measured,
            dragging: node.dragging,
            ...(node.dragging ? { position: node.position } : {}),
          },
        ]),
      ),
    );
  };
  const setEdges: Dispatch<SetStateAction<FlowEdge[]>> = (action) => {
    if (!graph) return local.setEdges(action);
    const next = typeof action === 'function' ? action(edges) : action;
    setEdgeSelection(Object.fromEntries(next.map((edge) => [edge.id, edge.selected ?? false])));
  };
  const onNodesChange: typeof local.onNodesChange = (changes) => {
    if (!graph) return local.onNodesChange(changes);
    setOverlay((previous) => {
      const next = { ...previous };
      for (const change of changes) {
        if (change.type === 'select') next[change.id] = { ...next[change.id], selected: change.selected };
        if (change.type === 'dimensions' && change.dimensions)
          next[change.id] = { ...next[change.id], measured: change.dimensions };
        if (change.type === 'position') {
          const rest = { ...next[change.id] };
          delete rest.position;
          next[change.id] = {
            ...rest,
            dragging: change.dragging,
            ...(change.dragging && change.position ? { position: change.position } : {}),
          };
        }
      }
      return next;
    });
  };
  const onEdgesChange: typeof local.onEdgesChange = (changes) => {
    if (!graph) return local.onEdgesChange(changes);
    setEdgeSelection((previous) => {
      const next = { ...previous };
      for (const change of changes) if (change.type === 'select') next[change.id] = change.selected;
      return next;
    });
  };
  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange };
}
