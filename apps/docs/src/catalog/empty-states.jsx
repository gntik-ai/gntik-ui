/* ============================================================================
   Gntik UI · empty-states.jsx — estados vacíos (grupo "Feedback").
   El "todavía no hay nada aquí": icono, mensaje y la siguiente acción clara.
   Cuatro patrones — simple con CTA, con plantillas de arranque seleccionables,
   dropzone punteado para subir, y sin-resultados con búsqueda en vivo.
   Dominio musematic. Tokens, cero color hardcodeado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

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

const Primary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">{children}</button>
);
const Secondary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">{children}</button>
);

/* halo del icono — neutro y sobrio (sin acento de marca) */
const IconHalo = ({ name }) => (
  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <Icon name={name} size={22} />
  </div>
);

/* ── 1 · SIMPLE CON CTA ──────────────────────────────────────────────────── */
function Simple() {
  return (
    <div className="mx-auto flex min-h-[300px] max-w-md flex-col items-center justify-center px-6 text-center">
      <IconHalo name="fleet" />
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">Aún no hay agentes</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Crea tu primer agente para empezar a enrutar tráfico del Fleet a un modelo, con sus límites de coste y policies.
      </p>
      <div className="mt-5">
        <Primary><Icon name="plus" size={15} stroke={2.4} />Crear agente</Primary>
      </div>
    </div>
  );
}

/* ── 2 · CON PLANTILLAS DE ARRANQUE ──────────────────────────────────────── */
const TEMPLATES = [
  { id: 'support', icon: 'chat',  name: 'Agente de soporte',  desc: 'Responde tickets con tu base de conocimiento' },
  { id: 'sales',   icon: 'store', name: 'Copiloto de ventas', desc: 'Resume cuentas y redacta seguimientos' },
  { id: 'data',    icon: 'audit', name: 'Analista de datos',  desc: 'Consulta el warehouse en lenguaje natural' },
];
function Templates() {
  const [sel, setSel] = useState(null);
  return (
    <div className="mx-auto max-w-lg px-2 py-6 text-center">
      <IconHalo name="bot" />
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">Crea tu primer agente</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>Empieza desde una plantilla; la podrás ajustar después.</p>
      <div className="mt-5 space-y-2 text-left">
        {TEMPLATES.map(t => {
          const on = sel === t.id;
          return (
            <button key={t.id} onClick={() => setSel(t.id)}
              className={"group flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm transition-colors " + (on ? 'border-primary ring-2 ring-ring/25' : 'border-border hover:border-primary/40 hover:bg-secondary/40')}>
              <span className={"grid size-9 shrink-0 place-items-center rounded-md transition-colors " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground group-hover:text-foreground')}>
                <Icon name={t.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold tracking-tight text-foreground">{t.name}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{t.desc}</span>
              </span>
              <Icon name={on ? 'check' : 'chevronRight'} size={16} stroke={on ? 2.4 : 1.8} className={on ? 'text-primary' : 'text-muted-foreground'} />
            </button>
          );
        })}
      </div>
      <button className="mt-4 font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground">o empezar en blanco →</button>
    </div>
  );
}

/* ── 3 · DROPZONE (punteado) ─────────────────────────────────────────────── */
function Dropzone() {
  const [file, setFile] = useState(null);
  return (
    <div className="mx-auto max-w-lg py-3">
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 shadow-sm">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="audit" size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">{file}</span>
            <span className="block font-mono text-[11px] text-muted-foreground">YAML · 4.2 KB · listo para validar</span>
          </span>
          <button onClick={() => setFile(null)} aria-label="Quitar archivo" className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={14} stroke={2.2} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setFile('pii-redaction.yaml')}
          className="block w-full rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border"><Icon name="upload" size={22} /></div>
          <p className="mt-4 text-[13.5px] text-foreground">
            Arrastra un archivo de policy o <span className="font-semibold text-primary">búscalo</span>
          </p>
          <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">YAML o JSON · máx 1 MB</p>
        </button>
      )}
      <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground/80">click en la zona para simular un archivo seleccionado</p>
    </div>
  );
}

/* ── 4 · SIN RESULTADOS (búsqueda en vivo) ───────────────────────────────── */
const AGENTS = ['billing-copilot', 'support-triage', 'sales-notes', 'data-analyst', 'onboarding-bot', 'qa-reviewer'];
function NoResults() {
  const [q, setQ] = useState('sonnet');
  const res = AGENTS.filter(a => a.includes(q.trim().toLowerCase()));
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
          <Icon name="search" size={15} className="shrink-0 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar agentes…"
            className="h-full w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          {q && <button onClick={() => setQ('')} aria-label="Limpiar" className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={12} stroke={2.4} /></button>}
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{res.length}/{AGENTS.length}</span>
      </div>

      {res.length > 0 ? (
        <ul className="divide-y divide-border">
          {res.map(a => (
            <li key={a} className="flex items-center gap-3 px-4 py-3">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[12.5px] text-foreground">{a}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
          <IconHalo name="search" />
          <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-foreground">Sin resultados para «{q}»</h3>
          <p className="mt-1.5 max-w-xs text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>No hay agentes que coincidan. Prueba con otro término o revisa los filtros activos.</p>
          <button onClick={() => setQ('')} className="mt-4">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70"><Icon name="x" size={13} stroke={2.2} className="text-muted-foreground" />Limpiar búsqueda</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 5 · SIN DATOS (gráfica) ────────────────────────────────────── */
const GRID_BG = { backgroundImage: 'repeating-linear-gradient(to top, hsl(var(--border) / 0.55) 0 1px, transparent 1px 25%)' };
function NoData() {
  const yTicks = ['$8k', '$6k', '$4k', '$2k', '$0'];
  const xTicks = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Coste diario del Fleet</h3>
          <p className="text-[11.5px] text-muted-foreground">Últimos 7 días</p>
        </div>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[11.5px] font-medium text-muted-foreground">
          <Icon name="calendar" size={13} />7 días
        </span>
      </div>
      <div className="px-4 pb-3 pt-4">
        <div className="flex">
          <div className="flex h-[184px] w-9 flex-col justify-between text-right">
            {yTicks.map(t => <span key={t} className="font-mono text-[10px] leading-none text-muted-foreground/45">{t}</span>)}
          </div>
          <div className="relative ml-2 h-[184px] flex-1">
            <div className="absolute inset-0 rounded-sm" style={GRID_BG} />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <IconHalo name="line" />
              <h4 className="mt-3 text-[13.5px] font-semibold tracking-tight text-foreground">Sin datos en este periodo</h4>
              <p className="mt-1 max-w-[17rem] text-[12.5px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>El Fleet no registró runs entre estas fechas. Amplía el rango o vuelve cuando haya actividad.</p>
              <button className="mt-3.5">
                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70"><Icon name="calendar" size={13} className="text-muted-foreground" />Ampliar rango</span>
              </button>
            </div>
          </div>
        </div>
        <div className="ml-[2.75rem] mt-2 flex justify-between">
          {xTicks.map(t => <span key={t} className="font-mono text-[10px] text-muted-foreground/45">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Empty state simple — halo de icono + mensaje + CTA, centrado
<div className="mx-auto flex min-h-[300px] max-w-md flex-col items-center justify-center px-6 text-center">
  <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <FleetIcon />
  </div>
  <h3 className="mt-4 text-[15px] font-semibold text-foreground">Aún no hay agentes</h3>
  <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
    Crea tu primer agente para empezar a enrutar tráfico del Fleet a un modelo.
  </p>
  <button className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px]
                     font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
    <PlusIcon /> Crear agente
  </button>
</div>`;

const CODE_TEMPLATES = `// Con plantillas — filas seleccionables como punto de arranque
{TEMPLATES.map((t) => {
  const on = sel === t.id;
  return (
    <button key={t.id} onClick={() => setSel(t.id)}
      className={"group flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm " +
        (on ? "border-primary ring-2 ring-ring/25" : "border-border hover:border-primary/40 hover:bg-secondary/40")}>
      <span className={"grid size-9 place-items-center rounded-md " +
        (on ? "bg-primary/14 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground")}>
        <Icon name={t.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-foreground">{t.name}</span>
        <span className="block truncate text-[12px] text-muted-foreground">{t.desc}</span>
      </span>
      <Icon name={on ? "check" : "chevronRight"} className={on ? "text-primary" : "text-muted-foreground"} />
    </button>
  );
})}`;

const CODE_DROP = `// Dropzone — borde punteado, hover en primario, click adjunta el archivo
<button onClick={() => setFile("pii-redaction.yaml")}
  className="block w-full rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center
             hover:border-primary/50 hover:bg-primary/5">
  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <UploadIcon />
  </div>
  <p className="mt-4 text-[13.5px] text-foreground">
    Arrastra un archivo de policy o <span className="font-semibold text-primary">búscalo</span>
  </p>
  <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">YAML o JSON · máx 1 MB</p>
</button>`;

const CODE_NORES = `// Sin resultados — búsqueda en vivo; cuando no hay match, empty + reset
const res = AGENTS.filter((a) => a.includes(q.trim().toLowerCase()));

res.length === 0 && (
  <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
    <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
      <SearchIcon />
    </div>
    <h3 className="mt-4 text-[14px] font-semibold text-foreground">Sin resultados para «{q}»</h3>
    <p className="mt-1.5 max-w-xs text-[13px] leading-6 text-muted-foreground">Prueba con otro término o revisa los filtros.</p>
    <button onClick={() => setQ("")}
      className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px]
                 font-medium shadow-sm hover:bg-secondary/70">Limpiar búsqueda</button>
  </div>
)`;

/* ── sección ─────────────────────────────────────────────────────────────── */
const CODE_NODATA = `// Sin datos — conserva el marco de la gráfica y superpone el mensaje
<div className="rounded-lg border border-border bg-card shadow-sm">
  <div className="flex items-center justify-between border-b border-border px-4 py-3">
    <div>
      <h3 className="text-[13.5px] font-semibold text-foreground">Coste diario del Fleet</h3>
      <p className="text-[11.5px] text-muted-foreground">Últimos 7 días</p>
    </div>
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5
                     text-[11.5px] text-muted-foreground"><CalendarIcon /> 7 días</span>
  </div>

  <div className="relative m-4 h-[184px]">
    {/* gridlines fantasma — el marco sigue ahí, solo faltan los datos */}
    <div className="absolute inset-0 rounded-sm"
      style={{ backgroundImage: "repeating-linear-gradient(to top, hsl(var(--border) / .55) 0 1px, transparent 1px 25%)" }} />
    {/* overlay vacío centrado */}
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
        <LineIcon />
      </div>
      <h4 className="mt-3 text-[13.5px] font-semibold text-foreground">Sin datos en este periodo</h4>
      <p className="mt-1 max-w-[17rem] text-[12.5px] leading-6 text-muted-foreground">
        El Fleet no registró runs entre estas fechas. Amplía el rango.
      </p>
      <button className="mt-3.5 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3
                         text-[12.5px] font-medium shadow-sm hover:bg-secondary/70"><CalendarIcon /> Ampliar rango</button>
    </div>
  </div>
</div>`;

function EmptyStatesSection() {
  return (
    <div>
      <SectionHead kicker="Feedback" title="Empty states" status="done"
        intro="El “todavía no hay nada aquí”: en vez de una pantalla en blanco, un icono sobrio, una frase que explica qué es y la siguiente acción clara. Cinco patrones — el simple con un CTA, el que ofrece plantillas de arranque seleccionables, el dropzone punteado para subir, el de sin-resultados con búsqueda en vivo y reset, y el de sin-datos dentro del marco de una gráfica. El halo del icono es neutro: el verde de marca se reserva para la acción." />

      <Variant title="Simple con CTA"
        desc="El caso base: halo de icono neutro, título, una frase de contexto y un único botón primario. Sirve igual a página completa, dentro de un contenedor o de una card."
        code={CODE_SIMPLE}>
        <Simple />
      </Variant>

      <Variant title="Con plantillas de arranque"
        desc="Cuando hay un buen punto de partida, ofrécelo: filas seleccionables con icono, nombre y descripción. Pulsa una para marcarla (check + ring primario) y deja un enlace para empezar en blanco."
        code={CODE_TEMPLATES}>
        <Templates />
      </Variant>

      <Variant title="Dropzone para subir"
        desc="Borde punteado que invita a soltar un archivo; al pasar el ratón se tiñe de primario. Haz click para simular un archivo seleccionado — aparece la fila con su meta y la ✕ para quitarlo."
        code={CODE_DROP}>
        <Dropzone />
      </Variant>

      <Variant title="Sin resultados" surface="card"
        desc="El empty state dentro de una lista con búsqueda en vivo. Empieza sin coincidencias para «sonnet»; escribe «bot», «data» o «sales» para ver filas, o pulsa “Limpiar búsqueda” para resetear."
        code={CODE_NORES}>
        <NoResults />
      </Variant>

      <Variant title="Sin datos en una gráfica" surface="card"
        desc="Para una gráfica sin datos: conserva el marco — cabecera, ejes y gridlines fantasma — y superpone el mensaje, así se lee como un gráfico (no como un error) y queda clara la siguiente acción. Útil cuando el rango de fechas no devuelve runs."
        code={CODE_NODATA}>
        <NoData />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['empty-states'] = EmptyStatesSection;
})();
