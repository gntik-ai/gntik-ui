/* ============================================================================
   Gntik UI · card-headings.jsx — cabecera de una tarjeta o panel.
   Vive DENTRO del chrome de la card: título + descripción o meta + acciones,
   separados del cuerpo por un divisor. No es un divisor de contenido como la
   section heading, ni lleva el rótulo verde de la page heading.
   Variantes: simple · con acción · con menú (…) · con tabs. Dominio musematic.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── botones de cabecera ─────────────────────────────────────────────────── */
const CardBtn = ({ children }) => (
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const CardLink = ({ children }) => (
  <button className="shrink-0 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">{children}</button>
);

/* ── pill de estado (mono · verde) ───────────────────────────────────────── */
const RunningPill = () => (
  <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary shrink-0">
    <span className="w-1.5 h-1.5 rounded-full bg-current" />Running
  </span>
);

/* ── menú de acciones de card (…) — interactivo ──────────────────────────── */
function CardMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const item = "flex items-center w-full text-left px-3 h-9 text-[13px] text-foreground hover:bg-secondary/70 transition-colors";
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen(o => !o)} aria-label="Acciones"
        className={"h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card hover:text-foreground hover:bg-secondary/60 transition-colors " + (open ? 'text-foreground bg-secondary/60' : 'text-muted-foreground')}>
        <Icon name="dot3" size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-[38px] z-20 w-44 rounded-lg border border-border bg-popover shadow-lg py-1">
          <button className={item}>Pause</button>
          <button className={item}>Configure</button>
          <button className={item}>Duplicate</button>
          <div className="my-1 h-px bg-border" />
          <button className="flex items-center w-full text-left px-3 h-9 text-[13px] text-destructive hover:bg-destructive/10 transition-colors">Delete agent</button>
        </div>
      )}
    </div>
  );
}

/* ── tabs dentro de la cabecera de card — interactivo ────────────────────── */
function CardTabs() {
  const tabs = ['Overview', 'Cost', 'Logs', 'Trace'];
  const [active, setActive] = useState('Overview');
  return (
    <nav className="flex items-center gap-5">
      {tabs.map(t => {
        const on = active === t;
        return (
          <button key={t} onClick={() => setActive(t)}
            className={"h-9 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        );
      })}
    </nav>
  );
}

/* ── cuerpo de card · placeholder neutro (no es el componente) ────────────── */
const CardBody = () => (
  <div className="px-5 py-5 space-y-2.5" aria-hidden="true">
    <div className="h-2.5 rounded bg-muted-foreground/10 w-[82%]" />
    <div className="h-2.5 rounded bg-muted-foreground/10 w-full" />
    <div className="h-2.5 rounded bg-muted-foreground/10 w-[58%]" />
  </div>
);

/* ── envoltura: nombre + descripción + card flotando sobre la superficie ──── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-8 flex justify-center">
      <div className="w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    </div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── snippets para pegar ─────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — cabecera de card: título + descripción, divisor, cuerpo
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="px-5 py-4 border-b border-border">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Budget</h3>
    <p className="mt-0.5 text-[13px] text-muted-foreground">Spend caps applied per agent.</p>
  </div>
  <div className="px-5 py-5">{/* card body */}</div>
</div>`;

const CODE_ACTION = `// Con acción — título + descripción a la izquierda, acción a la derecha
<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
  <div className="min-w-0">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Policies</h3>
    <p className="mt-0.5 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
  </div>
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold hover:bg-secondary/60">
    Add policy
  </button>
</div>`;

const CODE_MENU = `// Con menú — recurso: título + estado + meta + menú (…)
<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
  <div className="min-w-0">
    <div className="flex items-center gap-2.5">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate">support-triage</h3>
      <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />Running
      </span>
    </div>
    <p className="mt-1 font-mono text-[12px] text-muted-foreground">agent · eu-west-1 · 1,284 runs today</p>
  </div>
  <Menu>{/* Pause · Configure · Duplicate · Delete */}</Menu>
</div>`;

const CODE_TABS = `// Con tabs — título + acción de texto y tabs dentro de la cabecera
<div className="px-5 pt-4 border-b border-border">
  <div className="flex items-center justify-between gap-4 mb-3">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Costs</h3>
    <button className="text-[13px] font-semibold text-primary">Export</button>
  </div>
  <nav className="flex items-center gap-5">
    {["Overview", "Cost", "Logs", "Trace"].map((t, i) => (
      <button key={t} className={"h-9 -mb-px border-b-2 text-[13px] font-medium " +
        (i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
        {t}
      </button>
    ))}
  </nav>
</div>`;

function CardHeadingsSection() {
  return (
    <div>
      <SectionHead kicker="Headings" title="Card headings" status="done"
        intro="La cabecera de una tarjeta o panel: vive dentro del chrome de la card y separa el título de su cuerpo con un divisor. A diferencia de la section heading no divide el contenido de la página, y a diferencia de la page heading no lleva rótulo verde ni repite el nombre de la pantalla. Título + descripción o meta + acciones; el menú y las tabs son interactivos." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Título y descripción con un divisor que la separa del cuerpo. La cabecera de card por defecto." code={CODE_SIMPLE}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Budget</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Spend caps applied per agent.</p>
        </div>
        <CardBody />
      </Variant>

      {/* 2 · Con acción */}
      <Variant title="Con acción" desc="Título y descripción a la izquierda; una acción de card a la derecha." code={CODE_ACTION}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Policies</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
          </div>
          <CardBtn>Add policy</CardBtn>
        </div>
        <CardBody />
      </Variant>

      {/* 3 · Con menú */}
      <Variant title="Con menú" desc="Cabecera de un recurso: título con estado, una línea de meta y un menú de acciones (…). El menú abre y cierra." code={CODE_MENU}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate">support-triage</h3>
              <RunningPill />
            </div>
            <p className="mt-1 font-mono text-[12px] text-muted-foreground">agent · eu-west-1 · 1,284 runs today</p>
          </div>
          <CardMenu />
        </div>
        <CardBody />
      </Variant>

      {/* 4 · Con tabs */}
      <Variant title="Con tabs" desc="Título con una acción de texto y una fila de tabs dentro de la propia cabecera. Las tabs cambian de estado." code={CODE_TABS}>
        <div className="px-5 pt-4 border-b border-border">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Costs</h3>
            <CardLink>Export</CardLink>
          </div>
          <CardTabs />
        </div>
        <CardBody />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['card-headings'] = CardHeadingsSection;
})();
