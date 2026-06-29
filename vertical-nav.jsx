/* ============================================================================
   Gntik UI · vertical-nav.jsx — navegación lateral de página (grupo "Navegación").
   La nav que vive dentro del contenido (ajustes, detalle de recurso): simple
   con iconos, con sub-secciones expandibles, y con contadores. Activo con
   barra de acento a la izquierda, como el sidebar del shell. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 flex justify-center">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const Row = ({ icon, label, on, count, onClick }) => (
  <button onClick={onClick}
    className={"relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] text-left transition-colors " +
      (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground')}>
    {on && <span className="absolute left-[-12px] top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
    {icon && <Icon name={icon} size={16} className="shrink-0" />}
    <span className="flex-1 truncate">{label}</span>
    {count != null && <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/16 text-primary' : 'bg-secondary text-muted-foreground')}>{count}</span>}
  </button>
);

/* ── 1 · SIMPLE con iconos ───────────────────────────────────────────────── */
const SIMPLE = [['settings', 'General'], ['user', 'Perfil'], ['shield', 'Seguridad'], ['bell', 'Notificaciones'], ['coin', 'Facturación'], ['net', 'Integraciones']];
function Simple() {
  const [active, setActive] = useState('General');
  return (
    <nav className="w-60 flex flex-col gap-0.5">
      {SIMPLE.map(([ic, l]) => <Row key={l} icon={ic} label={l} on={active === l} onClick={() => setActive(l)} />)}
    </nav>
  );
}

/* ── 2 · CON SUB-SECCIONES (acordeón) ────────────────────────────────────── */
const GROUPS = [
  ['Workspace', 'fleet', [['General', 'settings'], ['Miembros', 'users'], ['Facturación', 'coin']]],
  ['Agentes', 'bot', [['Defaults', 'cog'], ['Policies', 'shield'], ['Secrets', 'lock']]],
  ['Avanzado', 'sliders', [['API keys', 'code'], ['Webhooks', 'net']]],
];
function Nested() {
  const [open, setOpen] = useState({ Workspace: true, Agentes: true });
  const [active, setActive] = useState('Miembros');
  const toggle = g => setOpen(o => ({ ...o, [g]: !o[g] }));
  return (
    <nav className="w-64 flex flex-col gap-1.5">
      {GROUPS.map(([g, ic, items]) => {
        const expanded = !!open[g];
        return (
          <div key={g}>
            <button onClick={() => toggle(g)}
              className="flex w-full items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold text-foreground transition-colors hover:bg-accent/40">
              <Icon name={ic} size={16} className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-left">{g}</span>
              <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (expanded ? '' : '-rotate-90')} />
            </button>
            {expanded && (
              <div className="mt-0.5 ml-[18px] pl-3 border-l border-border flex flex-col gap-0.5">
                {items.map(([l]) => {
                  const on = active === l;
                  return (
                    <button key={l} onClick={() => setActive(l)}
                      className={"h-8 px-2.5 rounded-md text-[12.5px] text-left transition-colors " + (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:text-foreground hover:bg-accent/40')}>{l}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ── 3 · CON CONTADORES ──────────────────────────────────────────────────── */
const COUNTS = [['inbox', 'Todos', 248], ['activity', 'Activos', 9], ['pause', 'Pausados', 3], ['alert', 'Con incidencias', 2], ['clock', 'Programados', 5]];
function Counters() {
  const [active, setActive] = useState('Todos');
  return (
    <nav className="w-60 flex flex-col gap-0.5">
      <div className="px-2.5 pb-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/70">Fleet</div>
      {COUNTS.map(([ic, l, n]) => <Row key={l} icon={ic} label={l} count={n} on={active === l} onClick={() => setActive(l)} />)}
    </nav>
  );
}

const CODE_SIMPLE = `// Vertical nav — barra de acento a la izquierda en el activo
<nav className="w-60 flex flex-col gap-0.5">
  {items.map(({ id, label, Icon, count }) => {
    const on = active === id;
    return (
      <button key={id} onClick={() => setActive(id)}
        className={"relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] text-left transition-colors " +
          (on ? "bg-accent text-accent-foreground font-semibold"
              : "text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground")}>
        {on && <span className="absolute -left-3 inset-y-1.5 w-[3px] rounded-r bg-primary" />}
        <Icon className="size-4" />
        <span className="flex-1 truncate">{label}</span>
        {count != null && (
          <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " +
            (on ? "bg-primary/16 text-primary" : "bg-secondary text-muted-foreground")}>{count}</span>
        )}
      </button>
    );
  })}
</nav>`;

const CODE_NESTED = `// Sub-secciones — grupo colapsable con hijos en una guía vertical
<button onClick={() => toggle(g)} className="flex w-full items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold hover:bg-accent/40">
  <Icon className="size-4 text-muted-foreground" /><span className="flex-1 text-left">{g}</span>
  <ChevronDown className={"size-3.5 text-muted-foreground transition-transform " + (open ? "" : "-rotate-90")} />
</button>
{open && (
  <div className="mt-0.5 ml-[18px] pl-3 border-l border-border flex flex-col gap-0.5">
    {children.map((c) => <SubItem key={c} active={active === c} … />)}
  </div>
)}`;

function VerticalNavSection() {
  return (
    <div>
      <SectionHead kicker="Navegación" title="Vertical navigation" status="done"
        intro="La navegación que vive dentro del contenido —ajustes, filtros del Fleet, detalle de un recurso—, no el chrome de la app. Simple con iconos, con sub-secciones expandibles, y con contadores. El activo lleva la barra de acento a la izquierda, igual que el sidebar." />

      <Variant title="Simple con iconos"
        desc="La nav de una página de ajustes: icono, etiqueta y barra de acento en el activo. Pulsa para cambiar de sección."
        code={CODE_SIMPLE}>
        <Simple />
      </Variant>

      <Variant title="Con sub-secciones"
        desc="Grupos colapsables con sus hijos sobre una guía vertical. Abre y cierra los grupos; el hijo activo se resalta."
        code={CODE_NESTED}>
        <Nested />
      </Variant>

      <Variant title="Con contadores"
        desc="Filtros del Fleet con el conteo a la derecha en mono; el contador del activo toma el verde de marca.">
        <Counters />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['vertical-nav'] = VerticalNavSection;
})();
