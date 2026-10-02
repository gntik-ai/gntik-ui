/* ============================================================================
   Gntik UI · dividers.jsx — separadores (grupo "Elementos").
   La regla simple (default · sutil · gruesa), con etiqueta (centrada · alineada
   · en pill), con icono central o acción a la derecha, y reglas verticales para
   metadatos y bloques de stats. Solo border tokens, sin color hardcodeado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

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

/* ── 1 · SIMPLE ──────────────────────────────────────────────────────────── */
function SimpleDividers() {
  const Row = ({ label, children }) => (
    <div><p className="mb-3 text-[12px] text-muted-foreground">{label}</p>{children}</div>
  );
  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <Row label="Por defecto"><div className="h-px w-full bg-border" /></Row>
      <Row label="Sutil — bg-border/50"><div className="h-px w-full bg-border/50" /></Row>
      <Row label="Gruesa"><div className="h-0.5 w-full rounded-full bg-border" /></Row>
    </div>
  );
}

/* ── 2 · CON ETIQUETA ────────────────────────────────────────────────────── */
function LabelDividers() {
  return (
    <div className="mx-auto w-full max-w-md space-y-9">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[12.5px] text-muted-foreground">Runs de hoy</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Esta semana</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="inline-flex h-[22px] items-center rounded-full bg-secondary px-2.5 font-mono text-[10.5px] font-semibold text-muted-foreground">ayer</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/* ── 3 · CON ICONO / CON ACCIÓN ──────────────────────────────────────────── */
function ActionDividers() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto w-full max-w-md space-y-9">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground"><Icon name="bolt" size={14} /></span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex items-center gap-4">
        <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Miembros</span>
        <div className="h-px flex-1 bg-border" />
        <button className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:text-primary/80"><Icon name="plus" size={14} />Invitar</button>
      </div>

      <div>
        <ul className="space-y-2 text-[13px] text-foreground">
          <li>support-triage</li>
          <li>billing-bot</li>
          {open && (<React.Fragment><li>data-enricher</li><li>lead-router</li><li>fraud-scan</li></React.Fragment>)}
        </ul>
        <button onClick={() => setOpen(o => !o)} className="group mt-3 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            <Icon name={open ? 'chevronUp' : 'chevron'} size={14} />{open ? 'Mostrar menos' : 'Mostrar 3 más'}
          </span>
          <div className="h-px flex-1 bg-border" />
        </button>
      </div>
    </div>
  );
}

/* ── 4 · VERTICAL ────────────────────────────────────────────────────────── */
function VerticalDividers() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-9">
      <div className="flex items-center justify-center gap-3 text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">12 agentes</span>
        <div className="h-3.5 w-px bg-border" />
        <span>eu-west-1</span>
        <div className="h-3.5 w-px bg-border" />
        <span className="font-mono text-[12px]">v2.3.0</span>
      </div>
      <div className="flex items-stretch gap-5">
        {[['9', 'activos'], ['3', 'pausados'], ['$2.1k', 'gasto/día']].map(([n, label], i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-px self-stretch bg-border" />}
            <div className="flex-1 text-center">
              <div className="font-mono text-[22px] font-semibold text-foreground">{n}</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">{label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_LABEL = `// Divisor con etiqueta — dos reglas flexibles a los lados del texto
<div className="flex items-center gap-3">
  <div className="h-px flex-1 bg-border" />
  <span className="text-[12.5px] text-muted-foreground">Runs de hoy</span>
  <div className="h-px flex-1 bg-border" />
</div>`;

const CODE_ACTION = `// Con acción — label a la izquierda, regla flexible, botón a la derecha
<div className="flex items-center gap-4">
  <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Miembros</span>
  <div className="h-px flex-1 bg-border" />
  <button className="shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80">
    <PlusIcon /> Invitar
  </button>
</div>`;

const CODE_VERTICAL = `// Vertical — w-px que se estira con self-stretch entre bloques
<div className="flex items-stretch gap-5">
  <div className="flex-1 text-center">…</div>
  <div className="w-px self-stretch bg-border" />
  <div className="flex-1 text-center">…</div>
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function DividersSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Dividers" status="done"
        intro="Separadores para dar ritmo al contenido: la regla simple en tres pesos, con etiqueta (centrada, alineada o en pill), con icono central, con una acción a la derecha (y un divisor que expande la lista), y reglas verticales para metadatos y bloques de stats. Solo usan el token border." />

      <Variant title="Simple"
        desc="La regla horizontal en tres pesos: por defecto, sutil (border/50) para separaciones de bajo contraste, y gruesa para cierres de bloque.">
        <SimpleDividers />
      </Variant>

      <Variant title="Con etiqueta"
        desc="Texto entre dos reglas que rellenan el espacio: centrado, alineado a la izquierda como kicker en mono, o envuelto en una pill."
        code={CODE_LABEL}>
        <LabelDividers />
      </Variant>

      <Variant title="Con icono y acción"
        desc="Un icono central como marca de sección, una cabecera con acción a la derecha, y un divisor clicable que expande la lista. Pulsa “Mostrar 3 más”."
        code={CODE_ACTION}>
        <ActionDividers />
      </Variant>

      <Variant title="Vertical"
        desc="Reglas verticales finas para separar metadatos en una fila, y divisores que se estiran con self-stretch entre bloques de stats."
        code={CODE_VERTICAL}>
        <VerticalDividers />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['dividers'] = DividersSection;
})();
