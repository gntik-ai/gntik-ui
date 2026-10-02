import { useCallback } from 'react';
import { addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from '@xyflow/react';
import type { FlowNode } from './nodes';

/**
 * Local nodes/edges state wired for drag, select and connect. New connections become
 * active (animated) smoothstep edges. Spread the result into `<FlowCanvas>`.
 */
export function useFlowState<N extends Node = FlowNode, E extends Edge = Edge>(initialNodes: N[], initialEdges: E[]) {
  const [nodes, setNodes, onNodesChange] = useNodesState<N>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<E>(initialEdges);
  const onConnect = useCallback(
    (c: Connection) => {
      // A Connection plus brand edge props (addEdge keeps the extra fields).
      const active: Connection = Object.assign({ type: 'smoothstep', animated: true }, c);
      setEdges((eds) => addEdge<E>(active, eds));
    },
    [setEdges],
  );
  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect };
}
