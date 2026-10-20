import { useRef } from 'react';
import type { FlowCanvasProps, FlowNode } from '@gntik-ai/flow';
import type { FlowBuilderExtensions, FlowConnection, FlowConnectionRejection } from './extensions';
import type { FlowEdge } from './fixtures';

type Connect = NonNullable<FlowCanvasProps<FlowNode<string>, FlowEdge>['onConnect']>;
type Candidate = Parameters<NonNullable<FlowCanvasProps<FlowNode<string>, FlowEdge>['isValidConnection']>>[0];

export function useConnections(
  nodes: FlowNode<string>[],
  edges: FlowEdge[],
  commit: (edge: FlowEdge) => void,
  props: FlowBuilderExtensions,
) {
  const pending = useRef<FlowConnectionRejection | null>(null);
  const seq = useRef(0);
  const describe = (c: Candidate): FlowConnection => ({
    source: c.source,
    target: c.target,
    sourceHandle: c.sourceHandle ?? null,
    targetHandle: c.targetHandle ?? null,
    sourceType: nodes.find((n) => n.id === c.source)?.type ?? 'step',
    targetType: nodes.find((n) => n.id === c.target)?.type ?? 'step',
  });
  const reset = () => {
    pending.current = null;
  };
  const validate = (c: Candidate) => {
    const result = props.isValidConnection?.(describe(c)) ?? true;
    pending.current =
      result === true
        ? null
        : result === false
          ? {
              code: 'invalid-connection',
              nodeId: c.source,
              message: 'This connection is not allowed.',
            }
          : { ...result, nodeId: result.nodeId ?? c.source };
    return result === true;
  };
  const finish = () => {
    const issue = pending.current;
    reset();
    if (!issue) return;
    props.onConnectionRejected?.(issue);
  };
  const connect: Connect = (c) => {
    if (!validate(c)) {
      finish();
      return;
    }
    if (props.onConnectEdge) {
      const mapped = props.onConnectEdge(describe(c));
      let id: string;
      do {
        id = `edge-${++seq.current}-${c.source}-${c.target}`;
      } while (edges.some((edge) => edge.id === id));
      commit({ ...c, ...mapped, id });
    } else if (
      c.source &&
      c.target &&
      !edges.some(
        (edge) =>
          edge.source === c.source &&
          edge.target === c.target &&
          (edge.sourceHandle || null) === (c.sourceHandle || null) &&
          (edge.targetHandle || null) === (c.targetHandle || null),
      )
    ) {
      // Match useFlowState's default edge shape and duplicate-connection behavior.
      const edge: FlowEdge = {
        ...c,
        id: `xy-edge__${c.source}${c.sourceHandle || ''}-${c.target}${c.targetHandle || ''}`,
        type: 'smoothstep',
        animated: true,
      };
      if (edge.sourceHandle === null) delete edge.sourceHandle;
      if (edge.targetHandle === null) delete edge.targetHandle;
      commit(edge);
    }
    props.onConnect?.(describe(c));
  };
  return { connect, validate, finish, reset };
}
