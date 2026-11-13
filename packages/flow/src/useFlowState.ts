import { useCallback, useRef, useState, type SetStateAction } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import type { FlowNode } from './nodes';
import { useTimeline, type StateHistoryMeta } from './useStateHistory';

export interface FlowStateOptions {
  /**
   * Record committed edits for `undo`/`redo` (default false). Selection, dimension and
   * in-progress drag changes are never recorded. `{ limit }` bounds the steps kept (default 100).
   */
  history?: boolean | { limit?: number };
}

/** Setter that also takes a label and a coalesce key for the history step it creates. */
export type FlowSetter<T> = (action: SetStateAction<T[]>, meta?: StateHistoryMeta) => void;

interface Snapshot<N extends Node, E extends Edge> {
  nodes: N[];
  edges: E[];
}

const same = (a: object, b: object) => {
  const keys = Object.keys(a) as (keyof typeof a)[];
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
};

/** Content of items without canvas-only fields; unchanged items keep the previous snapshot's object. */
function snapshotItems<T extends { id: string }>(items: T[], previous: T[], transient: string[]): T[] {
  const before = new Map(previous.map((item) => [item.id, item]));
  const next = items.map((item) => {
    const clean: Record<string, unknown> = { ...item };
    for (const key of transient) delete clean[key];
    const old = before.get(item.id);
    return old && same(old, clean) ? old : (clean as unknown as T);
  });
  return next.length === previous.length && next.every((item, i) => item === previous[i]) ? previous : next;
}

/** Re-applies the current selection and measurement to the items a restored snapshot shares with it. */
function withCurrent<T extends { id: string; selected?: boolean }>(restored: T[], current: T[]): T[] {
  const live = new Map(current.map((item) => [item.id, item]));
  return restored.map((item) => {
    const now = live.get(item.id);
    if (!now) return item;
    const carried: Record<string, unknown> = { ...item };
    if (now.selected !== undefined) carried.selected = now.selected;
    if ('measured' in now) carried.measured = now.measured;
    return carried as unknown as T;
  });
}

/** Nodes still being dragged keep their last recorded position: an unfinished move is not a committed edit. */
function settled<N extends Node>(nodes: N[], recorded: N[]): N[] {
  if (!nodes.some((node) => node.dragging)) return nodes;
  const before = new Map(recorded.map((node) => [node.id, node]));
  return nodes.map((node) => {
    const old = node.dragging ? before.get(node.id) : undefined;
    return old ? { ...node, position: old.position } : node;
  });
}

function nodeLabel(changes: NodeChange[]): string {
  const types = changes.map((change) => change.type);
  if (types.includes('add')) return 'add';
  if (types.includes('remove')) return 'delete';
  if (types.includes('position')) return 'move';
  return 'update';
}

function edgeLabel(changes: EdgeChange[]): string {
  const types = changes.map((change) => change.type);
  if (types.includes('add')) return 'connect';
  if (types.includes('remove')) return 'delete';
  return 'update';
}

/**
 * Local nodes/edges state wired for drag, select and connect. New connections become
 * active (animated) smoothstep edges. Spread the result into `<FlowCanvas>`.
 *
 * With `{ history: true }` it also records committed edits (additions, removals, accepted
 * connections, ended moves and direct `setNodes`/`setEdges` calls) for `undo` and `redo`.
 * Changes made in one event form one step, and selection is never part of a step.
 */
export function useFlowState<N extends Node = FlowNode, E extends Edge = Edge>(
  initialNodes: N[],
  initialEdges: E[],
  options: FlowStateOptions = {},
) {
  const { history = false } = options;
  const enabled = history !== false;
  const [nodes, setNodesState] = useState(initialNodes);
  const [edges, setEdgesState] = useState(initialEdges);
  // Refs hold the latest value so that several changes in one event build on each other.
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const [first] = useState<Snapshot<N, E>>(() => ({
    nodes: snapshotItems(initialNodes, [], ['selected', 'dragging', 'measured']),
    edges: snapshotItems(initialEdges, [], ['selected']),
  }));
  const recorded = useRef(first);
  const timeline = useTimeline<Snapshot<N, E>>(first, {
    limit: typeof history === 'object' ? history.limit : undefined,
  });
  const { set: recordStep, back, forward, reset } = timeline;
  const batch = useRef({ id: 0, open: false });

  const record = useCallback(
    (label: string, meta?: StateHistoryMeta) => {
      if (!enabled) return;
      const snapshot = {
        nodes: snapshotItems(settled(nodesRef.current, recorded.current.nodes), recorded.current.nodes, [
          'selected',
          'dragging',
          'measured',
        ]),
        edges: snapshotItems(edgesRef.current, recorded.current.edges, ['selected']),
      };
      if (snapshot.nodes === recorded.current.nodes && snapshot.edges === recorded.current.edges) return;
      // Everything recorded before the microtask runs came from one event: it is one step.
      if (!batch.current.open) {
        batch.current = { id: batch.current.id + 1, open: true };
        queueMicrotask(() => {
          batch.current.open = false;
        });
      }
      recorded.current = snapshot;
      recordStep(snapshot, { label: meta?.label ?? label, coalesce: meta?.coalesce ?? `event-${batch.current.id}` });
    },
    [enabled, recordStep],
  );

  const commitNodes = useCallback((next: N[]) => {
    nodesRef.current = next;
    setNodesState(next);
  }, []);
  const commitEdges = useCallback((next: E[]) => {
    edgesRef.current = next;
    setEdgesState(next);
  }, []);

  const setNodes = useCallback<FlowSetter<N>>(
    (action, meta) => {
      commitNodes(typeof action === 'function' ? action(nodesRef.current) : action);
      record('update', meta);
    },
    [commitNodes, record],
  );
  const setEdges = useCallback<FlowSetter<E>>(
    (action, meta) => {
      commitEdges(typeof action === 'function' ? action(edgesRef.current) : action);
      record('update', meta);
    },
    [commitEdges, record],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<N>[]) => {
      commitNodes(applyNodeChanges(changes, nodesRef.current));
      const committed = changes.filter(
        (change) =>
          change.type !== 'select' &&
          change.type !== 'dimensions' &&
          (change.type !== 'position' || change.dragging === false),
      );
      if (committed.length) record(nodeLabel(committed));
    },
    [commitNodes, record],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<E>[]) => {
      commitEdges(applyEdgeChanges(changes, edgesRef.current));
      const committed = changes.filter((change) => change.type !== 'select');
      if (committed.length) record(edgeLabel(committed));
    },
    [commitEdges, record],
  );
  const onConnect = useCallback(
    (c: Connection) => {
      // A Connection plus brand edge props (addEdge keeps the extra fields).
      const active: Connection = Object.assign({ type: 'smoothstep', animated: true }, c);
      setEdges((eds) => addEdge<E>(active, eds), { label: 'connect' });
    },
    [setEdges],
  );

  const restore = useCallback(
    (snapshot: Snapshot<N, E>) => {
      recorded.current = snapshot;
      commitNodes(withCurrent(snapshot.nodes, nodesRef.current));
      commitEdges(withCurrent(snapshot.edges, edgesRef.current));
    },
    [commitNodes, commitEdges],
  );
  const undo = useCallback(() => {
    const move = enabled ? back() : undefined;
    if (!move) return undefined;
    batch.current.open = false;
    restore(move.value);
    return move.label;
  }, [enabled, back, restore]);
  const redo = useCallback(() => {
    const move = enabled ? forward() : undefined;
    if (!move) return undefined;
    batch.current.open = false;
    restore(move.value);
    return move.label;
  }, [enabled, forward, restore]);
  const resetHistory = useCallback(() => {
    recorded.current = {
      nodes: snapshotItems(nodesRef.current, recorded.current.nodes, ['selected', 'dragging', 'measured']),
      edges: snapshotItems(edgesRef.current, recorded.current.edges, ['selected']),
    };
    reset(recorded.current);
  }, [reset]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    /** Steps back one recorded edit; returns its label (undefined when there is nothing to undo). */
    undo,
    /** Steps forward one undone edit; returns its label (undefined when there is nothing to redo). */
    redo,
    canUndo: enabled && timeline.canBack,
    canRedo: enabled && timeline.canForward,
    /** Forgets every recorded step and keeps the current nodes and edges. */
    resetHistory,
  };
}
