/* ============================================================================
   Gntik UI · tooltips.jsx — tooltips (grupo "Overlays").
   El hint efímero que aparece al pasar el ratón o enfocar con teclado.
   Canónico: sólido invertido (bg-foreground) para etiquetas cortas; variante
   "rich" sobre bg-popover para contenido de varias líneas. Posiciones en los 4
   lados, flecha, retardo de apertura y soporte de foco. Dominio musematic.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef } = window;

const Variant = ({ title, desc, code, surface = 'dots', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-5 sm:p-7"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── Tooltip sólido (canónico) ───────────────────────────────────────────── */
const WRAP = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
};
const ARROW = {
  top:    'left-1/2 top-full -translate-x-1/2 -mt-1',
  bottom: 'left-1/2 bottom-full -translate-x-1/2 -mb-1',
  left:   'top-1/2 left-full -translate-y-1/2 -ml-1',
  right:  'top-1/2 right-full -translate-y-1/2 -mr-1',
};

function useHoverIntent(delay = 130) {
  const [open, setOpen] = useState(false);
  const t = useRef(null);
  const show = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(t.current); setOpen(false); };
  return [open, { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide }];
}

function Tooltip({ label, kbd, side = 'top', delay = 130, children }) {
  const [open, bind] = useHoverIntent(delay);
  return (
    <span className="relative inline-flex" {...bind}>
      {children}
      <span role="tooltip"
        className={"pointer-events-none absolute z-30 flex items-center whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[12px] font-medium text-background shadow-md transition-all duration-150 " +
          WRAP[side] + (open ? ' opacity-100 scale-100' : ' opacity-0 scale-95')}>
        {label}
        {kbd && <span className="ml-1.5 rounded bg-background/20 px-1 py-[1px] font-mono text-[10px] tracking-wide text-background/80">{kbd}</span>}
        <span className={"absolute size-2 rotate-45 rounded-[1px] bg-foreground " + ARROW[side]} />
      </span>
    </span>
  );
}

/* ── Tooltip enriquecido (card sobre bg-popover) ─────────────────────────── */
function RichTooltip({ side = 'top', width = 256, delay = 130, children, render }) {
  const [open, bind] = useHoverIntent(delay);
  return (
    <span className="relative inline-flex" {...bind}>
      {children}
      <span role="tooltip" style={{ width }}
        className={"pointer-events-none absolute z-30 rounded-lg border border-border bg-popover p-3 text-left shadow-lg transition-all duration-150 " +
          WRAP[side] + (open ? ' opacity-100 scale-100' : ' opacity-0 scale-95')}>
        {render}
        <span className={"absolute size-2 rotate-45 rounded-[1px] border-b border-r border-border bg-popover " + ARROW[side]} />
      </span>
    </span>
  );
}

/* triggers reutilizados */
const Chip = ({ children }) => (
  <span className="inline-flex h-9 cursor-default items-center rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm">{children}</span>
);
const IconBtn = ({ name, danger }) => (
  <button type="button"
    className={"grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground " +
      (danger ? 'hover:border-destructive/40 hover:text-destructive' : 'hover:border-primary/40')}>
    <Icon name={name} size={16} />
  </button>
);

/* ── 1 · POSICIONES ──────────────────────────────────────────────────────── */
function Positions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      <Tooltip side="top" label="Arriba"><Chip>Top</Chip></Tooltip>
      <Tooltip side="right" label="A la derecha"><Chip>Right</Chip></Tooltip>
      <Tooltip side="bottom" label="Abajo"><Chip>Bottom</Chip></Tooltip>
      <Tooltip side="left" label="A la izquierda"><Chip>Left</Chip></Tooltip>
    </div>
  );
}

/* ── 2 · TOOLBAR DE ICONOS ───────────────────────────────────────────────── */
function IconToolbar() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-sm">
        <Tooltip label="Buscar" kbd="⌘K"><IconBtn name="search" /></Tooltip>
        <Tooltip label="Pausar agente"><IconBtn name="pause" /></Tooltip>
        <Tooltip label="Reintentar run"><IconBtn name="refresh" /></Tooltip>
        <Tooltip label="Descargar logs"><IconBtn name="download" /></Tooltip>
        <span className="mx-0.5 h-5 w-px bg-border" />
        <Tooltip label="Configurar"><IconBtn name="settings" /></Tooltip>
        <Tooltip label="Eliminar"><IconBtn name="trash" danger /></Tooltip>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground/80">cada botón-icono lleva su etiqueta · pasa el ratón o usa Tab</p>
    </div>
  );
}

/* ── 3 · TOOLTIP ENRIQUECIDO ─────────────────────────────────────────────── */
function RichDemo() {
  const richContent = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] font-semibold tracking-tight text-foreground">Coste por 1k tokens</span>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Promedio ponderado de input + output del agente en la ventana seleccionada, antes de descuentos por volumen.
      </p>
      <div className="mt-2 flex items-center gap-1.5 border-t border-border/70 pt-2 font-mono text-[11px] text-muted-foreground">
        <Icon name="refresh" size={12} />Se recalcula cada hora
      </div>
    </>
  );
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="flex items-end gap-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Coste / 1k tok</span>
            <RichTooltip render={richContent}>
              <button type="button" aria-label="Más información" className="grid size-[18px] place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Icon name="info" size={14} />
              </button>
            </RichTooltip>
          </div>
          <div className="mt-1 font-sans text-[28px] font-bold tracking-tight text-foreground tabular-nums">$0.0184</div>
        </div>
        <div className="opacity-90">
          <RichTooltip side="right" width={232} render={(
            <>
              <div className="text-[12.5px] font-semibold tracking-tight text-foreground">support-triage</div>
              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">Claude Sonnet · 14 policies activas · región eu-west.</p>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-primary"><span className="size-1.5 rounded-full bg-primary" />Operativo</div>
            </>
          )}>
            <span className="inline-flex cursor-default items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />support-triage
            </span>
          </RichTooltip>
        </div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground/80">la ⓘ y el chip abren una card con título, descripción y meta</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_TT = `// Tooltip sólido — hover + foco, retardo de apertura, flecha
function Tooltip({ label, side = "top", delay = 130, children }) {
  const [open, setOpen] = useState(false);
  const t = useRef(null);
  const show = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(t.current); setOpen(false); };
  const wrap = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];
  return (
    <span className="relative inline-flex"
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <span role="tooltip"
        className={"pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 " +
          "text-[12px] font-medium text-background shadow-md transition-all duration-150 " + wrap +
          (open ? " opacity-100 scale-100" : " opacity-0 scale-95")}>
        {label}
      </span>
    </span>
  );
}`;

const CODE_TOOL = `// Botón-icono con etiqueta + atajo
<Tooltip label="Buscar" kbd="⌘K">
  <button className="grid size-9 place-items-center rounded-md border border-border bg-card
                     text-muted-foreground shadow-sm hover:text-foreground hover:border-primary/40">
    <SearchIcon />
  </button>
</Tooltip>`;

const CODE_RICH = `// Tooltip enriquecido — card sobre bg-popover para varias líneas
<RichTooltip render={
  <>
    <div className="text-[12.5px] font-semibold text-foreground">Coste por 1k tokens</div>
    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
      Promedio ponderado de input + output del agente en la ventana seleccionada.
    </p>
    <div className="mt-2 flex items-center gap-1.5 border-t border-border/70 pt-2
                    font-mono text-[11px] text-muted-foreground">
      <RefreshIcon /> Se recalcula cada hora
    </div>
  </>
}>
  <button aria-label="Más información"
    className="grid size-[18px] place-items-center rounded-full text-muted-foreground
               hover:bg-secondary hover:text-foreground"><InfoIcon /></button>
</RichTooltip>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function TooltipsSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Tooltips" status="done"
        intro="El hint efímero: una etiqueta corta que aparece al pasar el ratón o enfocar con teclado, sin robar el foco ni ocupar layout. El canónico es sólido invertido (bg-foreground) para nombres y atajos; cuando hace falta explicar algo en varias líneas, la variante enriquecida usa una card sobre bg-popover. Ambos abren con un pequeño retardo, traen flecha y responden también a Tab — no solo al ratón." />

      <Variant title="Posiciones"
        desc="El mismo tooltip colocado arriba, a la derecha, abajo o a la izquierda del trigger. Abre con ~130 ms de retardo y una micro-animación de escala; la flecha apunta siempre al elemento."
        code={CODE_TT}>
        <Positions />
      </Variant>

      <Variant title="Toolbar de iconos"
        desc="El uso más común: un botón-icono no se explica solo, así que cada uno lleva su etiqueta. El primero añade además un atajo de teclado en un chip. Pasa el ratón o navega con Tab para verlos."
        code={CODE_TOOL}>
        <IconToolbar />
      </Variant>

      <Variant title="Tooltip enriquecido" surface="card"
        desc="Cuando una etiqueta no basta: card sobre bg-popover con título, descripción y una línea de meta. Ideal para explicar una métrica detrás de una ⓘ o dar contexto de un recurso al pasar por encima."
        code={CODE_RICH}>
        <RichDemo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tooltips'] = TooltipsSection;
})();
