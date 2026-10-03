import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Play } from '@gntik-ai/icons';
import { FlowCanvas, useFlowState, type FlowNode, type FlowNodeData } from '@gntik-ai/flow';
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
import { NodeInspector, NodePalette, RunConsole } from './parts';

export type { ConsoleEntry, FlowEdge, PaletteItem } from './fixtures';

export interface FlowBuilderProps {
  title?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  palette?: PaletteItem[];
  /** Initial console output. */
  consoleEntries?: ConsoleEntry[];
  /** Total height of the builder on wide screens (px). */
  height?: number;
  /** Called with the current graph when Run is pressed (the console also logs a simulated run). */
  onRun?: (graph: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  className?: string;
}

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
export function FlowBuilder({
  title = 'Untitled flow',
  nodes: initialNodes = builderNodes,
  edges: initialEdges = builderEdges,
  palette = builderPalette,
  consoleEntries = builderConsole,
  height = 600,
  onRun,
  className,
}: FlowBuilderProps) {
  const wide = useIsWide();
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } = useFlowState<FlowNode, FlowEdge>(
    initialNodes,
    initialEdges,
  );
  const [log, setLog] = useState<ConsoleEntry[]>(consoleEntries);
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

  const run = () => {
    runs.current += 1;
    const n = runs.current;
    onRun?.({ nodes, edges });
    const ordered = [...nodes].sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);
    const t = clock();
    setLog((prev) => [
      ...prev,
      { id: `run-${n}-start`, time: t, level: 'info', message: `Run #${n} started · ${nodes.length} nodes` },
      ...ordered.map<ConsoleEntry>((node, i) => ({
        id: `run-${n}-${node.id}`,
        time: t,
        level: node.data.tone === 'failed' ? 'error' : node.data.tone === 'degraded' ? 'warn' : 'success',
        message: `${node.data.title} ${node.data.tone === 'failed' ? 'failed' : 'completed'} in ${40 + ((i * 37) % 160)}ms`,
      })),
      { id: `run-${n}-end`, time: t, level: 'info', message: `Run #${n} finished` },
    ]);
  };

  const canvas = (h: number | string) => (
    <FlowCanvas<FlowNode, FlowEdge>
      aria-label={`${title} canvas`}
      height={h}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      showMiniMap={wide}
    />
  );
  const palettePanel = <NodePalette items={palette} onAdd={addNode} />;
  const inspector = <NodeInspector node={selected} onChange={updateNode} onDelete={deleteNode} />;
  const consolePanel = <RunConsole entries={log} onClear={() => setLog([])} />;

  let body: ReactNode;
  if (wide) {
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
    <section aria-label={title} className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary/35 px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-[13.5px] font-semibold text-foreground">{title}</h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
        <Button size="sm" icon={Play} onClick={run}>
          Run
        </Button>
      </header>
      {body}
    </section>
  );
}
