/* ============================================================================
   Gntik UI · alerts.jsx — alerts inline (grupo "Feedback").
   El banner-dentro-del-contenido: tono semántico + icono + título + cuerpo.
   Cuatro patrones — los cuatro tonos, con acciones y descarte, resumen de
   errores con lista, y el banner global horizontal. Dominio musematic.
   Tono nunca compite con el verde de marca; todo el color desde tokens.
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

/* ── Alert de marca ──────────────────────────────────────────────────────── */
const TONE = {
  info:        { wrap: 'border-info/25 bg-info/10',               fg: 'text-info',        icon: 'info' },
  success:     { wrap: 'border-primary/25 bg-primary/10',         fg: 'text-primary',     icon: 'check' },
  warning:     { wrap: 'border-warning/30 bg-warning/10',         fg: 'text-warning',     icon: 'alert' },
  destructive: { wrap: 'border-destructive/30 bg-destructive/10', fg: 'text-destructive', icon: 'alert' },
};

function Alert({ tone = 'info', title, children, onDismiss, actions }) {
  const t = TONE[tone];
  return (
    <div className={"rounded-lg border p-4 " + t.wrap}>
      <div className="flex gap-3">
        <Icon name={t.icon} size={18} stroke={1.9} className={"mt-px shrink-0 " + t.fg} />
        <div className="min-w-0 flex-1">
          {title && <h3 className={"text-[13.5px] font-semibold tracking-tight " + t.fg}>{title}</h3>}
          {children && <div className={"text-[13px] leading-6 text-foreground/75 " + (title ? 'mt-1' : '')} style={{ textWrap: 'pretty' }}>{children}</div>}
          {actions && <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">{actions}</div>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} aria-label="Descartar"
            className={"-mr-1 -mt-0.5 grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-foreground/10 " + t.fg}>
            <Icon name="x" size={14} stroke={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}

const LinkBtn = ({ children, className = '', ...p }) => (
  <button type="button" {...p} className={"text-[12.5px] font-semibold transition-opacity hover:opacity-70 " + className}>{children}</button>
);
const Restore = ({ onClick, children }) => (
  <button onClick={onClick} className="mx-auto block font-mono text-[12px] text-primary hover:underline">{children}</button>
);

/* ── 1 · LOS CUATRO TONOS ────────────────────────────────────────────────── */
function Tones() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <Alert tone="info" title="Nueva versión de runtime disponible">
        El Fleet se actualizará a <span className="font-mono text-foreground/90">sonnet-4.5</span> en la próxima ventana de mantenimiento.
      </Alert>
      <Alert tone="success" title="Deploy completado">
        El agente <span className="font-mono text-foreground/90">billing-copilot</span> está sirviendo tráfico en <span className="font-mono text-foreground/90">eu-west-1</span>.
      </Alert>
      <Alert tone="warning" title="Presupuesto al 92%">
        El workspace ha consumido $9.2k de $10k este mes. Sube el límite o pausa agentes no críticos.
      </Alert>
      <Alert tone="destructive" title="3 agentes sin responder">
        Los agentes en <span className="font-mono text-foreground/90">us-east-1</span> no responden desde hace 4 min. Revisa el estado del proveedor.
      </Alert>
    </div>
  );
}

/* ── 2 · CON ACCIONES + DESCARTE ─────────────────────────────────────────── */
function ActionAlert() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-2xl">
      {show ? (
        <Alert tone="warning" title="El workspace está al 92% del presupuesto"
          onDismiss={() => setShow(false)}
          actions={<>
            <LinkBtn className="text-warning">Subir límite</LinkBtn>
            <LinkBtn className="text-muted-foreground font-medium">Ver consumo</LinkBtn>
          </>}>
          Has consumido $9.2k de $10k este mes. Al llegar al 100% se pausan automáticamente los agentes no críticos del Fleet.
        </Alert>
      ) : <Restore onClick={() => setShow(true)}>restaurar alerta</Restore>}
    </div>
  );
}

/* ── 3 · RESUMEN DE ERRORES (lista) ──────────────────────────────────────── */
function ErrorSummary() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-2xl">
      {show ? (
        <Alert tone="destructive" title="No se pudo aplicar la policy «pii-redaction»"
          onDismiss={() => setShow(false)}
          actions={<>
            <LinkBtn className="text-destructive">Reintentar</LinkBtn>
            <LinkBtn className="text-muted-foreground font-medium">Ver policy</LinkBtn>
          </>}>
          Corrige estos 3 problemas y vuelve a publicar:
          <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-destructive/60">
            <li>El agente <span className="font-mono text-foreground/90">billing-copilot</span> no tiene región asignada.</li>
            <li>La regla <span className="font-mono text-foreground/90">block:ssn</span> referencia un patrón vacío.</li>
            <li>El límite de coste por run debe ser mayor que 0.</li>
          </ul>
        </Alert>
      ) : <Restore onClick={() => setShow(true)}>restaurar alerta</Restore>}
    </div>
  );
}

/* ── 4 · BANNER GLOBAL (horizontal) ──────────────────────────────────────── */
function Banner() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-3xl">
      {show ? (
        <div className="flex flex-col gap-3 rounded-lg border border-info/25 bg-info/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Icon name="bell2" size={18} stroke={1.9} className="shrink-0 text-info" />
            <p className="text-[13px] leading-6 text-foreground/85" style={{ textWrap: 'pretty' }}>
              <span className="font-semibold text-info">Mantenimiento programado.</span> El Fleet se reiniciará por zonas el 2 jul a las 02:00 UTC. No se espera downtime.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="inline-flex h-8 items-center rounded-md border border-info/40 px-3 text-[12.5px] font-semibold text-info transition-colors hover:bg-info/10">Ver detalles</button>
            <button type="button" onClick={() => setShow(false)} aria-label="Descartar" className="grid size-8 place-items-center rounded-md text-info transition-colors hover:bg-info/10"><Icon name="x" size={15} stroke={2.2} /></button>
          </div>
        </div>
      ) : <Restore onClick={() => setShow(true)}>restaurar banner</Restore>}
    </div>
  );
}

/* ── 5 · BANNER DE PRIMEROS PASOS (onboarding) ────────────────────── */
const STEPS = [
  { n: 1, title: 'Conectar proveedor', desc: 'Trae tus claves de OpenAI o Anthropic, o apunta a un endpoint propio.', cta: 'Conectar', disabled: false },
  { n: 2, title: 'Definir agente', desc: 'Crea el agente con su prompt, sus herramientas y un límite de coste por run.', cta: 'Crear agente', disabled: true, hint: 'Conecta un proveedor primero' },
  { n: 3, title: 'Publicar al Fleet', desc: 'Asigna región y policy, y empieza a servir tráfico real.', cta: 'Publicar', disabled: true, hint: 'Crea un agente primero' },
];

function StepButton({ disabled, hint, children }) {
  const base = 'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:w-auto';
  if (!disabled)
    return <button type="button" className={base + ' bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'}>{children}</button>;
  return (
    <div className="group relative inline-flex w-full sm:w-auto">
      <button type="button" disabled className={base + ' cursor-not-allowed bg-primary text-primary-foreground opacity-40'}>{children}</button>
      {hint && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11.5px] font-medium text-popover-foreground shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100">{hint}</span>
      )}
    </div>
  );
}

function Onboarding() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-3xl">
      {show ? (
        <div className="relative rounded-xl border border-border bg-background p-6 sm:p-7">
          <button onClick={() => setShow(false)} aria-label="Descartar"
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground">
            <Icon name="x" size={15} stroke={2.2} />
          </button>
          <h3 className="pr-8 text-[15px] font-semibold tracking-tight text-foreground">Pon en marcha tu primer agente</h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            Conecta un proveedor de modelos, define el comportamiento del agente y publicálo al Fleet para empezar a servir tráfico.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col justify-between gap-5 border-l-2 border-primary/25 pl-4">
                <div>
                  <span className="inline-flex items-center rounded-md bg-primary/14 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-primary">Paso {s.n}</span>
                  <h4 className="mt-3 text-[13.5px] font-semibold tracking-tight text-foreground">{s.title}</h4>
                  <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
                </div>
                <StepButton disabled={s.disabled} hint={s.hint}>{s.cta}</StepButton>
              </div>
            ))}
          </div>
        </div>
      ) : <Restore onClick={() => setShow(true)}>restaurar banner</Restore>}
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_ALERT = `// Alert de marca — un solo componente, tono semántico desde tokens
const TONE = {
  info:        { wrap: "border-info/25 bg-info/10",               fg: "text-info",        icon: "info"  },
  success:     { wrap: "border-primary/25 bg-primary/10",         fg: "text-primary",     icon: "check" },
  warning:     { wrap: "border-warning/30 bg-warning/10",         fg: "text-warning",     icon: "alert" },
  destructive: { wrap: "border-destructive/30 bg-destructive/10", fg: "text-destructive", icon: "alert" },
};

function Alert({ tone = "info", title, children, onDismiss, actions }) {
  const t = TONE[tone];
  return (
    <div className={"rounded-lg border p-4 " + t.wrap}>
      <div className="flex gap-3">
        <Icon name={t.icon} size={18} className={"mt-px shrink-0 " + t.fg} />
        <div className="min-w-0 flex-1">
          {title && <h3 className={"text-[13.5px] font-semibold " + t.fg}>{title}</h3>}
          {children && <div className="mt-1 text-[13px] leading-6 text-foreground/75">{children}</div>}
          {actions && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{actions}</div>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} aria-label="Descartar"
            className={"-mr-1 grid size-6 place-items-center rounded-md hover:bg-foreground/10 " + t.fg}>
            <XIcon />
          </button>
        )}
      </div>
    </div>
  );
}`;

const CODE_ACTIONS = `// Con acciones — links en el tono + uno neutro, y la ✕ para descartar
<Alert
  tone="warning"
  title="El workspace está al 92% del presupuesto"
  onDismiss={() => setShow(false)}
  actions={
    <>
      <button className="text-[12.5px] font-semibold text-warning hover:opacity-70">Subir límite</button>
      <button className="text-[12.5px] font-medium text-muted-foreground hover:opacity-70">Ver consumo</button>
    </>
  }
>
  Has consumido $9.2k de $10k este mes. Al 100% se pausan los agentes no críticos.
</Alert>`;

const CODE_ERRORS = `// Resumen de errores — destructive + lista de problemas
<Alert tone="destructive" title="No se pudo aplicar la policy «pii-redaction»">
  Corrige estos 3 problemas y vuelve a publicar:
  <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-destructive/60">
    <li>El agente <span className="font-mono text-foreground/90">billing-copilot</span> no tiene región.</li>
    <li>La regla <span className="font-mono text-foreground/90">block:ssn</span> referencia un patrón vacío.</li>
    <li>El límite de coste por run debe ser mayor que 0.</li>
  </ul>
</Alert>`;

const CODE_BANNER = `// Banner global — horizontal, mensaje + CTA ghost + descarte
<div className="flex flex-col gap-3 rounded-lg border border-info/25 bg-info/10 px-4 py-3
                sm:flex-row sm:items-center sm:justify-between">
  <div className="flex min-w-0 items-center gap-3">
    <BellIcon className="shrink-0 text-info" />
    <p className="text-[13px] text-foreground/85">
      <span className="font-semibold text-info">Mantenimiento programado.</span> El Fleet se reinicia el 2 jul a las 02:00 UTC.
    </p>
  </div>
  <div className="flex shrink-0 items-center gap-2">
    <button className="h-8 rounded-md border border-info/40 px-3 text-[12.5px] font-semibold text-info hover:bg-info/10">Ver detalles</button>
    <button onClick={dismiss} className="grid size-8 place-items-center rounded-md text-info hover:bg-info/10"><XIcon /></button>
  </div>
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
const CODE_ONBOARDING = `// Banner de primeros pasos — pasos numerados, acciones y descarte
const STEPS = [
  { n: 1, title: "Conectar proveedor", desc: "…", cta: "Conectar",    disabled: false },
  { n: 2, title: "Definir agente",     desc: "…", cta: "Crear agente", disabled: true, hint: "Conecta un proveedor primero" },
  { n: 3, title: "Publicar al Fleet",  desc: "…", cta: "Publicar",     disabled: true, hint: "Crea un agente primero" },
];

<div className="relative rounded-xl border border-border bg-background p-6 sm:p-7">
  <button onClick={dismiss} aria-label="Descartar"
    className="absolute right-3 top-3 grid size-7 place-items-center rounded-md
               text-muted-foreground hover:bg-secondary/70 hover:text-foreground">
    <XIcon />
  </button>
  <h3 className="pr-8 text-[15px] font-semibold text-foreground">Pon en marcha tu primer agente</h3>
  <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">
    Conecta un proveedor, define el agente y publicálo al Fleet para servir tráfico.
  </p>
  <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-3">
    {STEPS.map((s) => (
      <div key={s.n} className="flex flex-col justify-between gap-5 border-l-2 border-primary/25 pl-4">
        <div>
          <span className="inline-flex items-center rounded-md bg-primary/14 px-2 py-0.5
                           text-[11px] font-semibold text-primary">Paso {s.n}</span>
          <h4 className="mt-3 text-[13.5px] font-semibold text-foreground">{s.title}</h4>
          <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{s.desc}</p>
        </div>
        {s.disabled ? (
          <div className="group relative inline-flex">
            <button disabled className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-semibold
                                       text-primary-foreground opacity-40 cursor-not-allowed">{s.cta}</button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2
                             whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5
                             text-[11.5px] text-popover-foreground shadow-md opacity-0 group-hover:opacity-100">{s.hint}</span>
          </div>
        ) : (
          <button className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-semibold
                             text-primary-foreground shadow-sm hover:bg-primary/90">{s.cta}</button>
        )}
      </div>
    ))}
  </div>
</div>`;

function AlertsSection() {
  return (
    <div>
      <SectionHead kicker="Feedback" title="Alerts" status="done"
        intro="El banner-dentro-del-contenido: comunica estado o consecuencia justo donde ocurre. Un solo componente Alert cubre los cuatro tonos semánticos — info, éxito, aviso y destructivo — con icono, título y cuerpo opcionales. Cinco patrones de uso: los tonos, una alerta con acciones y descarte, un resumen de errores con lista, el banner global horizontal y un banner de primeros pasos con pasos numerados. El tono nunca compite con el verde de marca; todo el color sale de tokens." />

      <Variant title="Los cuatro tonos"
        desc="Info para novedades, primario (éxito) para confirmaciones, warning para riesgo recuperable y destructive para fallo. Borde + relleno soft del tono, icono y título en el color, cuerpo en foreground atenuado para que lea en los tres temas."
        code={CODE_ALERT}>
        <Tones />
      </Variant>

      <Variant title="Con acciones y descarte"
        desc="Acciones como links: la principal en el tono, las secundarias en neutro, y la ✕ para descartar. Pulsa la ✕ para cerrarla — el enlace la restaura."
        code={CODE_ACTIONS}>
        <ActionAlert />
      </Variant>

      <Variant title="Resumen de errores"
        desc="Destructive con una lista de problemas concretos: ideal tras validar un formulario o publicar una policy. El cuerpo admite cualquier contenido — aquí, una lista con viñetas en el tono."
        code={CODE_ERRORS}>
        <ErrorSummary />
      </Variant>

      <Variant title="Banner global"
        desc="Variante horizontal para avisos de todo el workspace: mensaje a la izquierda, CTA ghost y descarte a la derecha. Se apila en móvil y pasa a fila en sm+."
        code={CODE_BANNER}>
        <Banner />
      </Variant>

      <Variant title="Banner de primeros pasos"
        desc="Onboarding dentro del contenido: título, intro y pasos numerados con su acción. El primer paso está activo; los siguientes se desbloquean en orden — pasa el cursor sobre un botón bloqueado para ver el requisito. La ✕ lo descarta."
        code={CODE_ONBOARDING}>
        <Onboarding />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['alerts'] = AlertsSection;
})();
