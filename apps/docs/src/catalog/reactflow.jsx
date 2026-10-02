/* ============================================================================
   Gntik UI · reactflow.jsx — lienzo de nodos (grupo "Flow").
   ReactFlow (v11) tematizado con los tokens de marca: nodos de agente como
   cards de musematic, handles y edges en verde, controles/minimap/fondo sobre
   tokens. El reskin del tema lo arrastra todo. Dominio: orquestación del Fleet.
   Variantes: lienzo de orquestación (interactivo) · tipos de nodo · tematizado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useCallback } = window;

/* ── ReactFlow desde el UMD global (cargado en index.html) ───────────────── */
const RF = window.ReactFlow || {};
const Flow = RF.ReactFlow || RF.default;
const { Background, Controls, MiniMap, Handle, Position, Panel,
        useNodesState, useEdgesState, addEdge, MarkerType, BackgroundVariant } = RF;
const Frag = React.Fragment;
const BG_DOTS = BackgroundVariant ? BackgroundVariant.Dots : 'dots';

/* ── CSS de marca para ReactFlow — todo apunta a tokens/brand.css ─────────── */
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

/* nodo — el ring de selección lo dibuja el componente; quitamos el outline nativo */
.gu-rf .react-flow__node { font-family: var(--font-sans); }
.gu-rf .react-flow__node:focus, .gu-rf .react-flow__node:focus-visible { outline: none; }
.gu-rf .react-flow__node.selected { box-shadow: none; }

/* RESET de los tipos integrados de ReactFlow (default/input/output/group): sus
   estilos por defecto (fondo blanco, padding, borde) chocaban con la card de marca
   — el tipo "output" coincide de nombre con el integrado y heredaba el cuadro blanco. */
.gu-rf .react-flow__node-default,
.gu-rf .react-flow__node-input,
.gu-rf .react-flow__node-output,
.gu-rf .react-flow__node-group { padding: 0; width: auto; background: transparent;
  border: none; border-radius: 0; color: inherit; box-shadow: none; text-align: left; }

/* borde "trabajando" — un segmento verde recorre el perímetro del nodo activo */
@keyframes gu-rf-run { to { stroke-dashoffset: -100; } }
.gu-rf .gu-rf-run { animation: gu-rf-run 1.8s linear infinite; }
@media (prefers-reduced-motion: reduce) { .gu-rf .gu-rf-run { animation: none; } }

/* controles */
.gu-rf .react-flow__controls { box-shadow: var(--shadow-md); border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md); overflow: hidden; }
.gu-rf .react-flow__controls-button { width: 26px; height: 26px; background: hsl(var(--card));
  color: hsl(var(--foreground)); border-bottom: 1px solid hsl(var(--border)); }
.gu-rf .react-flow__controls-button:hover { background: hsl(var(--secondary)); }
.gu-rf .react-flow__controls-button:last-child { border-bottom: none; }
.gu-rf .react-flow__controls-button svg { fill: currentColor; max-width: 13px; max-height: 13px; }

/* minimap + fondo */
.gu-rf .react-flow__minimap { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); }
.gu-rf .react-flow__minimap-mask { fill: hsl(var(--muted-foreground) / .12); }
.gu-rf .react-flow__background-pattern circle { fill: hsl(var(--border)); }

/* atribución — discreta, sobre tokens */
.gu-rf .react-flow__attribution { background: transparent; padding: 2px 5px; }
.gu-rf .react-flow__attribution a { color: hsl(var(--muted-foreground) / .55); font-size: 9px; }
`;

/* ── envoltura de variante ───────────────────────────────────────────────── */
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

/* ── vocabulario de marca para los nodos ─────────────────────────────────── */
const ICON_BY_KIND = { trigger: 'bolt', agent: 'bot', router: 'flow', output: 'check' };
const CHIP = {
  trigger: 'bg-primary text-primary-foreground',
  agent: 'bg-primary/14 text-primary',
  router: 'bg-secondary text-foreground border border-border',
  output: 'bg-accent text-accent-foreground',
};
/* estado del nodo → color corporativo. Verde = activo/healthy (nunca severidad);
   ámbar = degradado; rojo = fallo; violet/rose = requiere intervención humana. */
const TONES = {
  running:  { label: 'Running',  pill: 'bg-primary/14 text-primary',                   border: 'border-primary/60',   march: true },
  degraded: { label: 'Degraded', pill: 'bg-warning/16 text-warning',                   border: 'border-warning/65' },
  failed:   { label: 'Failed',   pill: 'bg-destructive/15 text-destructive',           border: 'border-destructive/65' },
  paused:   { label: 'Paused',   pill: 'bg-muted-foreground/16 text-muted-foreground', border: null },
  done:     { label: 'Resuelto', pill: 'bg-primary/14 text-primary',                   border: 'border-primary/70' },
  handoff:  { label: 'Handoff',  pill: 'bg-category-violet/16 text-category-violet',    border: 'border-category-violet' },
  review:   { label: 'Revisión', pill: 'bg-category-rose/16 text-category-rose',        border: 'border-category-rose' },
};

/* ── NodeShell · la card de marca (sin handles; la reusa el nodo y la galería) ── */
function NodeShell({ kind = 'agent', icon, title, subtitle, meta, tone, selected }) {
  const t = TONES[tone];
  const running = !!(t && t.march);
  const border = selected
    ? 'border-2 border-primary/60 ring-2 ring-primary/35 shadow-md'
    : (t && t.border)
      ? 'border-2 ' + t.border + ' shadow-sm'   // borde grueso del color del estado
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

/* ── tipos de nodo (handles según el rol) ────────────────────────────────── */
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

/* ── marcadores de flecha (color = token, reactivo al tema) ──────────────── */
const arrowMuted = MarkerType ? { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--muted-foreground))' } : undefined;
const arrowOn = MarkerType ? { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--primary))' } : undefined;

/* ── datos del flujo del Fleet ───────────────────────────────────────────── */
const HERO_NODES = [
  { id: 'trig',     type: 'trigger', position: { x: 0,    y: 168 }, style: { width: 208, height: 56 }, data: { title: 'Inbound ticket', subtitle: 'webhook · /v1/hooks', icon: 'bolt' } },
  { id: 'triage',   type: 'agent',   position: { x: 256,  y: 152 }, style: { width: 208, height: 90 }, data: { title: 'support-triage', subtitle: 'eu-west-1',  meta: 'claude-sonnet-4', tone: 'running' } },
  { id: 'router',   type: 'router',  position: { x: 520,  y: 168 }, style: { width: 208, height: 56 }, data: { title: 'Intent router',  subtitle: '4 rutas',    icon: 'flow' } },
  { id: 'billing',  type: 'agent',   position: { x: 800,  y: 32  }, style: { width: 208, height: 90 }, data: { title: 'billing-bot',    subtitle: 'us-east-1',  meta: 'claude-haiku-4',  tone: 'degraded' } },
  { id: 'kb',       type: 'agent',   position: { x: 800,  y: 176 }, style: { width: 208, height: 90 }, data: { title: 'kb-summarizer',  subtitle: 'ap-south-1', meta: 'claude-sonnet-4', tone: 'failed' } },
  { id: 'escalate', type: 'output',  position: { x: 800,  y: 320 }, style: { width: 208, height: 90 }, data: { title: 'Escalate',       subtitle: 'handoff → human', icon: 'user',  tone: 'handoff' } },
  { id: 'resolve',  type: 'output',  position: { x: 1084, y: 112 }, style: { width: 208, height: 90 }, data: { title: 'Resolve',        subtitle: 'ticket.close',    icon: 'check', tone: 'done' } },
];
const HERO_EDGES = [
  { id: 'e1', source: 'trig',    target: 'triage',   animated: true, label: 'ticket',    markerEnd: arrowOn },
  { id: 'e2', source: 'triage',  target: 'router',   animated: true, label: 'intent',    markerEnd: arrowOn },
  { id: 'e3', source: 'router',  target: 'billing',  label: 'refund',    markerEnd: arrowMuted },
  { id: 'e4', source: 'router',  target: 'kb',       label: 'FAQ',       markerEnd: arrowMuted },
  { id: 'e5', source: 'router',  target: 'escalate', label: 'low conf.', markerEnd: arrowMuted },
  { id: 'e6', source: 'billing', target: 'resolve',  markerEnd: arrowMuted },
  { id: 'e7', source: 'kb',      target: 'escalate', markerEnd: arrowMuted },
];

/* ── leyenda + pista (Panels del lienzo) ─────────────────────────────────── */
function HeroLegend() {
  const rows = [['trigger', 'Disparador'], ['agent', 'Agente'], ['router', 'Router'], ['output', 'Salida']];
  return (
    <div className="rounded-md border border-border bg-card/90 px-3 py-2.5 shadow-sm" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-2">support-triage · flujo</div>
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
      <Icon name="finger" size={12} className="text-primary" />arrastra · conecta · zoom
    </div>
  );
}

/* ── 1 · Lienzo de orquestación (interactivo) ────────────────────────────── */
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

/* ── 2 · Tipos de nodo (compacto, sin zoom/pan) ──────────────────────────── */
const TYPE_NODES = [
  { id: 't', type: 'trigger', position: { x: 0,   y: 30 }, style: { width: 208, height: 56 }, data: { title: 'Trigger', subtitle: 'evento de entrada', icon: 'bolt' } },
  { id: 'a', type: 'agent',   position: { x: 252, y: 18 }, style: { width: 208, height: 90 }, data: { title: 'Agent',   subtitle: 'paso del agente', meta: 'claude-sonnet-4', tone: 'running' } },
  { id: 'r', type: 'router',  position: { x: 516, y: 30 }, style: { width: 208, height: 56 }, data: { title: 'Router',  subtitle: 'rama condicional', icon: 'flow' } },
  { id: 'o', type: 'output',  position: { x: 780, y: 30 }, style: { width: 208, height: 90 }, data: { title: 'Output',  subtitle: 'acción · salida', icon: 'check', tone: 'done' } },
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

/* ── 3 · Tematizado de marca (referencia clase → token) ──────────────────── */
const THEME_MAP = [
  ['.react-flow',                 'bg-border',                'Fondo transparente · puntos en border'],
  ['.react-flow__node',           'bg-card',                  'Card + border; ring-primary al seleccionar'],
  ['.gu-rf-run · nodo activo',    'bg-primary',               'Segmento verde que recorre el borde de un nodo trabajando'],
  ['estado · severidad',          'bg-warning',               'Borde + pill por estado: running verde · degraded ámbar · failed rojo'],
  ['intervención humana',         'bg-category-violet',       'Handoff / revisión: borde en violet (o rose) para que resalte'],
  ['.react-flow__handle',         'bg-primary',               'Card en reposo → primary al pasar / conectar'],
  ['.react-flow__edge-path',      'bg-muted-foreground/45',   'muted-foreground; primary si la edge está activa'],
  ['.react-flow__edge-text',      'bg-foreground',            'foreground · mono; recuadro en card'],
  ['.react-flow__controls-button','bg-card',                  'Card; hover en secondary; iconos en foreground'],
  ['.react-flow__minimap',        'bg-card',                  'Card; máscara en muted-foreground/12'],
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

/* ── sin librería (fallback defensivo) ───────────────────────────────────── */
function NoLib() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 px-8 py-14 text-center">
      <span className="w-12 h-12 rounded-xl bg-accent text-accent-foreground inline-flex items-center justify-center mb-3"><Icon name="flowGraph" size={22} /></span>
      <div className="font-sans font-semibold text-[15px] text-foreground">ReactFlow no se cargó</div>
      <p className="text-[13px] text-muted-foreground mt-1.5">Revisa que el UMD de <span className="font-mono">reactflow@11</span> esté incluido en <span className="font-mono">index.html</span>.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_CANVAS = `import ReactFlow, {
  Background, Controls, MiniMap, Panel,
  useNodesState, useEdgesState, addEdge, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './reactflow-brand.css';            // overrides → tokens de marca

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

// Estado del nodo → color de marca: verde activo · ámbar degradado · rojo fallo;
// violet/rose = requiere intervención humana. El primario nunca es severidad.
const TONES = {
  running:  { label: 'Running',  pill: 'bg-primary/14 text-primary',                border: 'border-primary/60', march: true },
  degraded: { label: 'Degraded', pill: 'bg-warning/16 text-warning',                border: 'border-warning/65' },
  failed:   { label: 'Failed',   pill: 'bg-destructive/15 text-destructive',        border: 'border-destructive/65' },
  handoff:  { label: 'Handoff',  pill: 'bg-category-violet/16 text-category-violet', border: 'border-category-violet' },
};

// Nodo de agente — card de marca con handles (target izq · source der).
function AgentNode({ data, selected }) {
  const t = TONES[data.tone];
  const border = selected ? 'border-2 border-primary/60 ring-2 ring-primary/35'
    : t ? 'border-2 ' + t.border : 'border border-border';
  return (
    <div className="relative w-[208px]">
      {t?.march && <RunningBorder />}            {/* rect SVG con pathLength=100 que recorre el borde */}
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

const CODE_THEME = `/* reactflow-brand.css — tematiza ReactFlow con los tokens de marca.
   Cárgalo DESPUÉS de reactflow/dist/style.css. Envuelve el lienzo en .gu-rf.
   No hay un solo color hardcodeado: el switch de tema lo reskinea todo. */
.gu-rf .react-flow { background: transparent; }

/* RESET de los tipos integrados (default/input/output/group) — evita el cuadro
   blanco por defecto cuando tu tipo se llama igual que uno integrado ("output"). */
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

/* controles */
.gu-rf .react-flow__controls { border: 1px solid hsl(var(--border)); border-radius: var(--radius-md);
  box-shadow: var(--shadow-md); overflow: hidden; }
.gu-rf .react-flow__controls-button { background: hsl(var(--card)); color: hsl(var(--foreground));
  border-bottom: 1px solid hsl(var(--border)); }
.gu-rf .react-flow__controls-button:hover { background: hsl(var(--secondary)); }
.gu-rf .react-flow__controls-button svg { fill: currentColor; }

/* minimap + fondo de puntos */
.gu-rf .react-flow__minimap { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); }
.gu-rf .react-flow__minimap-mask { fill: hsl(var(--muted-foreground) / .12); }
.gu-rf .react-flow__background-pattern circle { fill: hsl(var(--border)); }

/* nodo "trabajando" — un segmento verde recorre el borde (rect con pathLength=100) */
@keyframes gu-rf-run { to { stroke-dashoffset: -100; } }
.gu-rf .gu-rf-run { animation: gu-rf-run 1.8s linear infinite; }`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ReactFlowSection() {
  return (
    <div>
      <style>{FLOW_CSS}</style>
      <SectionHead kicker="Flow" title="ReactFlow" status="done"
        intro="El lienzo de orquestación del Fleet, montado sobre ReactFlow y tematizado con los tokens de marca: cada nodo es una card de musematic con sus handles, las edges activas van en verde y el fondo, controles y minimap se pintan sobre tokens. Arrastra los nodos, conéctalos tirando de un handle a otro, y haz zoom/pan sobre el lienzo — todo reskinea con el tema." />

      {!Flow ? <NoLib /> : (
        <div>
          <Variant title="Lienzo de orquestación"
            desc="El flujo real de support-triage: un disparador entra, el agente clasifica, el router abre rutas y cierra en una salida. El borde de cada nodo refleja su estado — verde en ejecución (con un segmento que recorre el borde), ámbar si va degradado, rojo si falla — y los pasos que piden intervención humana se resaltan en violet. Arrastra cualquier nodo, tira de un handle para crear una edge, y haz zoom/pan."
            code={CODE_CANVAS}>
            <OrchestrationCanvas />
          </Variant>

          <Variant title="Tipos de nodo & handles"
            desc="Las cuatro piezas del lienzo, encadenadas: disparador (solo source), agente (target + source, con modelo y estado), router (rama condicional) y salida (solo target). Los handles son los puntos de conexión; la primera edge va animada para marcar el flujo activo y la última lleva etiqueta. Aquí el zoom/pan está fijo — solo se arrastran los nodos."
            code={CODE_NODE}>
            <NodeTypesFlow />
          </Variant>

          <Variant title="Tematizado de marca"
            desc="ReactFlow trae sus propias clases; aquí cada una se reescribe contra los tokens. No hay color hardcodeado, así que el lienzo cambia de tema con el resto del catálogo. Carga este CSS después de reactflow/dist/style.css y envuelve el lienzo en .gu-rf."
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
