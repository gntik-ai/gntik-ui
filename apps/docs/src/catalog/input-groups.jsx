/* ============================================================================
   Gntik UI · input-groups.jsx — campos con add-ons (grupo "Formularios").
   Inputs compuestos sobre la primitiva de marca (recessed bg-background, ring
   verde): iconos y prefijos, hint de teclado, botón adjunto, select inline,
   estados (error/disabled) y los tres tamaños. Dominio musematic.
   Cero color hardcodeado — todo resuelve a tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── envoltura de variante (card + código), igual que form-layouts ────────── */
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

const labelCls = "block text-[12.5px] font-medium text-foreground mb-2";
const Cell = ({ label, children, wide }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    {label && <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 mb-2">{label}</div>}
    {children}
  </div>
);
const G2 = ({ children }) => (
  <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">{children}</div>
);

/* anillo de marca compartido por todos los grupos (focus-within en el wrapper) */
const ring = "transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25";
const groupBase = "flex items-center rounded-md border border-border bg-background shadow-sm " + ring;
const bareInput = "h-9 w-full min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none";

/* hint de teclado · pill mono */
const Kbd = ({ children }) => (
  <span className="inline-flex h-[18px] items-center rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">{children}</span>
);

/* ════════════════════════════════════════════════════════════════════════
   1 · ICONOS, PREFIJOS Y AFFIXES
   ════════════════════════════════════════════════════════════════════════ */
function Affixes() {
  return (
    <G2>
      <Cell label="Icono leading">
        <div className={groupBase + " pl-3 pr-3"}>
          <Icon name="search" size={15} className="text-muted-foreground shrink-0" />
          <input className={bareInput + " pl-2.5"} placeholder="Buscar agentes…" />
        </div>
      </Cell>

      <Cell label="Hint de teclado">
        <div className={groupBase + " pl-3 pr-2"}>
          <Icon name="bolt" size={15} className="text-muted-foreground shrink-0" />
          <input className={bareInput + " pl-2.5 pr-2"} placeholder="Ir a…" />
          <Kbd>⌘K</Kbd>
        </div>
      </Cell>

      <Cell label="Prefijo de dominio">
        <div className={groupBase + " pl-3 pr-3"}>
          <span className="select-none text-[13px] text-muted-foreground">musematic.app/</span>
          <input className={bareInput + " pl-1"} defaultValue="prod-eu" />
        </div>
      </Cell>

      <Cell label="Sufijo de unidad">
        <div className={groupBase + " pl-3 pr-3"}>
          <input className={bareInput} defaultValue="2000" inputMode="numeric" />
          <span className="select-none text-[13px] text-muted-foreground shrink-0">req/s</span>
        </div>
      </Cell>

      <Cell label="Trailing icon-button" wide>
        <div className={groupBase + " pl-3 pr-1.5"}>
          <Icon name="lock" size={15} className="text-muted-foreground shrink-0" />
          <input type="password" className={bareInput + " pl-2.5"} defaultValue="sk-live-musematic" />
          <button type="button" aria-label="Mostrar token"
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors shrink-0">
            <Icon name="eye" size={15} />
          </button>
        </div>
      </Cell>
    </G2>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · ETIQUETA INLINE Y SELECT ADJUNTO
   ════════════════════════════════════════════════════════════════════════ */
function InlineLabel() {
  return (
    <G2>
      <Cell label="Etiqueta inset">
        <div className={"rounded-md border border-border bg-background px-3 pt-1.5 pb-1 shadow-sm " + ring}>
          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Namespace</label>
          <input className="block w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" defaultValue="checkout-agents" />
        </div>
      </Cell>

      <Cell label="Select inline (trailing)">
        <div className={groupBase + " pl-3 pr-0"}>
          <input className={bareInput} defaultValue="50" inputMode="numeric" />
          <div className="relative shrink-0">
            <select defaultValue="usd" className="h-9 cursor-pointer appearance-none rounded-r-md bg-transparent pl-2 pr-7 text-[13px] font-medium text-muted-foreground focus:outline-none">
              <option value="usd">USD / día</option>
              <option value="eur">EUR / día</option>
              <option value="tok">tokens</option>
            </select>
            <Icon name="chevron" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </Cell>

      <Cell label="Select inline (leading)" wide>
        <div className={groupBase + " pl-0 pr-3"}>
          <div className="relative shrink-0">
            <select defaultValue="https" className="h-9 cursor-pointer appearance-none rounded-l-md border-r border-border bg-transparent pl-3 pr-7 text-[13px] font-medium text-muted-foreground focus:outline-none">
              <option value="https">https://</option>
              <option value="wss">wss://</option>
            </select>
            <Icon name="chevron" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          <input className={bareInput + " pl-3"} defaultValue="checkout.acme.internal/webhook" />
        </div>
      </Cell>
    </G2>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · CON BOTÓN ADJUNTO
   ════════════════════════════════════════════════════════════════════════ */
function ButtonAttached() {
  const [val, setVal] = useState('');
  const [sent, setSent] = useState(false);
  const invite = () => { if (!val.trim()) return; setSent(true); setVal(''); setTimeout(() => setSent(false), 1500); };
  const join = "h-9 text-[13px] focus:outline-none focus:relative focus:z-10 focus:border-primary/60 focus:ring-2 focus:ring-ring/25";
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <label className={labelCls}>Invitar operador</label>
        <div className="flex shadow-sm rounded-md">
          <input value={val} onChange={e => setVal(e.target.value)} type="email" placeholder="operador@acme.com"
            className={"w-full rounded-l-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground " + join} />
          <button type="button" onClick={invite}
            className="-ml-px inline-flex shrink-0 items-center gap-1.5 rounded-r-md border border-primary bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Icon name={sent ? 'check' : 'plus'} size={15} stroke={2.4} />{sent ? 'Enviado' : 'Invitar'}
          </button>
        </div>
      </div>

      <div>
        <label className={labelCls}>Buscar en el Fleet</label>
        <div className="flex shadow-sm rounded-md">
          <div className="flex w-full items-center rounded-l-md border border-border bg-background pl-3 focus-within:relative focus-within:z-10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25 transition-colors">
            <Icon name="search" size={15} className="text-muted-foreground shrink-0" />
            <input placeholder="agente, namespace, policy…" className="h-9 w-full bg-transparent pl-2.5 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <button type="button"
            className="-ml-px inline-flex shrink-0 items-center gap-1.5 rounded-r-md border border-border bg-secondary/60 px-3.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors">
            <Icon name="filter" size={14} className="text-muted-foreground" />Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4 · ESTADOS Y TAMAÑOS
   ════════════════════════════════════════════════════════════════════════ */
function StatesSizes() {
  const sizes = [['sm', 'h-8 text-[12px]', 'Pequeño'], ['md', 'h-9 text-[13px]', 'Medio'], ['lg', 'h-10 text-[14px]', 'Grande']];
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* estados */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Email <span className="text-destructive">·</span> error</label>
          <div className="flex items-center rounded-md border border-destructive/70 bg-background px-3 shadow-sm focus-within:ring-2 focus-within:ring-destructive/25 transition-colors">
            <input defaultValue="operador@acme" className="h-9 w-full bg-transparent text-[13px] text-foreground focus:outline-none" aria-invalid="true" />
            <Icon name="alert" size={15} className="text-destructive shrink-0" />
          </div>
          <p className="mt-1.5 text-[12px] text-destructive">Introduce un email de trabajo válido.</p>
        </div>

        <div>
          <label className={labelCls}>Workspace · ok</label>
          <div className="flex items-center rounded-md border border-primary/50 bg-background px-3 shadow-sm">
            <input defaultValue="prod-eu" className="h-9 w-full bg-transparent text-[13px] text-foreground focus:outline-none" />
            <Icon name="check" size={15} className="text-primary shrink-0" stroke={2.4} />
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Disponible en la región EU-West.</p>
        </div>

        <div>
          <label className={labelCls}>Rol · deshabilitado</label>
          <input disabled defaultValue="Operador senior"
            className="h-9 w-full cursor-not-allowed rounded-md border border-border bg-secondary/50 px-3 text-[13px] text-muted-foreground shadow-sm focus:outline-none" />
        </div>

        <div>
          <label className={labelCls}>Token · solo lectura</label>
          <div className="flex items-center rounded-md border border-border bg-secondary/40 px-3 shadow-sm">
            <input readOnly defaultValue="sk-live-9f2c…a71" className="h-9 w-full bg-transparent font-mono text-[12px] text-muted-foreground focus:outline-none" />
            <button className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"><Icon name="copy" size={14} /></button>
          </div>
        </div>
      </div>

      {/* tamaños */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 mb-3">Tamaños · sm · md · lg</div>
        <div className="space-y-3">
          {sizes.map(([k, cls, ph]) => (
            <div key={k} className={"flex items-center rounded-md border border-border bg-background px-3 shadow-sm " + ring}>
              <Icon name="search" size={k === 'lg' ? 16 : 14} className="text-muted-foreground shrink-0" />
              <input placeholder={ph} className={"w-full bg-transparent pl-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none " + cls} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_AFFIX = `// Add-on con icono — el anillo de marca vive en el WRAPPER (focus-within)
<div className="flex items-center rounded-md border border-border bg-background px-3 shadow-sm
                transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
  <SearchIcon className="text-muted-foreground shrink-0" />
  <input className="h-9 w-full bg-transparent pl-2.5 text-[13px] text-foreground
                    placeholder:text-muted-foreground focus:outline-none" placeholder="Buscar agentes…" />
</div>

// Prefijo / sufijo de texto: span con text-muted-foreground a un lado del input transparente
<span className="text-[13px] text-muted-foreground">musematic.app/</span>
<input className="bg-transparent ..." defaultValue="prod-eu" />
<span className="text-[13px] text-muted-foreground">req/s</span>`;

const CODE_BTN = `// Botón adjunto — borde compartido + focus:relative para subir el ring sobre el botón
<div className="flex rounded-md shadow-sm">
  <input className="w-full rounded-l-md border border-border bg-background px-3 h-9 text-[13px]
                    focus:outline-none focus:relative focus:z-10 focus:border-primary/60 focus:ring-2 focus:ring-ring/25" />
  <button className="-ml-px inline-flex items-center gap-1.5 rounded-r-md border border-primary bg-primary
                     px-3.5 h-9 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">
    <PlusIcon /> Invitar
  </button>
</div>`;

const CODE_STATE = `// Error — borde + ring destructive + icono trailing + helper
<div className="flex items-center rounded-md border border-destructive/70 bg-background px-3 shadow-sm
                focus-within:ring-2 focus-within:ring-destructive/25">
  <input aria-invalid className="h-9 w-full bg-transparent text-[13px] focus:outline-none" />
  <AlertIcon className="text-destructive" />
</div>
<p className="mt-1.5 text-[12px] text-destructive">Introduce un email válido.</p>

// Tamaños: solo cambia la altura/texto del input — sm h-8/12px · md h-9/13px · lg h-10/14px`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function InputGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Input groups" status="done"
        intro="El campo de marca con add-ons: iconos leading, prefijos y sufijos de texto, hint de teclado, botón o select adjuntos y los estados de validación. El truco de marca es que el anillo verde vive en el contenedor (focus-within), así el icono, el prefijo y el input se enfocan como una sola pieza. Campos recessed (bg-background) sobre la card, radios y sombras de los tokens." />

      <Variant title="Iconos, prefijos y affixes"
        desc="Icono leading, hint de teclado en pill mono, prefijo de dominio, sufijo de unidad y un botón-icono trailing. Todo dentro de un único wrapper que toma el ring al enfocar."
        code={CODE_AFFIX}>
        <Affixes />
      </Variant>

      <Variant title="Etiqueta inline y select adjunto"
        desc="Etiqueta inset dentro del campo y selects pegados a izquierda o derecha que comparten el borde — para unidad de coste o esquema de URL, sin romper el grupo."
        code={CODE_BTN}>
        <InlineLabel />
      </Variant>

      <Variant title="Con botón adjunto"
        desc="Input + botón unidos en una sola fila. El campo de email envía la invitación y el de búsqueda lleva un botón de filtros secundario; el foco sube por encima del botón."
        code={CODE_BTN}>
        <ButtonAttached />
      </Variant>

      <Variant title="Estados y tamaños"
        desc="Validación en error (ring destructive + icono + helper), confirmación, deshabilitado y solo-lectura con copiar; y los tres tamaños sm · md · lg sobre el mismo grupo."
        code={CODE_STATE}>
        <StatesSizes />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['input-groups'] = InputGroupsSection;
})();
