/* ============================================================================
   Gntik UI · action-panels.jsx — paneles de acción (grupo "Formularios").
   La card-con-acción de marca: título + descripción + un control. Simple,
   con acción a la derecha, con input inline (allowlist de dominios), con toggle
   y zona de peligro. Dominio musematic. Tokens, cero color hardcodeado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* aquí el panel ES la card → la superficie de preview va punteada para que flote */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const Panel = ({ children, tone = 'border-border' }) => (
  <div className={"mx-auto w-full max-w-2xl rounded-lg border bg-card shadow-sm " + tone}>{children}</div>
);
const H = ({ children }) => <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{children}</h3>;
const P = ({ children }) => <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{children}</p>;

const Primary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">{children}</button>
);
const Secondary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">{children}</button>
);
const Danger = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-destructive px-3.5 text-[13px] font-semibold text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90">{children}</button>
);
const Switch = ({ on, onChange }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onChange}
    className={"relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card " + (on ? 'bg-primary' : 'bg-secondary')}>
    <span className={"ml-[2px] size-[18px] rounded-full bg-background shadow-sm transition-transform " + (on ? 'translate-x-[18px]' : 'translate-x-0')} />
  </button>
);

/* ── 1 · SIMPLE ──────────────────────────────────────────────────────────── */
function SimplePanel() {
  const [done, setDone] = useState(false);
  return (
    <Panel>
      <div className="px-6 py-5">
        <H>Rotar la API key del workspace</H>
        <P>Genera una clave nueva e invalida la actual. Los runs en vuelo siguen con la clave anterior durante 5 minutos para no cortar tráfico.</P>
        <div className="mt-4">
          <Primary onClick={() => { setDone(true); setTimeout(() => setDone(false), 1600); }}>
            {done ? <><Icon name="check" size={15} stroke={2.4} />Clave rotada</> : <><Icon name="refresh" size={15} />Rotar API key</>}
          </Primary>
        </div>
      </div>
    </Panel>
  );
}

/* ── 2 · CON ACCIÓN A LA DERECHA ─────────────────────────────────────────── */
function RightActionPanel() {
  return (
    <Panel>
      <div className="px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <H>Exportar registro de auditoría</H>
          <P>Descarga todos los eventos del Fleet de los últimos 90 días en CSV firmado para tu equipo de compliance.</P>
        </div>
        <div className="mt-4 shrink-0 sm:mt-0">
          <Secondary><Icon name="download" size={15} className="text-muted-foreground" />Exportar CSV</Secondary>
        </div>
      </div>
    </Panel>
  );
}

/* ── 3 · CON INPUT INLINE (allowlist) ────────────────────────────────────── */
function InputPanel() {
  const [domains, setDomains] = useState(['acme.com', 'acme.dev']);
  const [val, setVal] = useState('');
  const add = (e) => {
    if (e) e.preventDefault();
    const d = val.trim().toLowerCase();
    if (!d || domains.includes(d)) return;
    setDomains(x => [...x, d]); setVal('');
  };
  return (
    <Panel>
      <div className="px-6 py-5">
        <H>Dominios permitidos</H>
        <P>Solo los emails de estos dominios pueden unirse al workspace sin invitación manual.</P>
        <form onSubmit={add} className="mt-4 flex max-w-md gap-2.5">
          <div className="flex w-full items-center rounded-md border border-border bg-background pl-3 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
            <span className="select-none text-[13px] text-muted-foreground">@</span>
            <input value={val} onChange={e => setVal(e.target.value)} placeholder="empresa.com"
              className="h-9 w-full bg-transparent pl-1 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <Primary onClick={add}><Icon name="plus" size={15} stroke={2.4} />Añadir</Primary>
        </form>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {domains.map(d => (
            <span key={d} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background pl-2.5 pr-1.5 h-7 font-mono text-[12px] text-foreground">
              {d}
              <button onClick={() => setDomains(x => x.filter(y => y !== d))} className="grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"><Icon name="x" size={11} stroke={2.4} /></button>
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ── 4 · CON TOGGLE + ZONA DE PELIGRO ────────────────────────────────────── */
function TogglePanel() {
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState('');
  const target = 'prod-eu';
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {/* toggle */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-start justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <H>Pausar el Fleet</H>
            <P>Detiene la admisión de nuevos requests en todos los agentes del workspace. Los runs activos terminan con normalidad.</P>
            {paused && <span className="mt-2.5 inline-flex items-center gap-1.5 rounded bg-warning/16 px-2 py-1 font-mono text-[11px] font-semibold text-warning"><span className="size-1.5 rounded-full bg-warning" />Fleet en pausa</span>}
          </div>
          <Switch on={paused} onChange={() => setPaused(v => !v)} />
        </div>
      </div>

      {/* zona de peligro */}
      <div className="rounded-lg border border-destructive/35 bg-card shadow-sm">
        <div className="px-6 py-5">
          <H>Eliminar workspace</H>
          <P>Borra <span className="font-mono text-foreground">{target}</span>, sus agentes, policies y la auditoría. Esta acción no se puede deshacer.</P>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={'Escribe "' + target + '" para confirmar'}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:border-destructive/60 focus:ring-2 focus:ring-destructive/25 sm:max-w-xs" />
            <Danger disabled={confirm !== target} aria-disabled={confirm !== target}
              className={confirm !== target ? 'opacity-50 cursor-not-allowed' : ''}>
              <Icon name="trash" size={15} />Eliminar workspace
            </Danger>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Panel simple — título + descripción + acción primaria
<div className="rounded-lg border border-border bg-card shadow-sm">
  <div className="px-6 py-5">
    <h3 className="text-[15px] font-semibold text-foreground">Rotar la API key</h3>
    <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">Genera una clave nueva e invalida la actual…</p>
    <button className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px]
                       font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
      <RefreshIcon /> Rotar API key
    </button>
  </div>
</div>`;

const CODE_RIGHT = `// Acción a la derecha — apila en móvil, fila en sm+
<div className="px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
  <div>
    <h3 className="text-[15px] font-semibold text-foreground">Exportar auditoría</h3>
    <p className="mt-1.5 text-[13px] text-muted-foreground">Descarga 90 días de eventos en CSV firmado.</p>
  </div>
  <button className="mt-4 shrink-0 sm:mt-0 inline-flex h-9 items-center gap-1.5 rounded-md border border-border
                     bg-card px-3.5 text-[13px] font-medium shadow-sm hover:bg-secondary/70">Exportar CSV</button>
</div>`;

const CODE_INPUT = `// Con input inline — añade chips (allowlist)
<form onSubmit={add} className="mt-4 flex max-w-md gap-2.5">
  <div className="flex w-full items-center rounded-md border border-border bg-background pl-3 shadow-sm
                  focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
    <span className="text-[13px] text-muted-foreground">@</span>
    <input value={val} onChange={(e) => setVal(e.target.value)} className="h-9 w-full bg-transparent pl-1 focus:outline-none" />
  </div>
  <button className="h-9 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground">Añadir</button>
</form>`;

const CODE_DANGER = `// Zona de peligro — borde destructive + confirmación por nombre
<div className="rounded-lg border border-destructive/35 bg-card shadow-sm px-6 py-5">
  <h3 className="text-[15px] font-semibold text-foreground">Eliminar workspace</h3>
  <p className="mt-1.5 text-[13px] text-muted-foreground">Esta acción no se puede deshacer.</p>
  <div className="mt-4 sm:flex sm:gap-2.5">
    <input value={confirm} onChange={(e) => setConfirm(e.target.value)}
      className="h-9 rounded-md border border-border bg-background px-3 text-[13px]
                 focus:border-destructive/60 focus:ring-2 focus:ring-destructive/25" />
    <button disabled={confirm !== target} className="h-9 rounded-md bg-destructive px-3.5 text-[13px]
      font-semibold text-destructive-foreground disabled:opacity-50">Eliminar workspace</button>
  </div>
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ActionPanelsSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Action panels" status="done"
        intro="La card-con-acción: un título, una descripción y un único control que ejecuta algo concreto sobre el workspace o el Fleet. Cinco variantes — simple, con la acción a la derecha, con input inline para una allowlist, con toggle, y la zona de peligro con confirmación por nombre. Cada panel es la card de marca (bg-card, sombra plana) flotando sobre la superficie de preview." />

      <Variant title="Simple"
        desc="Título, descripción y un botón primario debajo. El botón confirma en sitio con un check efímero al pulsarlo."
        code={CODE_SIMPLE}>
        <SimplePanel />
      </Variant>

      <Variant title="Con acción a la derecha"
        desc="La descripción a la izquierda y un botón secundario a la derecha; se apila en móvil y pasa a fila en pantallas medianas."
        code={CODE_RIGHT}>
        <RightActionPanel />
      </Variant>

      <Variant title="Con input inline"
        desc="Un mini-formulario dentro del panel: añade dominios a la allowlist como chips con prefijo @, y quítalos con la ✕. Pulsa Añadir y aparece el chip."
        code={CODE_INPUT}>
        <InputPanel />
      </Variant>

      <Variant title="Con toggle y zona de peligro"
        desc="Un panel con switch para pausar el Fleet (con badge de estado) y, debajo, la zona de peligro: borde destructive y un botón que solo se habilita al escribir el nombre del workspace."
        code={CODE_DANGER}>
        <TogglePanel />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['action-panels'] = ActionPanelsSection;
})();
