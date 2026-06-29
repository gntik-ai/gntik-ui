/* ============================================================================
   Gntik UI · list-containers.jsx — el chrome que envuelve una lista.
   Misma fila (icono + nombre + meta + chevron) montada en cuatro contenedores:
   a sangre, en card, en tarjetas separadas y en card con cabecera y footer.
   Aquí lo que se enseña es el envoltorio, no la fila. Dominio musematic · tokens.
   Variantes: a sangre · en card · tarjetas separadas · con cabecera y footer.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

/* ── envoltura de variante ───────────────────────────────────────────────── */
const Variant = ({ title, desc, code, surface = false, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    {surface
      ? <div className="preview-surface rounded-lg border border-border p-8">{children}</div>
      : <div className="rounded-lg border border-border bg-card p-3">{children}</div>}
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── datos: la misma fila en todos los contenedores ──────────────────────── */
const SPACES = [
  { name: 'production', icon: 'box', meta: '12 agentes · 1.2M runs' },
  { name: 'staging', icon: 'flask', meta: '6 agentes · 88k runs' },
  { name: 'eu-residency', icon: 'shield', meta: '8 agentes · 640k runs' },
  { name: 'sandbox', icon: 'bot', meta: '4 agentes · 12k runs' },
];

/* ── la fila reutilizable (el contenido es constante; cambia el contenedor) ── */
const RowInner = ({ s }) => (
  <>
    <span className="w-9 h-9 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name={s.icon} size={17} /></span>
    <div className="min-w-0 flex-1">
      <div className="text-[13.5px] font-semibold text-foreground truncate">{s.name}</div>
      <div className="font-mono text-[11.5px] text-muted-foreground truncate">{s.meta}</div>
    </div>
    <Icon name="chevronRight" size={16} className="shrink-0 text-muted-foreground/50" />
  </>
);

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_FLUSH = `// A sangre — ul dividida, sin borde ni fondo: ocupa el ancho del padre
<ul role="list" className="divide-y divide-border">
  {items.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 py-3.5 hover:opacity-80">
        <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
      </a>
    </li>
  ))}
</ul>`;

const CODE_CARD = `// En card — la lista dentro de un contenedor con borde y radio; filas a tope
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <ul role="list" className="divide-y divide-border">
    {items.map((s) => (
      <li key={s.name}>
        <a className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40">
          <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
        </a>
      </li>
    ))}
  </ul>
</div>`;

const CODE_SEP = `// Tarjetas separadas — cada fila es su propia card; separadas por gap
<ul role="list" className="flex flex-col gap-2.5">
  {items.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm hover:border-primary/40 hover:bg-accent/30">
        <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
      </a>
    </li>
  ))}
</ul>`;

const CODE_HEADFOOT = `// Con cabecera y footer — card con título + contador arriba y acción abajo
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
    <h3 className="text-[13px] font-semibold text-foreground">Namespaces</h3>
    <span className="font-mono text-[11px] text-muted-foreground">4</span>
  </div>
  <ul role="list" className="divide-y divide-border">
    {items.map((s) => (
      <li key={s.name}><a className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40">{/* fila */}</a></li>
    ))}
  </ul>
  <div className="border-t border-border px-4 py-2.5">
    <a className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">Ver todos <span aria-hidden>→</span></a>
  </div>
</div>`;

function ListContainersSection() {
  return (
    <div>
      <SectionHead kicker="Listas" title="List containers" status="done"
        intro="La misma fila — icono, nombre, meta y chevron — montada en cuatro envoltorios. Aquí no cambia el contenido del renglón sino su contenedor: a sangre para ocupar todo el ancho, en card cuando la lista necesita marco, en tarjetas separadas para darle peso a cada fila, o con cabecera y footer cuando es un panel con título y acción." />

      <Variant title="A sangre" desc="Lista dividida sin borde ni fondo propio: hereda el ancho del contenedor padre. La opción más liviana, para dentro de una página o un drawer ya delimitado." code={CODE_FLUSH}>
        <ul role="list" className="divide-y divide-border px-1">
          {SPACES.map((s) => (
            <li key={s.name}>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 py-3.5 hover:opacity-75 transition-opacity"><RowInner s={s} /></a>
            </li>
          ))}
        </ul>
      </Variant>

      <Variant title="En card" desc="La misma lista dentro de una card con borde y radio; las filas llegan a los bordes y se iluminan al hover. El contenedor por defecto para una lista autónoma." surface code={CODE_CARD}>
        <div className="mx-auto max-w-[460px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <ul role="list" className="divide-y divide-border">
            {SPACES.map((s) => (
              <li key={s.name}>
                <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors"><RowInner s={s} /></a>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      <Variant title="Tarjetas separadas" desc="Cada fila es su propia card con sombra plana, separadas por un gap. Da peso e independencia a cada elemento — útil cuando la fila es accionable por sí sola." surface code={CODE_SEP}>
        <ul role="list" className="mx-auto max-w-[460px] flex flex-col gap-2.5">
          {SPACES.map((s) => (
            <li key={s.name}>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm hover:border-primary/40 hover:bg-accent/30 transition-colors"><RowInner s={s} /></a>
            </li>
          ))}
        </ul>
      </Variant>

      <Variant title="Con cabecera y footer" desc="La card crece a panel: una cabecera con título y contador, la lista en medio y un footer con la acción de ver todo. El contenedor para un módulo del dashboard." surface code={CODE_HEADFOOT}>
        <div className="mx-auto max-w-[460px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-sans text-[13px] font-semibold text-foreground">Namespaces</h3>
            <span className="font-mono text-[11px] text-muted-foreground">{SPACES.length}</span>
          </div>
          <ul role="list" className="divide-y divide-border">
            {SPACES.map((s) => (
              <li key={s.name}>
                <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"><RowInner s={s} /></a>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-4 py-2.5">
            <a href="#" onClick={e => e.preventDefault()} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">Ver todos <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['list-containers'] = ListContainersSection;
})();
