/* ============================================================================
   Gntik UI · reactflow.jsx — node canvas ("Flow" group).
   ReactFlow (v11) themed with the brand tokens: service nodes as brand
   cards, green handles and edges, controls/minimap/background on tokens.
   The theme reskin carries everything. Domain: a generic order pipeline.
   Variants: orchestration canvas (interactive) · node types · theming.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useCallback } = window;

/* ── ReactFlow from the global UMD (loaded in index.html) ────────────────── */
const RF = window.ReactFlow || {};
const Flow = RF.ReactFlow || RF.default;
const { Background, Controls, MiniMap, Handle, Position, Panel,
        useNodesState, useEdgesState, addEdge, MarkerType, BackgroundVariant } = RF;
const Frag = React.Fragment;
const BG_DOTS = BackgroundVariant ? BackgroundVariant.Dots : 'dots';

/* ── Brand CSS for ReactFlow — everything points at tokens/brand.css ────────── */
const FLOW_CSS = `
.gu-rf .react-flow { background: transparent; }
.gu-rf .react-flow__pane { cursor: grab; }
.gu-rf .react-flow__pane.dragging { cursor: grabbing; }

/* edges */
.gu-rf .react-flow__edge-path { stroke: hsl(var(--muted-foreground) / .45); stroke-width: 1.5px; }
.gu-rf .react-flow__edge.animated .react-flow__edge-path { stroke: hsl(var(--primary)); stroke-width: 1.75px; }
.gu-rf .react-flow__edge.selected .react-flow__edge-path,
.gu-rf .react-flow__edge:focus .react-flow__edge-path { stroke: hsl(var(--primary)); }
.gu-rf .react-flow__edge-text { fill: hsl(var(--foreground)); font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
.gu-rf .react-flow__edge-textbg { fill: hsl(var(--card)); }
.gu-rf .react-flow__connection-path { stroke: hsl(var(--primary)); stroke-width: 1.75px; }

/* handles */
.gu-rf .react-flow__handle { width: 9px; height: 9px; min-width: 0; min-height: 0; background: hsl(var(--card));
  border: 1.5px solid hsl(var(--muted-foreground) / .55); border-radius: 9999px; transition: background-color .12s, border-color .12s; }
.gu-rf .react-flow__handle:hover,
.gu-rf .react-flow__handle.connectingto,
.gu-rf .react-flow__handle.connectingfrom,
.gu-rf .react-flow__handle.valid { background: hsl(var(--primary)); border-color: hsl(var(--primary)); }

/* node — the selection ring is drawn by the component; drop the native outline */
.gu-rf .react-flow__node { font-family: var(--font-sans); }
.gu-rf .react-flow__node:focus, .gu-rf .react-flow__node:focus-visible { outline: none; }
.gu-rf .react-flow__node.selected { box-shadow: none; }

/* RESET of ReactFlow's built-in types (default/input/output/group): their
   default styles (white background, padding, border) clashed with the brand card
   — the "output" type shares its name with the built-in one and inherited the white box. */
.gu-rf .react-flow__node-default,
.gu-rf .react-flow__node-input,
.gu-rf .react-flow__node-output,
.gu-rf .react-flow__node-group { padding: 0; width: auto; background: transparent;
  border: none; border-radius: 0; color: inherit; box-shadow: none; text-align: left; }

/* "working" border — a green segment travels around the active node's perimeter */
@keyframes gu-rf-run { to { stroke-dashoffset: -100; } }
.gu-rf .gu-rf-run { animation: gu-rf-run 1.8s linear infinite; }
@media (prefers-reduced-motion: reduce) { .gu-rf .gu-rf-run { animation: none; } }

/* controls */
.gu-rf .react-flow__controls { box-shadow: var(--shadow-md); border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md); overflow: hidden; }
.gu-rf .react-flow__controls-button { width: 26px; height: 26px; background: hsl(var(--card));
  color: hsl(var(--foreground)); border-bottom: 1px solid hsl(var(--border)); }
.gu-rf .react-flow__controls-button:hover { background: hsl(var(--secondary)); }
.gu-rf .react-flow__controls-button:last-child { border-bottom: none; }
.gu-rf .react-flow__controls-button svg { fill: currentColor; max-width: 13px; max-height: 13px; }

/* minimap + background */
.gu-rf .react-flow__minimap { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); }
.gu-rf .react-flow__minimap-mask { fill: hsl(var(--muted-foreground) / .12); }
.gu-rf .react-flow__background-pattern circle { fill: hsl(var(--border)); }

/* attribution — subtle, on tokens */
.gu-rf .react-flow__attribution { background: transparent; padding: 2px 5px; }
.gu-rf .react-flow__attribution a { color: hsl(var(--muted-foreground) / .55); font-size: 9px; }
`;

/* ── variant wrapper ────────────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── brand vocabulary for the nodes ─────────────────────────────────────── */
const ICON_BY_KIND = { trigger: 'bolt', agent: 'bot', router: 'flow', output: 'check' };
const CHIP = {
  trigger: 'bg-primary text-primary-foreground',
  agent: 'bg-primary/14 text-primary',
  router: 'bg-secondary text-foreground border border-border',
  output: 'bg-accent text-accent-foreground',
};
/* node status → brand color. Green = active/healthy (never severity);
   amber = degraded; red = failure; violet/rose = needs human intervention. */
const TONES = {
  running:  { label: 'Running',  pill: 'bg-primary/14 text-primary',                   border: 'border-primary/60',   march: true },
  degraded: { label: 'Degraded', pill: 'bg-warning/16 text-warning',                   border: 'border-warning/65' },
  failed:   { label: 'Failed',   pill: 'bg-destructive/15 text-destructive',           border: 'border-destructive/65' },
  paused:   { label: 'Paused',   pill: 'bg-muted-foreground/16 text-muted-foreground', border: null },
  done:     { label: 'Resolved', pill: 'bg-primary/14 text-primary',                   border: 'border-primary/70' },
  handoff:  { label: 'Handoff',  pill: 'bg-category-violet/16 text-category-violet',    border: 'border-category-violet' },
  review:   { label: 'Review',   pill: 'bg-category-rose/16 text-category-rose',        border: 'border-category-rose' },
};

/* ── NodeShell · the brand card (no handles; reused by the node and the gallery) ── */
function NodeShell({ kind = 'agent', icon, title, subtitle, meta, tone, selected }) {
  const t = TONES[tone];
  const running = !!(t && t.march);
  const border = selected
    ? 'border-2 border-primary/60 ring-2 ring-primary/35 shadow-md'
    : (t && t.border)
      ? 'border-2 ' + t.border + ' shadow-sm'   // thick border in the status color
      : 'border border-border shadow-sm';
  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {running && (
        <svg aria-hidden="true" width="100%" height="100%" className="pointer-events-none absolute inset-0 z-10" style={{ overflow: 'visible' }}>
          <rect className="gu-rf-run" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"
            pathLength="100" strokeDasharray="22 78"
            style={{ x: '1.25px', y: '1.25px', width: 'calc(100% - 2.5px)', height: 'calc(100% - 2.5px)', rx: '9px' }} />
        </svg>)}
      <div style={{ width: '100%', height: '100%' }}
        className={"flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow " + border}>
        <div className="flex flex-1 items-center gap-2.5 px-3">
          <span className={"w-8 h-8 rounded-lg grid place-items-center shrink-0 " + (CHIP[kind] || CHIP.agent)}>
            <Icon name={icon || ICON_BY_KIND[kind] || 'box'} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-sans font-semibold text-[12.5px] leading-tight text-foreground truncate">{title}</div>
            {subtitle && <div className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {(meta || t) && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/70 bg-secondary/25">
            {meta ? <span className="font-mono text-[10px] text-muted-foreground truncate">{meta}</span> : <span />}
            {t && (
              <span className={"inline-flex items-center gap-1 h-[18px] px-1.5 rounded font-mono text-[9.5px] font-semibold shrink-0 " + t.pill}>
                <span className={"w-1.5 h-1.5 rounded-full bg-current " + (running ? 'animate-pulse' : '')} />{t.label}
              </span>)}
          </div>)}
      </div>
    </div>
  );
}

/* ── node types (handles by role) ───────────────────────────────────────── */
function TriggerNode({ data, selected }) {
  return (<div className="relative" style={{ width: '100%', height: '100%' }}>
    <NodeShell kind="trigger" icon={data.icon} title={data.title} subtitle={data.subtitle} selected={selected} />
    <Handle type="source" position={Position.Right} />
  </div>);
}
function AgentNode({ data, selected }) {
  return (<div className="relative" style={{ width: '100%', height: '100%' }}>
    <Handle type="target" position={Position.Left} />
    <NodeShell kind="agent" icon={data.icon} title={data.title} subtitle={data.subtitle} meta={data.meta} tone={data.tone} selected={selected} />
    <Handle type="source" position={Position.Right} />
  </div>);
}
function RouterNode({ data, selected }) {
  return (<div className="relative" style={{ width: '100%', height: '100%' }}>
    <Handle type="target" position={Position.Left} />
    <NodeShell kind="router" icon={data.icon || 'flow'} title={data.title} subtitle={data.subtitle} selected={selected} />
    <Handle type="source" position={Position.Right} />
  </div>);
}
function OutputNode({ data, selected }) {
  return (<div className="relative" style={{ width: '100%', height: '100%' }}>
    <Handle type="target" position={Position.Left} />
    <NodeShell kind="output" icon={data.icon} title={data.title} subtitle={data.subtitle} tone={data.tone} selected={selected} />
  </div>);
}
const NODE_TYPES = { trigger: TriggerNode, agent: AgentNode, router: RouterNode, output: OutputNode };

/* ── arrow markers (color = token, theme-reactive) ─────────────────────── */
const arrowMuted = MarkerType ? { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--muted-foreground))' } : undefined;
const arrowOn = MarkerType ? { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--primary))' } : undefined;

/* ── pipeline flow data ─────────────────────────────────────────────────── */
const HERO_NODES = [
  { id: 'trig',     type: 'trigger', position: { x: 0,    y: 168 }, style: { width: 208, height: 56 }, data: { title: 'Order event', subtitle: 'webhook · /v1/hooks', icon: 'bolt' } },
  { id: 'triage',   type: 'agent',   position: { x: 256,  y: 152 }, style: { width: 208, height: 90 }, data: { title: 'order-validator', subtitle: 'eu-west-1',  meta: 'node 24', tone: 'running' } },
  { id: 'router',   type: 'router',  position: { x: 520,  y: 168 }, style: { width: 208, height: 56 }, data: { title: 'Order router',   subtitle: '4 routes',   icon: 'flow' } },
  { id: 'billing',  type: 'agent',   position: { x: 800,  y: 32  }, style: { width: 208, height: 90 }, data: { title: 'payment-service', subtitle: 'us-east-1', meta: 'go 1.24',  tone: 'degraded' } },
  { id: 'kb',       type: 'agent',   position: { x: 800,  y: 176 }, style: { width: 208, height: 90 }, data: { title: 'inventory-sync', subtitle: 'ap-south-1', meta: 'python 3.13', tone: 'failed' } },
  { id: 'escalate', type: 'output',  position: { x: 800,  y: 320 }, style: { width: 208, height: 90 }, data: { title: 'Manual review',  subtitle: 'handoff → human', icon: 'user',  tone: 'handoff' } },
  { id: 'resolve',  type: 'output',  position: { x: 1084, y: 112 }, style: { width: 208, height: 90 }, data: { title: 'Fulfill',        subtitle: 'order.complete',  icon: 'check', tone: 'done' } },
];
const HERO_EDGES = [
  { id: 'e1', source: 'trig',    target: 'triage',   animated: true, label: 'event',     markerEnd: arrowOn },
  { id: 'e2', source: 'triage',  target: 'router',   animated: true, label: 'valid',     markerEnd: arrowOn },
  { id: 'e3', source: 'router',  target: 'billing',  label: 'payment',   markerEnd: arrowMuted },
  { id: 'e4', source: 'router',  target: 'kb',       label: 'stock',     markerEnd: arrowMuted },
  { id: 'e5', source: 'router',  target: 'escalate', label: 'flagged',   markerEnd: arrowMuted },
  { id: 'e6', source: 'billing', target: 'resolve',  markerEnd: arrowMuted },
  { id: 'e7', source: 'kb',      target: 'escalate', markerEnd: arrowMuted },
];

/* ── legend + hint (canvas Panels) ──────────────────────────────────────── */
function HeroLegend() {
  const rows = [['trigger', 'Trigger'], ['agent', 'Service'], ['router', 'Router'], ['output', 'Output']];
  return (
    <div className="rounded-md border border-border bg-card/90 px-3 py-2.5 shadow-sm" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-2">order-pipeline · flow</div>
      <div className="flex flex-col gap-1.5">
        {rows.map(([k, l]) => (
          <div key={k} className="flex items-center gap-2">
            <span className={"w-4 h-4 rounded grid place-items-center shrink-0 " + (CHIP[k] || CHIP.agent)}><Icon name={ICON_BY_KIND[k]} size={10} /></span>
            <span className="text-[11.5px] text-foreground">{l}</span>
          </div>))}
      </div>
    </div>
  );
}
function HeroHint() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/90 px-2.5 py-1.5 shadow-sm font-mono text-[10px] text-muted-foreground" style={{ backdropFilter: 'blur(6px)' }}>
      <Icon name="finger" size={12} className="text-primary" />drag · connect · zoom
    </div>
  );
}

/* ── 1 · Orchestration canvas (interactive) ─────────────────────────────── */
function OrchestrationCanvas() {
  const [nodes, , onNodesChange] = useNodesState(HERO_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(HERO_EDGES);
  const onConnect = useCallback(
    (p) => setEdges((eds) => addEdge({ ...p, type: 'smoothstep', animated: true, markerEnd: arrowOn }, eds)),
    [setEdges]);
  const mini = useCallback((n) => {
    const tn = n.data && n.data.tone;
    if (tn === 'failed') return 'hsl(var(--destructive))';
    if (tn === 'degraded') return 'hsl(var(--warning))';
    if (tn === 'handoff') return 'hsl(var(--category-violet))';
    if (tn === 'review') return 'hsl(var(--category-rose))';
    if (n.type === 'router') return 'hsl(var(--muted-foreground))';
    return 'hsl(var(--primary))';
  }, []);
  return (
    <div className="gu-rf relative h-[500px] w-full bg-background">
      <Flow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        defaultEdgeOptions={{ type: 'smoothstep', markerEnd: arrowMuted }}
        snapToGrid snapGrid={[16, 16]} fitView fitViewOptions={{ padding: 0.1, minZoom: 0.45, maxZoom: 1 }}
        minZoom={0.3} maxZoom={1.75}>
        <Background variant={BG_DOTS} gap={20} size={1} color="hsl(var(--border))" />
        <Controls />
        <MiniMap pannable zoomable nodeColor={mini} nodeStrokeWidth={0} nodeBorderRadius={3} />
        <Panel position="top-left"><HeroLegend /></Panel>
        <Panel position="top-right"><HeroHint /></Panel>
      </Flow>
    </div>
  );
}

/* ── 2 · Node types (compact, no zoom/pan) ──────────────────────────────── */
const TYPE_NODES = [
  { id: 't', type: 'trigger', position: { x: 0,   y: 30 }, style: { width: 208, height: 56 }, data: { title: 'Trigger', subtitle: 'incoming event', icon: 'bolt' } },
  { id: 'a', type: 'agent',   position: { x: 252, y: 18 }, style: { width: 208, height: 90 }, data: { title: 'Service', subtitle: 'processing step', meta: 'node 24', tone: 'running' } },
  { id: 'r', type: 'router',  position: { x: 516, y: 30 }, style: { width: 208, height: 56 }, data: { title: 'Router',  subtitle: 'conditional branch', icon: 'flow' } },
  { id: 'o', type: 'output',  position: { x: 780, y: 30 }, style: { width: 208, height: 90 }, data: { title: 'Output',  subtitle: 'action · output', icon: 'check', tone: 'done' } },
];
const TYPE_EDGES = [
  { id: 'x1', source: 't', target: 'a', animated: true, label: 'in', markerEnd: arrowOn },
  { id: 'x2', source: 'a', target: 'r', markerEnd: arrowMuted },
  { id: 'x3', source: 'r', target: 'o', label: 'match', markerEnd: arrowMuted },
];
function NodeTypesFlow() {
  const [nodes, , onNodesChange] = useNodesState(TYPE_NODES);
  const [edges] = useEdgesState(TYPE_EDGES);
  return (
    <div className="gu-rf h-[230px] w-full bg-background">
      <Flow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodesChange={onNodesChange}
        defaultEdgeOptions={{ type: 'smoothstep', markerEnd: arrowMuted }}
        fitView fitViewOptions={{ padding: 0.22 }}
        nodesConnectable={false} elementsSelectable={false} panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false}
        zoomOnDoubleClick={false} panOnScroll={false} preventScrolling={false}
        proOptions={{ hideAttribution: true }}>
        <Background variant={BG_DOTS} gap={18} size={1} color="hsl(var(--border))" />
      </Flow>
    </div>
  );
}

/* ── 3 · Brand theming (class → token reference) ───────────────────────── */
const THEME_MAP = [
  ['.react-flow',                 'bg-border',                'Transparent background · dots in border'],
  ['.react-flow__node',           'bg-card',                  'Card + border; ring-primary when selected'],
  ['.gu-rf-run · active node',    'bg-primary',               'Green segment travelling around the border of a working node'],
  ['status · severity',           'bg-warning',               'Border + pill per status: running green · degraded amber · failed red'],
  ['human intervention',          'bg-category-violet',       'Handoff / review: violet (or rose) border so it stands out'],
  ['.react-flow__handle',         'bg-primary',               'Card at rest → primary on hover / connect'],
  ['.react-flow__edge-path',      'bg-muted-foreground/45',   'muted-foreground; primary when the edge is active'],
  ['.react-flow__edge-text',      'bg-foreground',            'foreground · mono; card-colored box'],
  ['.react-flow__controls-button','bg-card',                  'Card; secondary on hover; icons in foreground'],
  ['.react-flow__minimap',        'bg-card',                  'Card; mask in muted-foreground/12'],
];
function ThemeMap() {
  return (
    <div className="divide-y divide-border">
      {THEME_MAP.map(([sel, swatch, desc]) => (
        <div key={sel} className="flex items-center gap-3 px-4 sm:px-5 py-3">
          <span className={"w-3 h-3 rounded-full shrink-0 ring-1 ring-border " + swatch} />
          <code className="font-mono text-[11.5px] text-foreground shrink-0 w-[210px] truncate">{sel}</code>
          <span className="text-[12.5px] text-muted-foreground" style={{ textWrap: 'pretty' }}>{desc}</span>
        </div>))}
    </div>
  );
}

/* ── no library (defensive fallback) ────────────────────────────────────── */
function NoLib() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 px-8 py-14 text-center">
      <span className="w-12 h-12 rounded-xl bg-accent text-accent-foreground inline-flex items-center justify-center mb-3"><Icon name="flowGraph" size={22} /></span>
      <div className="font-sans font-semibold text-[15px] text-foreground">ReactFlow failed to load</div>
      <p className="text-[13px] text-muted-foreground mt-1.5">Check that the <span className="font-mono">reactflow@11</span> UMD is included in <span className="font-mono">index.html</span>.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_CANVAS = `import ReactFlow, {
  Background, Controls, MiniMap, Panel,
  useNodesState, useEdgesState, addEdge, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './reactflow-brand.css';            // overrides → brand tokens

const nodeTypes = { trigger: TriggerNode, agent: AgentNode, router: RouterNode, output: OutputNode };
const arrow = { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--muted-foreground))' };

function OrchestrationCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (p) => setEdges((eds) => addEdge(
      { ...p, type: 'smoothstep', animated: true, markerEnd: { ...arrow, color: 'hsl(var(--primary))' } }, eds)),
    [setEdges]);

  return (
    <div className="gu-rf h-[470px] rounded-lg border border-border bg-background">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        defaultEdgeOptions={{ type: 'smoothstep', markerEnd: arrow }}
        snapToGrid snapGrid={[16, 16]} fitView>
        <Background variant="dots" gap={20} size={1} color="hsl(var(--border))" />
        <Controls />
        <MiniMap pannable zoomable nodeColor={miniColor} nodeStrokeWidth={0} />
        <Panel position="top-left"><Legend /></Panel>
      </ReactFlow>
    </div>
  );
}`;

const CODE_NODE = `import { Handle, Position } from 'reactflow';

// Node status → brand color: green active · amber degraded · red failure;
// violet/rose = needs human intervention. Primary is never severity.
const TONES = {
  running:  { label: 'Running',  pill: 'bg-primary/14 text-primary',                border: 'border-primary/60', march: true },
  degraded: { label: 'Degraded', pill: 'bg-warning/16 text-warning',                border: 'border-warning/65' },
  failed:   { label: 'Failed',   pill: 'bg-destructive/15 text-destructive',        border: 'border-destructive/65' },
  handoff:  { label: 'Handoff',  pill: 'bg-category-violet/16 text-category-violet', border: 'border-category-violet' },
};

// Service node — brand card with handles (target left · source right).
function AgentNode({ data, selected }) {
  const t = TONES[data.tone];
  const border = selected ? 'border-2 border-primary/60 ring-2 ring-primary/35'
    : t ? 'border-2 ' + t.border : 'border border-border';
  return (
    <div className="relative w-[208px]">
      {t?.march && <RunningBorder />}            {/* SVG rect with pathLength=100 that travels the border */}
      <Handle type="target" position={Position.Left} />
      <div className={\`flex flex-col rounded-lg bg-card overflow-hidden shadow-sm \${border}\`}>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary grid place-items-center"><BotIcon size={16} /></span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-foreground truncate">{data.title}</div>
            <div className="font-mono text-[10px] text-muted-foreground truncate">{data.subtitle}</div>
          </div>
        </div>
        {t && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/70 bg-secondary/25">
            <span className="font-mono text-[10px] text-muted-foreground">{data.model}</span>
            <span className={\`inline-flex items-center gap-1 h-[18px] px-1.5 rounded font-mono text-[9.5px] font-semibold \${t.pill}\`}>{t.label}</span>
          </div>)}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}`;

const CODE_THEME = `/* reactflow-brand.css — themes ReactFlow with the brand tokens.
   Load it AFTER reactflow/dist/style.css. Wrap the canvas in .gu-rf.
   Not a single hardcoded color: the theme switch reskins everything. */
.gu-rf .react-flow { background: transparent; }

/* RESET of the built-in types (default/input/output/group) — avoids the default
   white box when your type has the same name as a built-in one ("output"). */
.gu-rf .react-flow__node-default, .gu-rf .react-flow__node-input,
.gu-rf .react-flow__node-output, .gu-rf .react-flow__node-group {
  padding: 0; width: auto; background: transparent; border: none; border-radius: 0; }

/* edges */
.gu-rf .react-flow__edge-path { stroke: hsl(var(--muted-foreground) / .45); stroke-width: 1.5px; }
.gu-rf .react-flow__edge.animated .react-flow__edge-path { stroke: hsl(var(--primary)); }
.gu-rf .react-flow__edge.selected .react-flow__edge-path { stroke: hsl(var(--primary)); }
.gu-rf .react-flow__edge-text { fill: hsl(var(--foreground)); font-family: var(--font-mono); }
.gu-rf .react-flow__edge-textbg { fill: hsl(var(--card)); }
.gu-rf .react-flow__connection-path { stroke: hsl(var(--primary)); }

/* handles */
.gu-rf .react-flow__handle { width: 9px; height: 9px; background: hsl(var(--card));
  border: 1.5px solid hsl(var(--muted-foreground) / .55); }
.gu-rf .react-flow__handle:hover,
.gu-rf .react-flow__handle.connectingfrom { background: hsl(var(--primary)); border-color: hsl(var(--primary)); }

/* controls */
.gu-rf .react-flow__controls { border: 1px solid hsl(var(--border)); border-radius: var(--radius-md);
  box-shadow: var(--shadow-md); overflow: hidden; }
.gu-rf .react-flow__controls-button { background: hsl(var(--card)); color: hsl(var(--foreground));
  border-bottom: 1px solid hsl(var(--border)); }
.gu-rf .react-flow__controls-button:hover { background: hsl(var(--secondary)); }
.gu-rf .react-flow__controls-button svg { fill: currentColor; }

/* minimap + dot background */
.gu-rf .react-flow__minimap { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); }
.gu-rf .react-flow__minimap-mask { fill: hsl(var(--muted-foreground) / .12); }
.gu-rf .react-flow__background-pattern circle { fill: hsl(var(--border)); }

/* "working" node — a green segment travels the border (rect with pathLength=100) */
@keyframes gu-rf-run { to { stroke-dashoffset: -100; } }
.gu-rf .gu-rf-run { animation: gu-rf-run 1.8s linear infinite; }`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ReactFlowSection() {
  return (
    <div>
      <style>{FLOW_CSS}</style>
      <SectionHead kicker="Flow" title="ReactFlow" status="done"
        intro="An orchestration canvas built on ReactFlow and themed with the brand tokens: each node is a brand card with its handles, active edges are green and the background, controls and minimap are painted on tokens. Drag the nodes, connect them by pulling from one handle to another, and zoom/pan the canvas — everything reskins with the theme." />

      {!Flow ? <NoLib /> : (
        <div>
          <Variant title="Orchestration canvas"
            desc="An order pipeline: an event comes in, a service validates it, the router opens routes and it ends in an output. Each node's border reflects its status — green while running (with a segment travelling the border), amber when degraded, red when failing — and steps that need human intervention are highlighted in violet. Drag any node, pull from a handle to create an edge, and zoom/pan."
            code={CODE_CANVAS}>
            <OrchestrationCanvas />
          </Variant>

          <Variant title="Node types & handles"
            desc="The four canvas pieces, chained: trigger (source only), service (target + source, with runtime and status), router (conditional branch) and output (target only). Handles are the connection points; the first edge is animated to mark the active flow and the last one has a label. Zoom/pan is locked here — only the nodes can be dragged."
            code={CODE_NODE}>
            <NodeTypesFlow />
          </Variant>

          <Variant title="Brand theming"
            desc="ReactFlow ships its own classes; here each one is rewritten against the tokens. There are no hardcoded colors, so the canvas changes theme with the rest of the catalog. Load this CSS after reactflow/dist/style.css and wrap the canvas in .gu-rf."
            code={CODE_THEME}>
            <ThemeMap />
          </Variant>
        </div>)}
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['reactflow'] = ReactFlowSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
