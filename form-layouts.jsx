/* ============================================================================
   Gntik UI · form-layouts.jsx — composiciones de formulario (grupo "Formularios").
   Tres layouts canónicos sobre primitivas de marca (input · select nativo ·
   textarea · checkbox · radio-card), todo con tokens:
     1 · Ajustes con secciones — etiqueta a la izquierda, campos a la derecha.
     2 · Solicitud con paquetes — campos + tarjetas de capacidad seleccionables.
     3 · Crear workspace — dos columnas: plan en tarjetas + panel de ayuda.
   Dominio musematic (operador · workspace · Fleet · costes). Cero color hardcodeado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── primitivas de campo (reutilizadas por los 3 formularios) ─────────────── */
const labelCls = "block text-[13px] font-medium text-foreground";
const fieldCls =
  "block w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground " +
  "placeholder:text-muted-foreground shadow-sm transition-colors " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

const Input = ({ className = "", ...p }) => (
  <input {...p} className={fieldCls + " h-9 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground " + className} />
);

const Textarea = ({ className = "", rows = 4, ...p }) => (
  <textarea rows={rows} {...p} className={fieldCls + " py-2 leading-6 resize-none " + className} />
);

const NativeSelect = ({ className = "", children, ...p }) => (
  <div className="relative">
    <select {...p} className={fieldCls + " h-9 appearance-none pr-9 cursor-pointer " + className}>{children}</select>
    <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const Field = ({ label, htmlFor, required, hint, children, className = "" }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}{required && <span className="text-destructive">*</span>}
    </label>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-2 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{hint}</p>}
  </div>
);

/* checkbox de marca — input nativo estilizado (igual que en Tables) */
const Check = ({ checked, onChange }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px] shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-background cursor-pointer checked:bg-primary checked:border-primary transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100">
      <Icon name="check" size={13} stroke={2.4} />
    </span>
  </span>
);

const Divider = ({ className = "" }) => <div className={"border-t border-border " + className} />;

const SubmitBtn = ({ label, done, doneLabel }) => (
  <button type="submit"
    className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
    {done && <Icon name="check" size={15} stroke={2.4} />}{done ? doneLabel : label}
  </button>
);
const GhostBtn = ({ children, ...p }) => (
  <button type="button" {...p}
    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </button>
);

/* envoltura de variante — superficie de preview punteada, formulario al desnudo */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 lg:p-10">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* hook mínimo: feedback efímero al enviar (sin acción real) */
function useSubmitFlash() {
  const [done, setDone] = useState(false);
  const fire = (e) => { if (e) e.preventDefault(); setDone(true); setTimeout(() => setDone(false), 1600); };
  return [done, fire];
}

/* ════════════════════════════════════════════════════════════════════════
   1 · AJUSTES CON SECCIONES — operador · workspace · alertas
   ════════════════════════════════════════════════════════════════════════ */
const SettingsHead = ({ title, desc }) => (
  <div>
    <h3 className="font-sans font-semibold text-[14px] text-foreground">{title}</h3>
    <p className="mt-1 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{desc}</p>
  </div>
);

const TEAM_ALERTS = [
  { id: 'access', label: 'Solicitudes de acceso al workspace', on: true },
  { id: 'digest', label: 'Resumen semanal de actividad del equipo', on: false },
];
const OPS_ALERTS = [
  { id: 'cost', label: 'Picos de coste por namespace', on: true },
  { id: 'latency', label: 'Latencia alta de agentes', on: false },
  { id: 'retries', label: 'Reintentos y caídas al fallback', on: true },
  { id: 'quota', label: 'Cuota de tokens cerca del límite', on: true },
];

function SettingsForm() {
  const [checks, setChecks] = useState(() => {
    const o = {}; [...TEAM_ALERTS, ...OPS_ALERTS].forEach(a => o[a.id] = a.on); return o;
  });
  const toggle = (id) => setChecks(c => ({ ...c, [id]: !c[id] }));
  const [done, fire] = useSubmitFlash();

  const AlertList = ({ items }) => (
    <div className="mt-3 rounded-md border border-border bg-background/40 divide-y divide-border/60">
      {items.map(a => (
        <label key={a.id} htmlFor={a.id} className="flex items-center gap-3 px-3.5 h-[46px] cursor-pointer">
          <Check checked={checks[a.id]} onChange={() => toggle(a.id)} />
          <span className="text-[13px] font-medium text-foreground select-none">{a.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <form onSubmit={fire} className="mx-auto w-full max-w-4xl">
      {/* Perfil del operador */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Perfil del operador" desc="Cómo apareces en runs, auditorías y asignaciones dentro del workspace." />
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Field className="col-span-full sm:col-span-3" label="Nombre" htmlFor="first-name">
              <Input id="first-name" name="first-name" autoComplete="given-name" placeholder="Emma" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Apellido" htmlFor="last-name">
              <Input id="last-name" name="last-name" autoComplete="family-name" placeholder="Crown" />
            </Field>
            <Field className="col-span-full" label="Email de trabajo" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="emma@empresa.com" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Zona horaria" htmlFor="tz">
              <NativeSelect id="tz" name="tz" defaultValue="eu">
                <option value="eu">Europe/Madrid (CET)</option>
                <option value="us-e">America/New_York (EST)</option>
                <option value="us-w">America/Los_Angeles (PST)</option>
              </NativeSelect>
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Rol" htmlFor="role"
              hint="El rol solo lo puede cambiar un administrador del sistema.">
              <Input id="role" name="role" placeholder="Operador senior" disabled defaultValue="Operador senior" />
            </Field>
          </div>
        </div>
      </div>

      <Divider className="my-9" />

      {/* Ajustes del workspace */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Ajustes del workspace" desc="Nombre, visibilidad y descripción del workspace actual." />
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Field className="col-span-full sm:col-span-3" label="Nombre del workspace" htmlFor="ws-name">
              <Input id="ws-name" name="ws-name" placeholder="prod-workspace" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Visibilidad" htmlFor="ws-vis">
              <NativeSelect id="ws-vis" name="ws-vis" defaultValue="private">
                <option value="private">Privado</option>
                <option value="public">Público</option>
              </NativeSelect>
            </Field>
            <Field className="col-span-full" label="Descripción" htmlFor="ws-desc"
              hint="Nota: la descripción no se muestra fuera de la organización.">
              <Textarea id="ws-desc" name="ws-desc" rows={4} placeholder="Para qué sirve este workspace…" />
            </Field>
          </div>
        </div>
      </div>

      <Divider className="my-9" />

      {/* Alertas */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Alertas" desc="Elige qué eventos del equipo y de operación quieres recibir." />
        <div className="md:col-span-2 space-y-7">
          <fieldset>
            <legend className="text-[13px] font-medium text-foreground">Equipo</legend>
            <p className="mt-1 text-[13px] text-muted-foreground">Avisos sobre acceso y actividad del equipo.</p>
            <AlertList items={TEAM_ALERTS} />
          </fieldset>
          <fieldset>
            <legend className="text-[13px] font-medium text-foreground">Operación</legend>
            <p className="mt-1 text-[13px] text-muted-foreground">Señales del Fleet: coste, latencia y fiabilidad de los agentes.</p>
            <AlertList items={OPS_ALERTS} />
          </fieldset>
        </div>
      </div>

      <Divider className="my-9" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Volver</GhostBtn>
        <SubmitBtn label="Guardar ajustes" done={done} doneLabel="Guardado" />
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · SOLICITUD CON PAQUETES — campos + tarjetas de capacidad seleccionables
   ════════════════════════════════════════════════════════════════════════ */
const PACKAGES = [
  { id: 'starter',    title: 'Starter',    desc: 'Hasta 10.000 requests al día.',     price: 'Gratis',
    features: ['Soporte de comunidad', '50 GB de almacenamiento', 'Constructor de agentes integrado'] },
  { id: 'premium',    title: 'Premium',    desc: '500.000 requests al día¹',          price: '$900/mes²',
    features: ['Soporte por Slack Connect', '100 GB de almacenamiento', 'Workspace gestionado', 'Constructor de agentes integrado'] },
  { id: 'enterprise', title: 'Enterprise', desc: 'Según las necesidades de tu equipo', price: 'A medida',
    features: ['Soporte prioritario por Slack Connect', 'Almacenamiento ilimitado', 'Constructor de agentes integrado', 'Descuento por volumen'] },
];

function PackagesForm() {
  const [sel, setSel] = useState('starter');
  const [done, fire] = useSubmitFlash();
  const pkg = PACKAGES.find(p => p.id === sel);

  return (
    <form onSubmit={fire} className="mx-auto w-full max-w-2xl">
      <h3 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">Solicitar capacidad para un equipo</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Provisiona un workspace con cuota dedicada. Aprobamos la solicitud y dejamos el namespace listo en menos de un día hábil.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field className="col-span-full sm:col-span-3" label="Nombre" htmlFor="p-first" required>
          <Input id="p-first" name="p-first" autoComplete="given-name" required placeholder="Emma" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Apellido" htmlFor="p-last">
          <Input id="p-last" name="p-last" autoComplete="family-name" placeholder="Crown" />
        </Field>
        <Field className="col-span-full" label="Email de trabajo" htmlFor="p-email" required>
          <Input id="p-email" name="p-email" type="email" autoComplete="email" required placeholder="emma@empresa.com" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Equipo" htmlFor="p-team">
          <Input id="p-team" name="p-team" autoComplete="organization" placeholder="Plataforma, Soporte…" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Tamaño del equipo" htmlFor="p-size">
          <NativeSelect id="p-size" name="p-size" defaultValue="">
            <option value="" disabled>Selecciona…</option>
            <option value="1-9">1–9</option>
            <option value="10-50">10–50</option>
            <option value="50-250">50–250</option>
            <option value="250+">250+</option>
          </NativeSelect>
        </Field>
      </div>

      <Divider className="my-8" />

      <div role="radiogroup" aria-label="Paquete de capacidad">
        <p className="text-[13px] font-semibold text-foreground">Elige un paquete de capacidad</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PACKAGES.map(p => {
            const on = sel === p.id;
            return (
              <button type="button" key={p.id} role="radio" aria-checked={on} onClick={() => setSel(p.id)}
                className={"relative flex flex-col rounded-md border bg-background p-4 text-left transition-colors " +
                  (on ? "border-primary/60 ring-2 ring-primary/25" : "border-border hover:border-muted-foreground/40")}>
                <span className="block text-[13px] font-semibold text-foreground">{p.title}</span>
                <span className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{p.desc}</span>
                <span className="mt-6 text-[13px] font-semibold text-foreground">{p.price}</span>
                <span className={"absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity " + (on ? "opacity-100" : "opacity-0")}>
                  <Icon name="check" size={13} stroke={2.6} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[13px] font-medium text-foreground">Incluye:</p>
        <ul role="list" className="mt-2 space-y-2">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-primary shrink-0" />
              <span className="text-[13px] text-foreground/85">{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[12px] text-muted-foreground"><sup>1</sup> $0,5 / 10K requests al superar el límite.</p>
        <p className="mt-1 text-[12px] text-muted-foreground"><sup>2</sup> No se requiere tarjeta para registrarse.</p>
      </div>

      <Divider className="my-8" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Volver</GhostBtn>
        <SubmitBtn label="Solicitar acceso" done={done} doneLabel="Solicitud enviada" />
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · CREAR WORKSPACE — dos columnas: plan en tarjetas + panel de ayuda
   ════════════════════════════════════════════════════════════════════════ */
const PLANS = [
  { id: 'hobby', name: 'Hobby', price: '$40', recommended: false,
    features: ['1.000 requests al día', '3 entornos', 'Hasta 10 operadores', 'Soporte de comunidad'] },
  { id: 'premium', name: 'Premium', price: '$80', recommended: true,
    features: ['100.000 requests al día', '10 entornos', 'Hasta 50 operadores', 'Soporte premium por Slack'] },
  { id: 'enterprise', name: 'Enterprise', price: '$160', recommended: false,
    features: ['Requests ilimitados', 'Entornos y operadores ilimitados', 'SSO con SAML', 'SLA del 99,99 %', 'Descuento por volumen'] },
];
const WS_HIGHLIGHTS = [
  'Lo usan equipos de operación 24/7',
  'Construido sobre tecnología open-source',
  'La mayor comunidad de operadores',
];

function CreateWorkspaceForm() {
  const [sel, setSel] = useState('hobby');
  const [done, fire] = useSubmitFlash();

  return (
    <form onSubmit={fire} className="w-full">
      <h3 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">Crear nuevo workspace</h3>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
        {/* columna principal */}
        <div className="lg:col-span-7">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
              <Field className="sm:w-56 shrink-0" label="Organización" htmlFor="ws-org">
                <NativeSelect id="ws-org" name="ws-org" defaultValue="1">
                  <option value="1">Acme, Inc.</option>
                  <option value="2">Hero Labs</option>
                  <option value="3">Rose Holding</option>
                </NativeSelect>
              </Field>
              <Field className="flex-1" label="Nombre del workspace" htmlFor="ws-new">
                <Input id="ws-new" name="ws-new" placeholder="prod-eu" />
              </Field>
            </div>
            <Field label="Región" htmlFor="ws-region"
              hint="Para el mejor rendimiento, elige la región más cercana a tu operación.">
              <NativeSelect id="ws-region" name="ws-region" defaultValue="1">
                <option value="1">EU-West (Frankfurt)</option>
                <option value="2">US-East (Boston)</option>
                <option value="3">US-West (San Francisco)</option>
              </NativeSelect>
            </Field>
          </div>

          <h4 className="mt-10 text-[13px] font-medium text-foreground">Tipo de plan<span className="text-destructive">*</span></h4>
          <div role="radiogroup" aria-label="Tipo de plan" className="mt-3 space-y-4">
            {PLANS.map(plan => {
              const on = sel === plan.id;
              return (
                <button type="button" key={plan.id} role="radio" aria-checked={on} onClick={() => setSel(plan.id)}
                  className={"relative block w-full overflow-hidden rounded-md border bg-background text-left transition-colors " +
                    (on ? "border-primary/60 ring-2 ring-primary/25" : "border-border hover:border-muted-foreground/40")}>
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className={"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors " +
                      (on ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background")}>
                      <span className={"size-1.5 rounded-full " + (on ? "bg-primary-foreground" : "bg-transparent")} />
                    </span>
                    <div className="w-full">
                      <p className="flex items-center gap-2 leading-6">
                        <span className="text-[13px] font-semibold text-foreground">{plan.name}</span>
                        {plan.recommended && (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/14">recomendado</span>
                        )}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                            <Icon name="check" size={14} className="text-muted-foreground/60 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border bg-background/60 px-5 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-primary hover:underline underline-offset-4">
                      Saber más <Icon name="external" size={13} />
                    </span>
                    <div>
                      <span className="text-[15px] font-semibold text-foreground">{plan.price}</span>
                      <span className="text-[12.5px] text-muted-foreground">/mes</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* panel de ayuda */}
        <div className="lg:col-span-5">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <h4 className="text-[13px] font-semibold text-foreground">¿Qué plan encaja mejor?</h4>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
              Empieza en Hobby para validar un agente y sube a Premium cuando el tráfico sea constante. Enterprise añade SSO, SLA y soporte dedicado.
            </p>
            <ul role="list" className="mt-4 space-y-3">
              {WS_HIGHLIGHTS.map((h, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon name="check" size={13} stroke={2.4} /></span>
                  <span className="text-[13px] text-foreground/85">{h}</span>
                </li>
              ))}
            </ul>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline underline-offset-4">
              Comparar planes de workspace <Icon name="external" size={14} />
            </a>
          </div>
        </div>
      </div>

      <Divider className="my-8" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Cancelar</GhostBtn>
        <SubmitBtn label="Crear workspace" done={done} doneLabel="Workspace creado" />
      </div>
    </form>
  );
}

/* ── snippets para pegar ─────────────────────────────────────────────────── */
const CODE_PRIMS = `// Primitivas de campo — input recessed (bg-background) + ring de marca
const field =
  "block w-full rounded-md border border-border bg-background px-3 text-[13px] " +
  "text-foreground placeholder:text-muted-foreground shadow-sm transition-colors " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

const Input = (p) => <input {...p} className={\`\${field} h-9\`} />;
const Textarea = (p) => <textarea {...p} className={\`\${field} py-2 leading-6 resize-none\`} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={\`\${field} h-9 appearance-none pr-9 cursor-pointer\`}>{children}</select>
    <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);
const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-[13px] font-medium text-foreground">
      {label}{required && <span className="text-destructive">*</span>}
    </label>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
  </div>
);`;

const CODE_SETTINGS = `// Ajustes con secciones — etiqueta a la izquierda, campos a la derecha
{sections.map((s) => (
  <div key={s.id} className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
    <div>
      <h3 className="text-[14px] font-semibold text-foreground">{s.title}</h3>
      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{s.desc}</p>
    </div>
    <div className="md:col-span-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">{s.fields /* col-span-3 / col-span-full */}</div>
    </div>
  </div>
))}
// Lista de alertas: checkbox de marca en filas divididas
<div className="rounded-md border border-border bg-background/40 divide-y divide-border/60">
  {alerts.map((a) => (
    <label key={a.id} className="flex items-center gap-3 px-3.5 h-[46px] cursor-pointer">
      <Check checked={checks[a.id]} onChange={() => toggle(a.id)} />
      <span className="text-[13px] font-medium text-foreground">{a.label}</span>
    </label>
  ))}
</div>
// pie: <Divider /> + acciones a la derecha (Volver · Guardar ajustes)`;

const CODE_PACKAGES = `// Tarjetas de capacidad seleccionables — el "Incluye" reacciona a la elección
const [sel, setSel] = useState('starter');
const pkg = PACKAGES.find((p) => p.id === sel);

<div role="radiogroup" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {PACKAGES.map((p) => {
    const on = sel === p.id;
    return (
      <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(p.id)}
        className={\`relative flex flex-col rounded-md border bg-background p-4 text-left transition-colors \${
          on ? 'border-primary/60 ring-2 ring-primary/25' : 'border-border hover:border-muted-foreground/40'}\`}>
        <span className="text-[13px] font-semibold text-foreground">{p.title}</span>
        <span className="mt-1 text-[12.5px] text-muted-foreground">{p.desc}</span>
        <span className="mt-6 text-[13px] font-semibold text-foreground">{p.price}</span>
        {on && (
          <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon />
          </span>
        )}
      </button>
    );
  })}
</div>

<ul className="mt-2 space-y-2">
  {pkg.features.map((f, i) => (
    <li key={i} className="flex items-center gap-2 text-[13px] text-foreground/85">
      <CheckIcon className="text-primary" />{f}
    </li>
  ))}
</ul>`;

const CODE_WORKSPACE = `// Crear workspace — plan en tarjetas (col 7) + panel de ayuda (col 5)
<div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
  <div className="lg:col-span-7">
    {/* Organización + Nombre (fila) · Región (con hint) */}
    <div role="radiogroup" className="mt-3 space-y-4">
      {PLANS.map((plan) => {
        const on = sel === plan.id;
        return (
          <button key={plan.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(plan.id)}
            className={\`relative block w-full overflow-hidden rounded-md border bg-background text-left transition-colors \${
              on ? 'border-primary/60 ring-2 ring-primary/25' : 'border-border hover:border-muted-foreground/40'}\`}>
            <div className="flex items-start gap-3 px-5 py-4">
              <span className={\`mt-0.5 flex size-4 items-center justify-center rounded-full border \${
                on ? 'border-primary bg-primary' : 'border-muted-foreground/40'}\`}>
                <span className={\`size-1.5 rounded-full \${on ? 'bg-primary-foreground' : ''}\`} />
              </span>
              <div>
                <span className="text-[13px] font-semibold text-foreground">{plan.name}</span>
                {plan.recommended && <Badge>recomendado</Badge>}
                <ul>{plan.features.map((f) => <li key={f}><CheckIcon />{f}</li>)}</ul>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-background/60 px-5 py-2.5">
              <a className="text-primary">Saber más</a>
              <span className="text-[15px] font-semibold text-foreground">{plan.price}<small>/mes</small></span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
  <aside className="lg:col-span-5">{/* panel bg-secondary/50 con highlights */}</aside>
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function FormLayoutsSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Form layouts" status="done"
        intro="Composiciones completas de formulario sobre las primitivas de marca: input, select nativo, textarea, checkbox y radio-card, todas con el ring verde y los radios y sombras de los tokens. Tres layouts canónicos del dominio musematic — ajustes con secciones, una solicitud de capacidad y la creación de un workspace. Los campos van recessed (bg-background) sobre la card y todo reacciona en vivo: marca, escribe y envía." />

      <Variant title="Primitivas de campo"
        desc="La base que comparten los tres formularios. Campo recessed con borde de token, ring de marca al enfocar, y un wrapper Field con etiqueta, asterisco de requerido y nota de ayuda. Select nativo con su propio chevron."
        code={CODE_PRIMS}>
        <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Email de trabajo" htmlFor="demo-email" required>
            <Input id="demo-email" type="email" placeholder="emma@empresa.com" />
          </Field>
          <Field label="Región" htmlFor="demo-region">
            <NativeSelect id="demo-region" defaultValue="1">
              <option value="1">EU-West (Frankfurt)</option>
              <option value="2">US-East (Boston)</option>
            </NativeSelect>
          </Field>
          <Field className="sm:col-span-2" label="Descripción" htmlFor="demo-desc" hint="Texto de ayuda bajo el campo.">
            <Textarea id="demo-desc" rows={3} placeholder="Para qué sirve este workspace…" />
          </Field>
          <Field label="Estado" htmlFor="demo-disabled" hint="Campo deshabilitado.">
            <Input id="demo-disabled" disabled defaultValue="Solo lectura" />
          </Field>
          <div>
            <span className={labelCls}>Alerta</span>
            <label className="mt-2 flex items-center gap-3 h-9 cursor-pointer">
              <Check checked onChange={() => {}} />
              <span className="text-[13px] font-medium text-foreground">Picos de coste</span>
            </label>
          </div>
        </div>
      </Variant>

      <Variant title="Ajustes con secciones"
        desc="El layout clásico de página de ajustes: cada bloque lleva su título y descripción a la izquierda y los campos en una rejilla a la derecha, separados por divisores. Perfil del operador, ajustes del workspace y una lista de alertas con checkboxes que togglean en vivo."
        code={CODE_SETTINGS}>
        <SettingsForm />
      </Variant>

      <Variant title="Solicitud con paquetes"
        desc="Un formulario de alta con tarjetas de capacidad seleccionables. Elige Starter, Premium o Enterprise y la lista «Incluye» se actualiza al instante; la tarjeta activa toma el ring verde y la marca de check."
        code={CODE_PACKAGES}>
        <PackagesForm />
      </Variant>

      <Variant title="Crear workspace"
        desc="Layout a dos columnas: a la izquierda los datos y el plan como tarjetas apiladas con features y precio; a la derecha un panel de ayuda que sostiene la decisión. El plan recomendado se marca y la selección resalta con el ring de marca."
        code={CODE_WORKSPACE}>
        <CreateWorkspaceForm />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['form-layouts'] = FormLayoutsSection;
})();
