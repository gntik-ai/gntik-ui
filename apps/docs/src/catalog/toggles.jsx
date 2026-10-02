/* ============================================================================
   Gntik UI · toggles.jsx — switches (grupo "Formularios").
   El switch de marca (pista que se pone verde, knob recessed) en simple +
   tamaños, fila de ajuste con etiqueta y descripción, y con icono dentro del
   knob / inline. Dominio musematic (auto-scaling, reintentos, mantenimiento).
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

/* ── Switch de marca ─────────────────────────────────────────────────────── */
const SW = {
  sm: { track: 'h-[18px] w-8', knob: 'size-3.5', on: 'translate-x-[14px]', ic: 9 },
  md: { track: 'h-[22px] w-[40px]', knob: 'size-[18px]', on: 'translate-x-[18px]', ic: 11 },
  lg: { track: 'h-[26px] w-[46px]', knob: 'size-[22px]', on: 'translate-x-[20px]', ic: 13 },
};
const Switch = ({ on, onChange, size = 'md', disabled, icon }) => {
  const s = SW[size];
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange}
      className={"relative inline-flex shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card " +
        s.track + " " + (on ? 'bg-primary' : 'bg-secondary') + (disabled ? ' cursor-not-allowed opacity-50' : ' cursor-pointer')}>
      <span className={"pointer-events-none ml-[2px] grid place-items-center rounded-full bg-background shadow-sm transition-transform " +
        s.knob + " " + (on ? s.on : 'translate-x-0')}>
        {icon && <Icon name={on ? 'check' : 'x'} size={s.ic} stroke={2.6} className={on ? 'text-primary' : 'text-muted-foreground'} />}
      </span>
    </button>
  );
};

/* hook: estado local por id */
const useToggles = (init) => { const [on, set] = useState(init); return [on, (id) => set(o => ({ ...o, [id]: !o[id] }))]; };

/* ── 1 · SIMPLE + tamaños + estados ──────────────────────────────────────── */
function SimpleToggles() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  const Demo = ({ label, children }) => (
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{label}</span>
    </div>
  );
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-wrap items-start justify-center gap-x-10 gap-y-6">
      <Demo label="sm"><Switch size="sm" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="md"><Switch size="md" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="lg"><Switch size="lg" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="off"><Switch on={b} onChange={() => setB(v => !v)} /></Demo>
      <Demo label="on · disabled"><Switch on={c} disabled onChange={() => {}} /></Demo>
      <Demo label="off · disabled"><Switch on={false} disabled onChange={() => {}} /></Demo>
    </div>
  );
}

/* ── 2 · FILA DE AJUSTE con etiqueta + descripción ───────────────────────── */
const SETTINGS = [
  { id: 'autoscale', label: 'Auto-scaling del Fleet', desc: 'Provisiona réplicas según la cola de requests.' },
  { id: 'retry', label: 'Reintentos automáticos', desc: 'Reintenta 3× con backoff antes de caer al fallback.' },
  { id: 'anon', label: 'Anonimizar logs', desc: 'Redacta PII en la auditoría antes de persistir.' },
  { id: 'maint', label: 'Modo mantenimiento', desc: 'Bloqueado: requiere rol de administrador del sistema.', locked: true },
];
function SettingRows() {
  const [on, toggle] = useToggles({ autoscale: true, retry: true, anon: false, maint: false });
  return (
    <div className="mx-auto w-full max-w-lg divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40">
      {SETTINGS.map(s => (
        <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-foreground">{s.label}</span>
              {s.locked && <Icon name="lock" size={12} className="text-muted-foreground" />}
            </div>
            <p className="mt-0.5 text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
          </div>
          <Switch on={!!on[s.id]} disabled={s.locked} onChange={() => toggle(s.id)} />
        </div>
      ))}
    </div>
  );
}

/* ── 3 · CON ICONO + INLINE ──────────────────────────────────────────────── */
function IconInline() {
  const [hot, setHot] = useState(true);
  const [verbose, setVerbose] = useState(false);
  const [live, setLive] = useState(true);
  return (
    <div className="mx-auto w-full max-w-lg space-y-7">
      {/* con icono dentro del knob */}
      <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-4 py-3.5">
        <div>
          <div className="text-[13px] font-medium text-foreground">Mantener caliente</div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">Evita el arranque en frío del agente.</p>
        </div>
        <Switch on={hot} icon onChange={() => setHot(v => !v)} />
      </div>

      {/* inline con etiqueta a la izquierda */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <label className="flex cursor-pointer items-center gap-3" onClick={() => setVerbose(v => !v)}>
          <Switch size="sm" on={verbose} onChange={() => setVerbose(v => !v)} />
          <span className="text-[13px] font-medium text-foreground">Trazas verbose</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3" onClick={() => setLive(v => !v)}>
          <Switch size="sm" on={live} icon onChange={() => setLive(v => !v)} />
          <span className="text-[13px] font-medium text-foreground">Stream en vivo</span>
        </label>
      </div>
      <p className="text-[12px] text-muted-foreground">El knob muestra check/✕ con la prop <code className="font-mono text-[11px]">icon</code>; en tamaño sm sirve como toggle compacto junto a la etiqueta.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SWITCH = `// Switch de marca — pista bg-primary/bg-secondary; knob recessed (bg-background)
const SW = {
  sm: { track: 'h-[18px] w-8',     knob: 'size-3.5',    on: 'translate-x-[14px]' },
  md: { track: 'h-[22px] w-[40px]', knob: 'size-[18px]', on: 'translate-x-[18px]' },
};
const Switch = ({ on, onChange, size = 'md', disabled, icon }) => {
  const s = SW[size];
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange}
      className={\`relative inline-flex items-center rounded-full transition-colors focus:outline-none
        focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card
        \${s.track} \${on ? 'bg-primary' : 'bg-secondary'} \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}>
      <span className={\`ml-[2px] grid place-items-center rounded-full bg-background shadow-sm transition-transform
        \${s.knob} \${on ? s.on : 'translate-x-0'}\`}>
        {icon && <Icon name={on ? 'check' : 'x'} className={on ? 'text-primary' : 'text-muted-foreground'} />}
      </span>
    </button>
  );
};`;

const CODE_ROW = `// Fila de ajuste — etiqueta + descripción a la izquierda, switch a la derecha
<div className="flex items-center justify-between gap-4 px-4 py-3.5">
  <div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium text-foreground">{s.label}</span>
      {s.locked && <LockIcon className="text-muted-foreground" />}
    </div>
    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{s.desc}</p>
  </div>
  <Switch on={on[s.id]} disabled={s.locked} onChange={() => toggle(s.id)} />
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function TogglesSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Toggles" status="done"
        intro="El switch de marca para estados binarios: la pista se pone verde al activarse y el knob va recessed (bg-background) para leer bien sobre cualquier tema, incluido el de alto contraste. Aquí simple y en tres tamaños, como fila de ajuste con etiqueta y descripción, y con un check/✕ dentro del knob o en formato compacto junto a una etiqueta." />

      <Variant title="Simple, tamaños y estados"
        desc="El switch suelto en sm · md · lg, más los estados off, on-disabled y off-disabled. role=switch y foco visible para accesibilidad."
        code={CODE_SWITCH}>
        <SimpleToggles />
      </Variant>

      <Variant title="Fila de ajuste"
        desc="El uso más común: una lista dividida donde cada fila lleva etiqueta, descripción y el switch a la derecha. La fila bloqueada muestra candado y queda deshabilitada."
        code={CODE_ROW}>
        <SettingRows />
      </Variant>

      <Variant title="Con icono e inline"
        desc="El knob puede mostrar un check al activarse y una ✕ al apagarse (prop icon); en tamaño sm funciona como toggle compacto pegado a su etiqueta."
        code={CODE_SWITCH}>
        <IconInline />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['toggles'] = TogglesSection;
})();
