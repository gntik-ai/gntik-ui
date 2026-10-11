import { useState } from 'react';
import type { FlowNode, FlowTone } from '@gntik-ai/flow';
import type { FlowValidationIssue } from './extensions';

type Statuses = Readonly<Record<string, FlowTone | undefined>> | undefined;
interface CachedNode<Kind extends string> {
  original: FlowNode<Kind>;
  status: FlowTone | undefined;
  issuesKey: string;
  runMode: boolean;
  node: FlowNode<Kind>;
}

function project<Kind extends string>(
  nodes: FlowNode<Kind>[],
  issues: readonly FlowValidationIssue[],
  statuses: Statuses,
  runMode: boolean,
  previous: ReadonlyMap<string, CachedNode<Kind>>,
) {
  const cache = new Map<string, CachedNode<Kind>>();
  const displayed = nodes.map((original) => {
    const nodeIssues = issues.filter((issue) => issue.nodeId === original.id);
    const issuesKey = JSON.stringify(nodeIssues);
    const status = statuses?.[original.id];
    const old = previous.get(original.id);
    if (old?.original === original && old.status === status && old.issuesKey === issuesKey && old.runMode === runMode) {
      cache.set(original.id, old);
      return old.node;
    }
    const node: FlowNode<Kind> = {
      ...original,
      ...(runMode
        ? {
            draggable: false,
            connectable: false,
            deletable: false,
            focusable: true,
            selectable: true,
            ariaLabel: original.data.title,
          }
        : {}),
      data:
        nodeIssues.length || status
          ? {
              ...original.data,
              decoration: {
                ...original.data.decoration,
                status,
                issues: nodeIssues,
              },
            }
          : original.data,
    };
    cache.set(original.id, { original, status, issuesKey, runMode, node });
    return node;
  });
  return { nodes, issues, statuses, runMode, cache, displayed };
}

/** Derive a snapshot when inputs change; preserve other nodes' identities without mutating a render cache. */
export function useDecoratedNodes<Kind extends string>(
  nodes: FlowNode<Kind>[],
  issues: readonly FlowValidationIssue[],
  statuses: Statuses,
  runMode: boolean,
) {
  const [snapshot, setSnapshot] = useState(() => project(nodes, issues, statuses, runMode, new Map()));
  if (
    snapshot.nodes !== nodes ||
    snapshot.issues !== issues ||
    snapshot.statuses !== statuses ||
    snapshot.runMode !== runMode
  ) {
    const next = project(nodes, issues, statuses, runMode, snapshot.cache);
    setSnapshot(next);
    return next.displayed;
  }
  return snapshot.displayed;
}
