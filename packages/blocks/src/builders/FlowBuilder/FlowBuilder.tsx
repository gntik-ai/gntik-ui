import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Play } from '@gntik-ai/icons';
import { FlowCanvas, useFlowState, type FlowNode, type FlowNodeData, type FlowNodeKind } from '@gntik-ai/flow';
import { Button, ResizablePanel, ResizablePanelGroup, ResizeHandle, cn } from '@gntik-ai/ui';
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
import { FlowProblems } from './problems';
import { NodeInspector, NodePalette, RunConsole } from './parts';

export type { ConsoleEntry, FlowEdge, PaletteItem } from './fixtures';
/** Graph types re-exported so apps can type nodes without depending on @gntik-ai/flow. */
export type { FlowNode, FlowNodeData, FlowNodeKind, FlowTone } from '@gntik-ai/flow';

export type { FlowConnection, FlowConnectionRejection, FlowValidationIssue } from './extensions';
export type { FlowNodeRenderer, FlowHandle, FlowNodeRenderProps } from '@gntik-ai/flow';

export interface FlowBuilderProps<Kind extends string = FlowNodeKind> extends FlowBuilderExtensions {
  title?: string;
  nodes?: FlowNode<Kind | FlowNodeKind>[];
  edges?: FlowEdge[];
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
  onRun?: (graph: { nodes: FlowNode<Kind | FlowNodeKind>[]; edges: FlowEdge[] }) => FlowRunResult | Promise<FlowRunResult>;
  className?: string;
}

/** What `onRun` may return: entries to append, or nothing for the simulated run. */
export type FlowRunResult = ConsoleEntry[] | void | undefined;

const NO_ISSUES: NonNullable<FlowBuilderProps['validationIssues']> = [];
const WIDE_QUERY = '(min-width: 768px)';

function subscribeWide(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener?.('change', onChange);
  return () => mql.removeEventListener?.('change', onChange);
}

function useIsWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(WIDE_QUERY).matches : true),
    () => true,
  );
}

function clock() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

/**
 * Visual flow builder: node palette, brand React Flow canvas (drag, connect, zoom/pan),
 * inspector for the selected node and a run console, in resizable panels. On small screens
 * the panels stack.
 */
export function FlowBuilder<Kind extends string = FlowNodeKind>({
  title = 'Untitled flow',
  nodes: initialNodes = builderNodes,
  edges: initialEdges = builderEdges,
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
}: FlowBuilderProps<Kind>) {
  const runMode = mode === 'run';
  const root = useRef<HTMLElement>(null);
  const wide = useIsWide();
  const panelAs = TitleTag === 'h2' ? 'h3' : TitleTag === 'h3' ? 'h4' : 'h5';
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect: defaultConnect,
  } = useFlowState<FlowNode<Kind | FlowNodeKind>, FlowEdge>(initialNodes, initialEdges);
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

  const addNode = (item: PaletteItem) => {
    seq.current += 1;
    const id = `${item.kind}-${seq.current}`;
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
    setNodes((ns) => [...ns.map((n) => (n.selected ? { ...n, selected: false } : n)), node]);
  };

  const updateNode = (id: string, patch: Partial<FlowNodeData>) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  const deleteNode = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
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

  const connections = useConnections(nodes, setEdges, defaultConnect, {
    onConnect: onConnected,
    onConnectEdge,
    isValidConnection,
    onConnectionRejected,
  });

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
      onNodesChange={(changes) =>
        onNodesChange(
          runMode ? changes.filter((change) => change.type === 'select' || change.type === 'dimensions') : changes,
        )
      }
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
  const inspector = <NodeInspector node={selected} onChange={updateNode} onDelete={deleteNode} titleAs={panelAs} />;
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

  return (
    <section
      ref={root}
      aria-label={title}
      className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary/35 px-3 py-2">
        <div className="min-w-0">
          <TitleTag className="truncate text-[13.5px] font-semibold text-foreground">{title}</TitleTag>
          <p className="font-mono text-[11px] text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
        {!runMode && (
          <Button size="sm" icon={Play} loading={running} onClick={() => void run()}>
            Run
          </Button>
        )}
      </header>
      {body}
    </section>
  );
}
