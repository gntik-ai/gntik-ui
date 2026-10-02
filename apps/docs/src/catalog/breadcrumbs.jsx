/* ============================================================================
   Gntik UI · breadcrumbs.jsx — migas de pan (grupo "Navegación").
   Con chevron (raíz como icono home), truncado (el centro colapsa en "…" que
   despliega los tramos ocultos), y con dropdown en el tramo actual para saltar
   entre hermanos. Separadores sobrios, último tramo no enlazado. Tokens.
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

const Crumb = ({ children, current, onClick }) => (
  current
    ? <span className="text-[13px] font-semibold text-foreground" aria-current="page">{children}</span>
    : <button onClick={onClick} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">{children}</button>
);
const Chev = () => <Icon name="chevronRight" size={14} className="text-muted-foreground/40 shrink-0" />;
const Slash = () => <span className="text-muted-foreground/40 select-none">/</span>;

/* ── 1 · CON CHEVRON + HOME ──────────────────────────────────────────────── */
function WithChevron() {
  const trail = ['Operation', 'Fleet', 'support-triage'];
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <button aria-label="Home" className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"><Icon name="home" size={15} /></button>
      <Chev />
      {trail.map((t, i) => (
        <React.Fragment key={t}>
          <Crumb current={i === trail.length - 1}>{i === trail.length - 1 ? <span className="font-mono">{t}</span> : t}</Crumb>
          {i < trail.length - 1 && <Chev />}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ── 2 · TRUNCADO (centro colapsado) ─────────────────────────────────────── */
function Truncated() {
  const full = ['Operation', 'Fleet', 'eu-west-1', 'namespaces', 'support-triage'];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const first = full[0], last = full[full.length - 1], hidden = full.slice(1, -1);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <Crumb>{first}</Crumb>
      <Slash />
      <div ref={ref} className="relative">
        <button onClick={() => setOpen(o => !o)} aria-label="Mostrar tramos ocultos" aria-expanded={open}
          className={"grid h-7 px-1.5 place-items-center rounded-md transition-colors " + (open ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}>
          <Icon name="dot3" size={16} />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-48 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            {hidden.map(h => (
              <button key={h} onClick={() => setOpen(false)} className="flex w-full items-center gap-2 h-[32px] px-2.5 rounded-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-secondary/70">
                <Icon name="chevronRight" size={13} className="text-muted-foreground/50" />{h}
              </button>
            ))}
          </div>
        )}
      </div>
      <Slash />
      <Crumb current><span className="font-mono">{last}</span></Crumb>
    </nav>
  );
}

/* ── 3 · CON DROPDOWN EN EL TRAMO ACTUAL ─────────────────────────────────── */
const SIBLINGS = ['support-triage', 'invoice-ocr', 'contract-summarize', 'nightly-recon'];
function WithDropdown() {
  const [current, setCurrent] = useState('support-triage');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <Crumb>Operation</Crumb><Chev />
      <Crumb>Fleet</Crumb><Chev />
      <div ref={ref} className="relative">
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          className="inline-flex items-center gap-1.5 h-7 px-2 -mx-1 rounded-md font-mono text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary/60">
          {current}<Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            <div className="px-2.5 pt-1.5 pb-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">Cambiar agente</div>
            {SIBLINGS.map(s => (
              <button key={s} onClick={() => { setCurrent(s); setOpen(false); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
                <Icon name="bot" size={15} className="text-muted-foreground" />
                <span className="flex-1 font-mono text-[12.5px] text-foreground">{s}</span>
                {current === s && <Icon name="check" size={15} className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

const CODE_CHEVRON = `// Breadcrumb con chevron — último tramo no enlazado (aria-current)
<nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
  <a className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"><Home className="size-4" /></a>
  <ChevronRight className="size-3.5 text-muted-foreground/40" />
  {trail.map((t, i) => {
    const last = i === trail.length - 1;
    return (
      <React.Fragment key={t}>
        {last
          ? <span aria-current="page" className="text-[13px] font-semibold text-foreground">{t}</span>
          : <a className="text-[13px] text-muted-foreground hover:text-foreground">{t}</a>}
        {!last && <ChevronRight className="size-3.5 text-muted-foreground/40" />}
      </React.Fragment>
    );
  })}
</nav>`;

const CODE_TRUNC = `// Truncado — el centro se pliega en "…" y un dropdown muestra lo oculto
const first = full[0], last = full.at(-1), hidden = full.slice(1, -1);
// first  /  [ … ]  /  last     ← el botón "…" abre los tramos intermedios`;

function BreadcrumbsSection() {
  return (
    <div>
      <SectionHead kicker="Navegación" title="Breadcrumbs" status="done"
        intro="Migas de pan para ubicar al operador dentro de la jerarquía. Con chevron y raíz como icono; truncado, donde el centro se colapsa en “…” y un dropdown muestra los tramos ocultos; y con dropdown en el tramo actual para saltar entre hermanos sin volver atrás. El último tramo nunca es enlace." />

      <Variant title="Con chevron"
        desc="El patrón base: raíz como icono home, separadores con chevron y el recurso actual en mono, no enlazado (aria-current)."
        code={CODE_CHEVRON}>
        <WithChevron />
      </Variant>

      <Variant title="Truncado"
        desc="Cuando la ruta es larga, los tramos del medio se pliegan en un “…”. Pulsa para desplegarlos; separador con slash."
        code={CODE_TRUNC}>
        <Truncated />
      </Variant>

      <Variant title="Con dropdown"
        desc="El tramo actual es un selector: abre el menú para saltar a un agente hermano sin retroceder. El trigger se actualiza al elegir.">
        <WithDropdown />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['breadcrumbs'] = BreadcrumbsSection;
})();
