import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { breakpointQuery } from '@gntik-ai/tokens/runtime';
import { Play, Redo2, Undo2 } from '@gntik-ai/icons';
import { FlowCanvas, type FlowCanvasProps, type FlowNode, type FlowNodeData, type FlowNodeKind } from '@gntik-ai/flow';
import {
  Button,
  IconButton,
  type Announce,
  ResizablePanel,
  ResizablePanelGroup,
  ResizeHandle,
  cn,
  useAnnounce,
  useHasLiveAnnouncer,
  useI18n,
  useMediaQuery,
} from '@gntik-ai/ui';
import {
  builderConsole,
  builderEdges,
  builderNodes,
  builderPalette,
  type ConsoleEntry,
  type FlowEdge,
  type PaletteItem,
} from './fixtures';
import type { FlowBuilderExtensions } from './extensions';
import { useDecoratedNodes } from './decorated-nodes';
import { useConnections } from './connections';
import { useBuilderGraph } from './graph-state';
import {
  ACTION_KEYS,
  carryCanvasState,
  historyShortcut,
  isEditableTarget,
  useCanvasFocusFallback,
  useGraphHistory,
  type FlowEditType,
  type FlowHistoryOption,
} from './history';
import { FlowProblems } from './problems';
import { NodeInspector, NodePalette, RunConsole } from './parts';

export type { ConsoleEntry, FlowEdge, PaletteItem } from './fixtures';
/** Shared starter graph for hosts that also need its value before the first edit. */
export { builderNodes, builderEdges } from './fixtures';
/** Graph types re-exported so apps can type nodes without depending on @gntik-ai/flow. */
export type { FlowNode, FlowNodeData, FlowNodeKind, FlowTone } from '@gntik-ai/flow';

export type { FlowConnection, FlowConnectionRejection, FlowValidationIssue } from './extensions';
export type { FlowNodeRenderer, FlowHandle, FlowNodeRenderProps } from '@gntik-ai/flow';

export interface FlowGraph<Kind extends string = FlowNodeKind> {
  nodes: FlowNode<Kind | FlowNodeKind>[];
  edges: FlowEdge[];
}

export interface FlowGraphChange {
  /** `undo` and `redo` report the graph a history step restored. */
  type: 'add' | 'delete' | 'move' | 'connect' | 'update' | 'undo' | 'redo';
  nodeIds: string[];
  edgeIds: string[];
}

/** Persist graph content without canvas selection, drag or measurement state. */
export function cleanFlowGraph<Kind extends string>(graph: FlowGraph<Kind>): FlowGraph<Kind> {
  return {
    ...graph,
    nodes: graph.nodes.map((original) => {
      const node = { ...original };
      delete node.selected;
      delete node.dragging;
      delete node.measured;
      return node;
    }),
  };
}

export interface FlowBuilderProps<Kind extends string = FlowNodeKind> extends FlowBuilderExtensions {
  title?: string;
  nodes?: FlowNode<Kind | FlowNodeKind>[];
  edges?: FlowEdge[];
  /** Controlled graph content. Canvas selection, measurements and active drags stay local. */
  graph?: FlowGraph<Kind>;
  onGraphChange?: (graph: FlowGraph<Kind>, change: FlowGraphChange) => void;
  /**
   * Undo and Redo of committed edits (default true in edit mode): header buttons and the
   * Mod+Z, Shift+Mod+Z and Ctrl+Y shortcuts inside the builder. `{ limit }` bounds the steps
   * kept (default 100); false removes the buttons and the shortcuts.
   */
  history?: FlowHistoryOption;
  palette?: PaletteItem[];
  /**
   * Console output (controlled). Run and Clear then report the next list through
   * `onConsoleChange` instead of updating it internally.
   */
  consoleEntries?: ConsoleEntry[];
  /** Initial console output (uncontrolled). Defaults to the sample entries. */
  defaultConsoleEntries?: ConsoleEntry[];
  /** Called with the next console list after a run appends to it or it is cleared. */
  onConsoleChange?: (entries: ConsoleEntry[]) => void;
  /** Called when the console's Clear button is pressed. */
  onConsoleClear?: () => void;
  /** Heading level of the builder title (default h2); panel titles use the next level. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Total height of the builder on wide screens (px). */
  height?: number;
  /**
   * Called with the current graph when Run is pressed. Return console entries (or a promise
   * of them) to log the real run; return nothing to log a simulated run. While a returned
   * promise is pending the Run button shows a loading state; a rejection is logged as an error.
   */
  onRun?: (graph: FlowGraph<Kind>) => FlowRunResult | Promise<FlowRunResult>;
  className?: string;
}

/** What `onRun` may return: entries to append, or nothing for the simulated run. */
export type FlowRunResult = ConsoleEntry[] | void | undefined;

const NO_ISSUES: NonNullable<FlowBuilderProps['validationIssues']> = [];

function clock() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

/**
 * Visual flow builder: node palette, brand React Flow canvas (drag, connect, zoom/pan),
 * inspector for the selected node and a run console, in resizable panels. On small screens
 * the panels stack.
 */
export function FlowBuilder<Kind extends string = FlowNodeKind>(props: FlowBuilderProps<Kind>) {
  const hasAnnouncer = useHasLiveAnnouncer();
  const [message, setMessage] = useState('');
  // Undo announcements need a live region: use the one above, else render our own beside the
  // builder. The builder stays the first child either way, so toggling `history` never remounts it.
  const ownRegion = props.history !== false && !hasAnnouncer;
  const announceOwn = useCallback<Announce>(
    (next) => setMessage((prev) => (prev === next ? `${next}\u00A0` : next)),
    [],
  );
  return (
    <>
      <FlowBuilderContent<Kind> {...props} announceOwn={ownRegion ? announceOwn : undefined} />
      {ownRegion && (
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-live-announcer="polite">
          {message}
        </div>
      )}
    </>
  );
}

function FlowBuilderContent<Kind extends string = FlowNodeKind>({
  announceOwn,
  title = 'Untitled flow',
  nodes: initialNodes = builderNodes,
  edges: initialEdges = builderEdges,
  graph,
  onGraphChange,
  history = true,
  palette = builderPalette,
  consoleEntries,
  defaultConsoleEntries = builderConsole,
  onConsoleChange,
  onConsoleClear,
  titleAs: TitleTag = 'h2',
  height = 600,
  onRun,
  nodeTypes,
  onConnectEdge,
  onConnect: onConnected,
  isValidConnection,
  onConnectionRejected,
  validationIssues,
  mode = 'edit',
  nodeStatus,
  onNodeSelect,
  className,
}: FlowBuilderProps<Kind> & { announceOwn?: Announce }) {
  const runMode = mode === 'run';
  const root = useRef<HTMLElement>(null);
  const flow = useRef<
    Parameters<NonNullable<FlowCanvasProps<FlowNode<Kind | FlowNodeKind>, FlowEdge>['onInit']>>[0] | null
  >(null);
  const wide = useMediaQuery(breakpointQuery('md'), true);
  const panelAs = TitleTag === 'h2' ? 'h3' : TitleTag === 'h3' ? 'h4' : 'h5';
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } = useBuilderGraph<Kind>(
    { nodes: initialNodes, edges: initialEdges },
    graph,
  );
  const [innerLog, setInnerLog] = useState<ConsoleEntry[]>(defaultConsoleEntries);
  const log = consoleEntries ?? innerLog;
  const latestLog = useRef(log);
  useEffect(() => {
    latestLog.current = log;
  });
  const [running, setRunning] = useState(false);
  const seq = useRef(0);
  const runs = useRef(0);
  const selected = nodes.find((n) => n.selected);
  const historyOn = history !== false && !runMode;
  const { t } = useI18n();
  const announceAbove = useAnnounce();
  const announce = announceOwn ?? announceAbove;
  const [start] = useState(() => cleanFlowGraph<Kind>(graph ?? { nodes: initialNodes, edges: initialEdges }));
  const graphHistory = useGraphHistory<Kind>(start, history);
  // The graph last handed to the host. A controlled graph that is not that one came from elsewhere.
  const reported = useRef(graph);
  const seen = useRef(graph);
  // Inspector edits of one node merge into one history step until a field loses focus.
  const editBatch = useRef(0);

  const commit = (next: FlowGraph<Kind>, change: FlowGraphChange & { type: FlowEditType }, coalesce?: string) => {
    reported.current = next;
    if (historyOn) graphHistory.record(next, change.type, coalesce);
    onGraphChange?.(next, change);
  };

  const focusFallback = useCanvasFocusFallback(root);

  const { restart } = graphHistory;
  useEffect(() => {
    const previous = seen.current;
    seen.current = graph;
    if (!graph || !historyOn) return;
    if (previous?.nodes === graph.nodes && previous.edges === graph.edges) return;
    if (reported.current?.nodes === graph.nodes && reported.current.edges === graph.edges) return;
    restart(cleanFlowGraph(graph));
  }, [graph, historyOn, restart]);

  // Edits made while history was off are not steps: start again from the graph as it is when it is switched on.
  const wasOn = useRef(historyOn);
  useEffect(() => {
    if (historyOn && !wasOn.current) restart(cleanFlowGraph<Kind>({ nodes, edges }));
    wasOn.current = historyOn;
  }, [historyOn, nodes, edges, restart]);

  const stepHistory = (direction: 'undo' | 'redo') => {
    const move = direction === 'undo' ? graphHistory.undo() : graphHistory.redo();
    if (!move) return;
    focusFallback.request();
    reported.current = move.graph;
    if (!graph) {
      setNodes(carryCanvasState(move.graph.nodes, nodes));
      setEdges(carryCanvasState(move.graph.edges, edges));
    }
    onGraphChange?.(move.graph, move.change);
    announce(
      t(direction === 'undo' ? 'flow.undid' : 'flow.redid', { action: t(ACTION_KEYS[move.action ?? 'update']) }),
    );
  };

  const onShortcut = (event: KeyboardEvent<HTMLElement>) => {
    if (!historyOn || event.defaultPrevented || isEditableTarget(event.target)) return;
    const direction = historyShortcut(event);
    if (!direction) return;
    event.preventDefault();
    stepHistory(direction);
  };

  const addNode = (item: PaletteItem) => {
    seq.current += 1;
    let suffix = 1;
    while (nodes.some((node) => node.id === `${item.kind}-${suffix}`)) suffix += 1;
    const id = `${item.kind}-${suffix}`;
    const right = nodes.reduce((max, n) => Math.max(max, n.position.x), -256);
    const slim = item.kind === 'trigger' || item.kind === 'router';
    const node: FlowNode = {
      id,
      type: item.kind,
      position: { x: right + 256, y: 112 + (seq.current % 3) * 32 },
      width: 208,
      height: slim ? 56 : 90,
      selected: true,
      data: { title: `New ${item.title.toLowerCase()}`, subtitle: item.description },
    };
    const next = [...nodes.map((n) => (n.selected ? { ...n, selected: false } : n)), node];
    setNodes(next);
    commit(cleanFlowGraph({ nodes: next, edges }), { type: 'add', nodeIds: [id], edgeIds: [] });
  };

  const updateNode = (id: string, patch: Partial<FlowNodeData>) => {
    const next = nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
    setNodes(next);
    commit(
      cleanFlowGraph({ nodes: next, edges }),
      { type: 'update', nodeIds: [id], edgeIds: [] },
      `update:${id}:${editBatch.current}`,
    );
  };

  const deleteNode = (id: string) => {
    void flow.current?.deleteElements({ nodes: [{ id }] });
  };

  const commitLog = (next: ConsoleEntry[]) => {
    latestLog.current = next;
    if (consoleEntries === undefined) setInnerLog(next);
    onConsoleChange?.(next);
  };

  const simulate = (n: number): ConsoleEntry[] => {
    const ordered = [...nodes].sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);
    const t = clock();
    return [
      { id: `run-${n}-start`, time: t, level: 'info', message: `Run #${n} started · ${nodes.length} nodes` },
      ...ordered.map<ConsoleEntry>((node, i) => ({
        id: `run-${n}-${node.id}`,
        time: t,
        level: node.data.tone === 'failed' ? 'error' : node.data.tone === 'degraded' ? 'warn' : 'success',
        message: `${node.data.title} ${node.data.tone === 'failed' ? 'failed' : 'completed'} in ${40 + ((i * 37) % 160)}ms`,
      })),
      { id: `run-${n}-end`, time: t, level: 'info', message: `Run #${n} finished` },
    ];
  };

  const run = async () => {
    runs.current += 1;
    const n = runs.current;
    const result = onRun?.({ nodes, edges });
    let added: ConsoleEntry[];
    if (result instanceof Promise) {
      setRunning(true);
      try {
        added = (await result) ?? simulate(n);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        added = [{ id: `run-${n}-error`, time: clock(), level: 'error', message: `Run #${n} failed: ${message}` }];
      } finally {
        setRunning(false);
      }
    } else {
      added = result ?? simulate(n);
    }
    commitLog([...latestLog.current, ...added]);
  };

  const clearLog = () => {
    onConsoleClear?.();
    commitLog([]);
  };

  const connections = useConnections(
    nodes,
    edges,
    (edge) => {
      const next = [...edges, edge];
      setEdges(next);
      commit(cleanFlowGraph({ nodes, edges: next }), { type: 'connect', nodeIds: [], edgeIds: [edge.id] });
    },
    {
      onConnect: onConnected,
      onConnectEdge,
      isValidConnection,
      onConnectionRejected,
    },
  );

  const issues = validationIssues ?? NO_ISSUES;
  const displayedNodes = useDecoratedNodes(nodes, issues, nodeStatus, runMode);
  const selectNode = (id: string) => {
    setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })));
    // Focus only within this builder; graph ids may repeat across independent canvases.
    const element = root.current?.querySelector<HTMLElement>(`.react-flow__node[data-id="${CSS.escape(id)}"]`);
    element?.focus();
    onNodeSelect?.(id);
  };

  const canvas = (h: number | string) => (
    <FlowCanvas<FlowNode<Kind | FlowNodeKind>, FlowEdge>
      aria-label={`${title} canvas`}
      height={h}
      nodes={displayedNodes}
      edges={edges}
      onInit={(instance) => {
        flow.current = instance;
      }}
      onDelete={({ nodes: deletedNodes, edges: deletedEdges }) => {
        if (runMode) return;
        const nodeIds = deletedNodes.map((node) => node.id);
        const edgeIds = deletedEdges.map((edge) => edge.id);
        const next = {
          nodes: nodes.filter((node) => !nodeIds.includes(node.id)),
          edges: edges.filter((edge) => !edgeIds.includes(edge.id)),
        };
        setNodes(next.nodes);
        setEdges(next.edges);
        focusFallback.request();
        commit(cleanFlowGraph(next), { type: 'delete', nodeIds, edgeIds });
      }}
      onNodesChange={(changes) => {
        onNodesChange(
          runMode ? changes.filter((change) => change.type === 'select' || change.type === 'dimensions') : changes,
        );
        if (runMode) return;
        const moves = changes
          .filter((change) => change.type === 'position')
          .filter((change) => change.dragging === false);
        if (!moves.length) return;
        const next = nodes.map((node) => {
          const move = moves.find((change) => change.id === node.id);
          return move?.type === 'position' && move.position ? { ...node, position: move.position } : node;
        });
        commit(cleanFlowGraph({ nodes: next, edges }), {
          type: 'move',
          nodeIds: moves.map((move) => move.id),
          edgeIds: [],
        });
      }}
      onEdgesChange={(changes) =>
        onEdgesChange(runMode ? changes.filter((change) => change.type === 'select') : changes)
      }
      nodeRenderers={nodeTypes}
      showInteractiveControls={!runMode}
      elementsSelectable
      nodesFocusable
      nodesDraggable={!runMode}
      nodesConnectable={!runMode}
      deleteKeyCode={runMode ? null : 'Backspace'}
      onNodeClick={(_, node) => onNodeSelect?.(node.id)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const element = (event.target as HTMLElement).closest('.react-flow__node');
        const id = element?.getAttribute('data-id');
        if (id) onNodeSelect?.(id);
      }}
      ariaLabelConfig={
        runMode
          ? {
              'node.a11yDescription.default': 'Press enter or space to select a node.',
            }
          : undefined
      }
      onConnect={runMode ? undefined : connections.connect}
      isValidConnection={runMode ? () => false : connections.validate}
      onConnectStart={connections.reset}
      onClickConnectStart={connections.reset}
      onConnectEnd={(_, state) => (state.toNode ? connections.finish() : connections.reset())}
      onClickConnectEnd={connections.finish}
      showMiniMap={wide}
    />
  );
  const palettePanel = <NodePalette items={palette} onAdd={addNode} titleAs={panelAs} />;
  const inspector = (
    <NodeInspector
      node={selected}
      onChange={updateNode}
      onDelete={deleteNode}
      onFieldBlur={() => (editBatch.current += 1)}
      titleAs={panelAs}
    />
  );
  const consolePanel = (
    <div className="flex h-full min-h-0 flex-col">
      <FlowProblems issues={issues} onSelect={selectNode} titleAs={panelAs} />
      <RunConsole entries={log} onClear={clearLog} titleAs={panelAs} />
    </div>
  );

  let body: ReactNode;
  if (runMode) {
    body = (
      <div className="flex flex-col divide-y divide-border">
        {canvas(wide ? height - 180 : 360)}
        <div className="h-40">{consolePanel}</div>
      </div>
    );
  } else if (wide) {
    body = (
      <ResizablePanelGroup direction="vertical" style={{ height }}>
        <ResizablePanel defaultSize={72} minSize={40}>
          <ResizablePanelGroup className="h-full">
            <ResizablePanel defaultSize={18} minSize={12} maxSize={32} collapsible>
              {palettePanel}
            </ResizablePanel>
            <ResizeHandle aria-label="Resize node palette" />
            <ResizablePanel defaultSize={58} minSize={30}>
              {canvas('100%')}
            </ResizablePanel>
            <ResizeHandle aria-label="Resize inspector" />
            <ResizablePanel defaultSize={24} minSize={16} maxSize={40} collapsible>
              {inspector}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizeHandle aria-label="Resize run console" />
        <ResizablePanel defaultSize={28} minSize={12} collapsible>
          {consolePanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  } else {
    body = (
      <div className="flex flex-col divide-y divide-border">
        <div className="max-h-56">{palettePanel}</div>
        {canvas(360)}
        <div>{inspector}</div>
        <div className="h-48">{consolePanel}</div>
      </div>
    );
  }

  const runButton = (
    <Button size="sm" icon={Play} loading={running} onClick={() => void run()}>
      Run
    </Button>
  );

  return (
    <section
      ref={root}
      aria-label={title}
      onKeyDown={onShortcut}
      onFocus={focusFallback.track}
      className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary/35 px-3 py-2">
        <div className="min-w-0">
          <TitleTag className="truncate text-[13.5px] font-semibold text-foreground">{title}</TitleTag>
          <p className="font-mono text-[11px] text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
        {!runMode &&
          (historyOn ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <IconButton
                icon={Undo2}
                label={t('flow.undo')}
                size="sm"
                disabled={!graphHistory.canUndo}
                focusableWhenDisabled
                aria-keyshortcuts="Meta+Z Control+Z"
                onClick={() => stepHistory('undo')}
              />
              <IconButton
                icon={Redo2}
                label={t('flow.redo')}
                size="sm"
                disabled={!graphHistory.canRedo}
                focusableWhenDisabled
                aria-keyshortcuts="Shift+Meta+Z Shift+Control+Z Control+Y"
                onClick={() => stepHistory('redo')}
              />
              {runButton}
            </div>
          ) : (
            runButton
          ))}
      </header>
      {body}
    </section>
  );
}
