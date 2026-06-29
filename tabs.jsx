/* ============================================================================
   Gntik UI · tabs.jsx — pestañas (grupo "Navegación").
   Subrayado con badges, pills en contenedor, con iconos, y barra full-width
   justificada. Selección única; el activo en verde de marca. Distinto del
   header de página (que ya trae tabs) — aquí viven como navegación de bloque.
   Dominio musematic, todo en tokens.
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

/* ── 1 · SUBRAYADO con badges ────────────────────────────────────────────── */
const UNDER = [['overview', 'Overview'], ['runs', 'Runs', 1284], ['policies', 'Policies', 3], ['logs', 'Logs'], ['settings', 'Settings']];
function Underline() {
  const [active, setActive] = useState('overview');
  return (
    <div className="border-b border-border">
      <nav className="flex items-center gap-6">
        {UNDER.map(([id, label, badge]) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className={"relative flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {label}
              {badge != null && <span className={"font-mono text-[10.5px] leading-none px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground')}>{badge.toLocaleString()}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── 2 · PILLS en contenedor ─────────────────────────────────────────────── */
const PILLS = [['day', 'Día'], ['week', 'Semana'], ['month', 'Mes'], ['quarter', 'Trimestre']];
function Pills() {
  const [active, setActive] = useState('week');
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-secondary/40">
      {PILLS.map(([id, label]) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => setActive(id)}
            className={"h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors " + (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
        );
      })}
    </div>
  );
}

/* ── 3 · CON ICONOS (subrayado) ──────────────────────────────────────────── */
const ICONS = [['activity', 'Actividad'], ['line', 'Métricas'], ['shield', 'Policies'], ['cog', 'Ajustes']];
function WithIcons() {
  const [active, setActive] = useState('activity');
  return (
    <div className="border-b border-border">
      <nav className="flex items-center gap-7">
        {ICONS.map(([ic, label]) => {
          const on = active === label;
          return (
            <button key={label} onClick={() => setActive(label)}
              className={"flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              <Icon name={ic} size={16} className={on ? 'text-primary' : ''} />{label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── 4 · FULL-WIDTH justificado ──────────────────────────────────────────── */
const FULL = [['summary', 'Resumen'], ['cost', 'Coste'], ['latency', 'Latencia'], ['errors', 'Errores']];
function FullWidth() {
  const [active, setActive] = useState('summary');
  return (
    <div className="w-full max-w-xl mx-auto grid grid-cols-4 p-1 rounded-lg border border-border bg-secondary/40">
      {FULL.map(([id, label]) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => setActive(id)}
            className={"h-9 rounded-md text-[12.5px] font-medium transition-colors " + (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
        );
      })}
    </div>
  );
}

const CODE_UNDER = `// Subrayado — el activo lleva border-primary; badge en mono
<div className="border-b border-border">
  <nav className="flex items-center gap-6">
    {tabs.map((t) => {
      const on = active === t.id;
      return (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={"relative flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " +
            (on ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {t.label}
          {t.badge != null && (
            <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " +
              (on ? "bg-primary/14 text-primary" : "bg-secondary text-muted-foreground")}>{t.badge}</span>
          )}
        </button>
      );
    })}
  </nav>
</div>`;

const CODE_PILLS = `// Pills — contenedor en bg-secondary; el activo sube a bg-card con sombra
<div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-secondary/40">
  {tabs.map((t) => (
    <button key={t.id} onClick={() => setActive(t.id)}
      className={"h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors " +
        (active === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {t.label}
    </button>
  ))}
</div>`;

function TabsSection() {
  return (
    <div>
      <SectionHead kicker="Navegación" title="Tabs" status="done"
        intro="Pestañas para navegar entre vistas de un mismo bloque sin cambiar de pantalla. Subrayado con badges para el detalle de un recurso, pills en contenedor para rangos, con iconos, y una barra full-width justificada. Selección única, con el activo siempre en verde de marca." />

      <Variant title="Subrayado"
        desc="El patrón por defecto: línea inferior en el activo y badges en mono para conteos. Igual que el header de recurso, reutilizable como navegación de bloque."
        code={CODE_UNDER}>
        <Underline />
      </Variant>

      <Variant title="Pills"
        desc="Compactas, dentro de un contenedor; el activo sube a bg-card con sombra. Para rangos y vistas cortas dentro de una tarjeta."
        code={CODE_PILLS}>
        <Pills />
      </Variant>

      <Variant title="Con iconos"
        desc="Subrayado con icono delante; el icono toma el verde de marca al activarse. Útil cuando la etiqueta sola no basta.">
        <WithIcons />
      </Variant>

      <Variant title="Full-width"
        desc="Pills repartidas en columnas iguales para ocupar todo el ancho — habitual en paneles estrechos y en móvil.">
        <FullWidth />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tabs'] = TabsSection;
})();
