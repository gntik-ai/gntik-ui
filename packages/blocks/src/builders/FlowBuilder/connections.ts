import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { FlowCanvasProps, FlowNode } from '@gntik-ai/flow';
import type { FlowBuilderExtensions, FlowConnection, FlowConnectionRejection } from './extensions';
import type { FlowEdge } from './fixtures';

type Connect = NonNullable<FlowCanvasProps<FlowNode, FlowEdge>['onConnect']>;
type Candidate = Parameters<NonNullable<FlowCanvasProps<FlowNode, FlowEdge>['isValidConnection']>>[0];

export function useConnections(
  nodes: FlowNode[],
  setEdges: Dispatch<SetStateAction<FlowEdge[]>>,
  defaultConnect: Connect,
  props: FlowBuilderExtensions,
) {
  const pending = useRef<FlowConnectionRejection | null>(null);
  const seq = useRef(0);
  const [rejections, setRejections] = useState<FlowConnectionRejection[]>([]);
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
    setRejections((issues) => [...issues.filter((i) => i.code !== issue.code || i.nodeId !== issue.nodeId), issue]);
    props.onConnectionRejected?.(issue);
  };
  const connect: Connect = (c) => {
    if (!validate(c)) {
      finish();
      return;
    }
    if (props.onConnectEdge) {
      const mapped = props.onConnectEdge(describe(c));
      setEdges((es) => [
        ...es,
        {
          ...c,
          ...mapped,
          id: `edge-${++seq.current}-${c.source}-${c.target}`,
        },
      ]);
    } else defaultConnect(c);
    props.onConnect?.(describe(c));
  };
  return { connect, validate, finish, reset, rejections };
}
