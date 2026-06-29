/* ============================================================================
   Gntik UI · button-groups.jsx — botones agrupados (grupo "Elementos").
   Segmentado con contadores (filtro del Fleet), botones unidos (cambio de
   vista + stepper de zoom), split button con menú adjunto, y barra de iconos.
   Bordes compartidos, redondeo solo en los extremos. Dominio musematic, tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── 1 · SEGMENTADO con contadores ───────────────────────────────────────── */
const FLEET_FILTERS = [['all', 'Todos', 12], ['active', 'Activos', 9], ['paused', 'Pausados', 3]];
function Segmented() {
  const [sel, setSel] = useState('all');
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card shadow-sm">
        {FLEET_FILTERS.map(([id, label, n]) => {
          const on = sel === id;
          return (
            <button key={id} onClick={() => setSel(id)}
              className={"inline-flex items-center gap-2 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors " +
                (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {label}<span className={"font-mono text-[10.5px] " + (on ? 'text-foreground/70' : 'text-muted-foreground/70')}>{n}</span>
            </button>
          );
        })}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">filtro del Fleet · contenedor segmentado</span>
    </div>
  );
}

/* ── 2 · BOTONES UNIDOS + stepper ────────────────────────────────────────── */
const VIEWS = [['day', 'Día'], ['week', 'Semana'], ['month', 'Mes']];
function Joined() {
  const [view, setView] = useState('week');
  const [zoom, setZoom] = useState(100);
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {VIEWS.map(([id, label]) => {
          const on = view === id;
          return <button key={id} onClick={() => setView(id)}
            className={"h-9 px-4 text-[13px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground')}>{label}</button>;
        })}
      </div>
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        <button onClick={() => setZoom(z => Math.max(50, z - 10))} aria-label="Alejar" className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name="minus" size={16} /></button>
        <span className="grid h-9 w-16 place-items-center font-mono text-[12.5px] font-medium text-foreground">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 10))} aria-label="Acercar" className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name="plus" size={16} /></button>
      </div>
    </div>
  );
}

/* ── 3 · SPLIT BUTTON ────────────────────────────────────────────────────── */
const DEPLOY_OPTS = [['bolt', 'Desplegar ahora'], ['clock', 'Programar deploy'], ['copy', 'Duplicar config'], ['code', 'Desplegar desde YAML']];
function SplitButton() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('Desplegar ahora');
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={ref} className="relative inline-flex">
        <button className="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-3 rounded-l-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm transition-colors hover:bg-primary/90"><Icon name="bolt" size={15} />{label}</button>
        <button onClick={() => setOpen(o => !o)} aria-label="Más opciones de deploy" aria-expanded={open}
          className="grid size-9 place-items-center rounded-r-lg border-l border-primary-foreground/25 bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Icon name="chevron" size={15} className={"transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            {DEPLOY_OPTS.map(([ic, l]) => (
              <button key={l} onClick={() => { setLabel(l); setOpen(false); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-secondary/70"><Icon name={ic} size={15} className="text-muted-foreground" />{l}</button>
            ))}
          </div>
        )}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">acción principal + menú adjunto</span>
    </div>
  );
}

/* ── 4 · GRUPO DE ICONOS (toolbar) ───────────────────────────────────────── */
const VIEW_ICONS = [['list', 'list', 'Lista'], ['grid', 'grid', 'Rejilla'], ['layout', 'board', 'Tablero']];
function IconGroup() {
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {VIEW_ICONS.map(([ic, id, label]) => {
          const on = view === id;
          return <button key={id} onClick={() => setView(id)} aria-label={label} title={label}
            className={"grid size-9 place-items-center transition-colors " + (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground')}><Icon name={ic} size={16} /></button>;
        })}
      </div>
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {[['refresh', 'Refrescar'], ['pause', 'Pausar'], ['download', 'Exportar'], ['dot3', 'Más']].map(([ic, label]) => (
          <button key={ic} aria-label={label} title={label} className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name={ic} size={16} /></button>
        ))}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SEG = `// Segmentado — contenedor; el activo va en bg-secondary con sombra
<div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card shadow-sm">
  {filters.map((f) => (
    <button key={f.id} onClick={() => setSel(f.id)}
      className={"inline-flex items-center gap-2 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors " +
        (sel === f.id ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {f.label}<span className="font-mono text-[10.5px] opacity-70">{f.n}</span>
    </button>
  ))}
</div>`;

const CODE_JOINED = `// Botones unidos — borde compartido con divide-x; redondeo en el contenedor
<div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
  {views.map((v) => (
    <button key={v.id} onClick={() => setView(v.id)}
      className={"h-9 px-4 text-[13px] font-medium transition-colors " +
        (view === v.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}>
      {v.label}
    </button>
  ))}
</div>`;

const CODE_SPLIT = `// Split button — acción + chevron adjunto que abre el menú
<div ref={ref} className="relative inline-flex">
  <button className="h-9 pl-3.5 pr-3 rounded-l-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm hover:bg-primary/90">
    Desplegar ahora
  </button>
  <button onClick={() => setOpen(o => !o)} aria-label="Más opciones"
    className="grid size-9 place-items-center rounded-r-lg border-l border-primary-foreground/25 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
    <ChevronIcon />
  </button>
  {open && <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">…</div>}
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ButtonGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Button groups" status="done"
        intro="Botones agrupados para acciones relacionadas: el contenedor segmentado para filtrar el Fleet, botones unidos para cambiar de vista o ajustar el zoom, el split button con su menú adjunto, y la barra de iconos. Bordes compartidos con divide-x y esquinas redondeadas solo en los extremos." />

      <Variant title="Segmentado con contadores"
        desc="Selección única dentro de un contenedor; el activo pasa a bg-secondary con sombra. El contador en mono acompaña a cada opción."
        code={CODE_SEG}>
        <Segmented />
      </Variant>

      <Variant title="Botones unidos"
        desc="El grupo clásico: un solo borde, separadores con divide-x y redondeo únicamente en el primer y último botón. Sirve como toggle de vista y como stepper."
        code={CODE_JOINED}>
        <Joined />
      </Variant>

      <Variant title="Split button"
        desc="Una acción principal con un chevron adjunto que abre alternativas. Pulsa el chevron para cambiar la acción; cierra al hacer clic fuera o con Esc."
        code={CODE_SPLIT}>
        <SplitButton />
      </Variant>

      <Variant title="Grupo de iconos"
        desc="Barra de solo iconos para vistas y acciones de toolbar. El activo se resalta; el resto son acciones sueltas. Cada botón lleva aria-label.">
        <IconGroup />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['button-groups'] = ButtonGroupsSection;
})();
