import { useCallback, useEffect, useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import { useStateHistory, type FlowNode, type FlowNodeKind } from '@gntik-ai/flow';
import type { FlowEdge } from './fixtures';
import type { FlowGraph, FlowGraphChange } from './FlowBuilder';

/** What `FlowBuilder`'s `history` prop takes: on or off, or on with a bound on the steps kept. */
export type FlowHistoryOption = boolean | { limit?: number };

/** Edits that name a step; undo and redo are moves between steps, never steps themselves. */
export type FlowEditType = Exclude<FlowGraphChange['type'], 'undo' | 'redo'>;

/** Message key of the action each step type announces ("delete node"). */
export const ACTION_KEYS = {
  add: 'flow.action.add',
  delete: 'flow.action.delete',
  move: 'flow.action.move',
  connect: 'flow.action.connect',
  update: 'flow.action.update',
} as const satisfies Record<FlowEditType, string>;

export function isEditType(label: string | undefined): label is FlowEditType {
  return label !== undefined && label in ACTION_KEYS;
}

const shallowEqual = (a: object, b: object) => {
  const keys = Object.keys(a) as (keyof typeof a)[];
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
};

/** Items of `next` with the object of `previous` reused where nothing changed, so snapshots share them. */
function share<T extends { id: string }>(next: T[], previous: T[]): T[] {
  const before = new Map(previous.map((item) => [item.id, item]));
  const items = next.map((item) => {
    const old = before.get(item.id);
    return old && shallowEqual(old, item) ? old : item;
  });
  return items.length === previous.length && items.every((item, i) => item === previous[i]) ? previous : items;
}

function withoutSelection(edge: FlowEdge): FlowEdge {
  if (edge.selected === undefined) return edge;
  const rest = { ...edge };
  delete rest.selected;
  return rest;
}

function ids<T extends { id: string }>(from: T[], to: T[]): string[] {
  const before = new Map(from.map((item) => [item.id, item]));
  const after = new Map(to.map((item) => [item.id, item]));
  const changed = [...from, ...to].filter((item) => before.get(item.id) !== after.get(item.id)).map((item) => item.id);
  return [...new Set(changed)];
}

/** Re-applies the live selection and measurement to the nodes and edges a restored graph shares with it. */
export function carryCanvasState<T extends { id: string; selected?: boolean; measured?: unknown }>(
  restored: T[],
  live: T[],
): T[] {
  const now = new Map(live.map((item) => [item.id, item]));
  return restored.map((item) => {
    const current = now.get(item.id);
    if (!current) return item;
    return {
      ...item,
      ...(current.selected !== undefined && { selected: current.selected }),
      ...(current.measured !== undefined && { measured: current.measured }),
    };
  });
}

export interface HistoryMove<Kind extends string> {
  graph: FlowGraph<Kind>;
  change: FlowGraphChange;
  /** Type of the edit that was undone or redone, for the announcement. */
  action: FlowEditType | undefined;
}

/**
 * Undo history of the builder's committed graph edits. It records the same graphs the builder
 * reports through `onGraphChange` (already free of selection, dragging and measurement), so a
 * selection-only change is never a step.
 */
export function useGraphHistory<Kind extends string>(initial: FlowGraph<Kind>, option: FlowHistoryOption) {
  type Graph = FlowGraph<Kind>;
  const history = useStateHistory<Graph>(
    { nodes: initial.nodes, edges: initial.edges.map(withoutSelection) },
    { limit: typeof option === 'object' ? option.limit : undefined },
  );
  const { set, back, forward, reset, values, index } = history;
  // The latest recorded graph, kept in step with the timeline even before the next render.
  const latest = useRef<Graph>(history.value);

  const record = useCallback(
    (graph: Graph, type: FlowEditType, coalesce?: string) => {
      const snapshot: Graph = {
        ...graph,
        nodes: share<FlowNode<Kind | FlowNodeKind>>(graph.nodes, latest.current.nodes),
        edges: share(graph.edges.map(withoutSelection), latest.current.edges),
      };
      if (snapshot.nodes === latest.current.nodes && snapshot.edges === latest.current.edges) return;
      latest.current = snapshot;
      set(snapshot, { label: type, coalesce });
    },
    [set],
  );

  const move = useCallback(
    (type: 'undo' | 'redo'): HistoryMove<Kind> | undefined => {
      const target = values[type === 'undo' ? index - 1 : index + 1];
      if (!target) return undefined;
      const from = latest.current;
      const label = type === 'undo' ? back() : forward();
      latest.current = target;
      return {
        graph: target,
        change: { type, nodeIds: ids(from.nodes, target.nodes), edgeIds: ids(from.edges, target.edges) },
        action: isEditType(label) ? label : undefined,
      };
    },
    [values, index, back, forward],
  );

  const restart = useCallback(
    (graph: Graph) => {
      latest.current = { nodes: graph.nodes, edges: graph.edges.map(withoutSelection) };
      reset(latest.current);
    },
    [reset],
  );

  return {
    record,
    undo: useCallback(() => move('undo'), [move]),
    redo: useCallback(() => move('redo'), [move]),
    restart,
    canUndo: history.canBack,
    canRedo: history.canForward,
  };
}

/** True for fields with their own text undo: inputs, textareas, selects, contenteditable and Monaco. */
export function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"], .monaco-editor',
    ) !== null
  );
}

/** Which history move a key event asks for: Mod+Z undoes, Shift+Mod+Z and Ctrl+Y redo. */
export function historyShortcut(event: KeyboardEvent): 'undo' | 'redo' | undefined {
  if (event.altKey || event.nativeEvent.isComposing) return undefined;
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === 'z') return event.shiftKey ? 'redo' : 'undo';
  if (event.ctrlKey && !event.metaKey && !event.shiftKey && key === 'y') return 'redo';
  return undefined;
}

/**
 * When an edit removes the element that holds focus (a deleted node, the inspector's Delete
 * button), focus moves to the canvas region instead of the page body. `track` goes on the
 * builder root's onFocus; call `request` right after an edit that may remove the focused element.
 */
export function useCanvasFocusFallback(root: RefObject<HTMLElement | null>) {
  const focused = useRef<Element | null>(null);
  const watch = useRef<{ observer: MutationObserver; timer: ReturnType<typeof setTimeout> } | null>(null);
  const stop = useCallback(() => {
    if (!watch.current) return;
    watch.current.observer.disconnect();
    clearTimeout(watch.current.timer);
    watch.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const request = useCallback(() => {
    const host = root.current;
    stop();
    if (!host) return;
    // React Flow removes its node elements after our own render, so wait for the DOM to change.
    const settle = () => {
      if (focused.current?.isConnected !== false) return false;
      const region = host.querySelector<HTMLElement>('.gu-flow');
      if (document.activeElement === document.body && region) {
        if (!region.hasAttribute('tabindex')) region.tabIndex = -1;
        region.focus();
      }
      return true;
    };
    if (settle()) return;
    const observer = new MutationObserver(() => {
      if (settle()) stop();
    });
    observer.observe(host, { childList: true, subtree: true });
    watch.current = { observer, timer: setTimeout(stop, 1000) };
  }, [root, stop]);

  const track = useCallback((event: FocusEvent) => {
    focused.current = event.target;
  }, []);
  return { request, track };
}
