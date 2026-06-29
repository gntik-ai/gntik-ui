/* ============================================================================
   Gntik UI · feeds.jsx — timelines de actividad (van en el grupo "Listas").
   El feed cuenta qué le pasó a un recurso en el tiempo: el lifecycle de un run,
   el hilo de una incidencia, el registro de un agente. Tres patrones:
   timeline con iconos · stream con comentarios + compositor · feed mixto
   (comentarios · asignaciones · etiquetas). Dominio musematic · tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── nodos del timeline (tiles OPACOS, para que la línea no se transparente) ─ */
const NODE = {
  muted:   'bg-secondary text-muted-foreground',
  accent:  'bg-accent text-accent-foreground',
  primary: 'bg-primary text-primary-foreground',
};
/* ── tints semánticos (pills/tiles sobre superficie de card) ─────────────── */
const TINT = {
  primary:     'bg-primary/15 text-primary',
  info:        'bg-info/15 text-info',
  warning:     'bg-warning/16 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
  muted:       'bg-muted text-muted-foreground',
};

/* ── avatar de iniciales (brand-tinted, igual que en stacked-lists) ──────── */
const Avatar = ({ initials, size = 24 }) => (
  <span className="rounded-full bg-primary/14 text-primary font-mono font-semibold inline-flex items-center justify-center shrink-0"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}>{initials}</span>
);

/* ── envoltura de variante (card, padding holgado para que respire el hilo) ─ */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── catálogo de marcas para el compositor (estado, no severidad-como-marca) ─ */
const MARKS = [
  { v: 'investigando', name: 'Investigando', icon: 'eye',    tone: 'info' },
  { v: 'mitigado',     name: 'Mitigado',     icon: 'shield', tone: 'primary' },
  { v: 'bloqueado',    name: 'Bloqueado',    icon: 'alert',  tone: 'destructive' },
  { v: 'espera',       name: 'En espera',    icon: 'clock',  tone: 'muted' },
  { v: 'resuelto',     name: 'Resuelto',     icon: 'check',  tone: 'primary' },
];
const markOf = (v) => MARKS.find((m) => m.v === v) || MARKS[0];

/* ── datos ───────────────────────────────────────────────────────────────── */
// 1 · lifecycle de un run (progresión neutro → verde)
const LIFECYCLE = [
  { tone: 'muted',   icon: 'inbox',  content: 'Encolado desde',  target: 'webhook · POST /ingest', at: '10:32:01' },
  { tone: 'muted',   icon: 'net',    content: 'Programado en',   target: 'worker eu-west-1 · w-7', at: '10:32:01' },
  { tone: 'accent',  icon: 'shield', content: 'Aprobado por',    target: 'policy · cost-guard',    at: '10:32:02' },
  { tone: 'accent',  icon: 'bolt',   content: 'Invocó modelo',   target: 'claude-sonnet-4',        at: '10:32:02' },
  { tone: 'primary', icon: 'check',  content: 'Run completado',  target: '18.2k tok · $0.21',      at: '10:32:09' },
];

// 2 · stream de una incidencia (eventos = punto en la línea · comentario = card)
const STREAM = [
  { type: 'event',   who: 'Dana Ruiz',   init: 'DR', verb: 'abrió la incidencia', when: '7d' },
  { type: 'event',   who: 'Marco Vidal', init: 'MV', verb: 'escaló a on-call',    when: '6d' },
  { type: 'comment', who: 'Lena Ortiz',  init: 'LO', when: '3d',
    body: 'Confirmado el pico de latencia en eu-west-1 — el cost-guard cortó dos agentes. Bajo la concurrencia a la mitad y observo 10 min.' },
  { type: 'event',   who: 'Sam Cho',     init: 'SC', verb: 'revisó el runbook',   when: '2d' },
  { type: 'done',    who: 'Marco Vidal', init: 'MV', verb: 'resolvió la incidencia', when: '1d' },
];

// 3 · feed mixto (comentario · asignación · etiquetas)
const MIXED = [
  { id: 1, type: 'comment', who: 'Eduardo Benz', init: 'EB', when: '6d',
    body: 'El agente support-triage devolvió 5xx durante el pico. Reintentó tres veces antes de caer al fallback — adjunto el trace del run.' },
  { id: 2, type: 'assignment', who: 'Hilary Mahy', init: 'HM', assigned: 'Kristin Watson', when: '2d' },
  { id: 3, type: 'tags', who: 'Hilary Mahy', init: 'HM', when: '6h',
    tags: [
      { name: 'Latencia',  dot: 'fill-category-rose' },
      { name: 'eu-west-1', dot: 'fill-category-cyan' },
      { name: 'Coste',     dot: 'fill-category-amber' },
    ] },
  { id: 4, type: 'comment', who: 'Jason Meyers', init: 'JM', when: '2h',
    body: 'Subí el timeout del upstream a 8s y activé el circuit-breaker. Sin 5xx en la última hora — cierro si se mantiene.' },
];

/* ── variante 2 interactiva: stream + compositor que publica al hilo ──────── */
function ActivityFeed() {
  const [items, setItems] = useState(STREAM);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [mark, setMark] = useState(null);
  const pickRef = useRef(null);
  useClickOutside(pickRef, () => setOpen(false), open);

  const submit = (e) => {
    if (e) e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setItems((xs) => [...xs, { type: 'comment', who: 'Tú', init: 'TÚ', when: 'ahora', body: t, mark }]);
    setText(''); setMark(null); setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <ul role="list" className="space-y-6">
        {items.map((it, i) => (
          <li key={i} className="relative flex gap-3">
            {/* línea de conexión */}
            <div className={"absolute left-0 top-0 flex w-6 justify-center " + (i === items.length - 1 ? 'h-6' : '-bottom-6')}>
              <span className="w-px bg-border" />
            </div>

            {it.type === 'comment' ? (
              <>
                <span className="relative z-10 mt-1.5"><Avatar initials={it.init} size={24} /></span>
                <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{it.who}</span> comentó
                      {it.mark && (
                        <span className={"ml-2 inline-flex items-center gap-1 h-[18px] px-1.5 rounded font-mono text-[10px] font-semibold align-middle " + TINT[markOf(it.mark).tone]}>
                          <Icon name={markOf(it.mark).icon} size={11} />{markOf(it.mark).name}
                        </span>
                      )}
                    </div>
                    <time className="shrink-0 font-mono text-[11px] text-muted-foreground">{it.when}</time>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground/80" style={{ textWrap: 'pretty' }}>{it.body}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative z-10 flex size-6 flex-none items-center justify-center bg-card">
                  {it.type === 'done'
                    ? <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon name="check" size={13} /></span>
                    : <span className="size-1.5 rounded-full bg-muted-foreground/40 ring-2 ring-border" />}
                </div>
                <p className="flex-auto py-0.5 text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{it.who}</span> {it.verb}.
                </p>
                <time className="flex-none py-0.5 font-mono text-[11px] text-muted-foreground">{it.when}</time>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* compositor */}
      <div className="mt-6 flex gap-3">
        <span className="mt-0.5"><Avatar initials="TÚ" size={24} /></span>
        <form onSubmit={submit} className="relative flex-auto">
          <div className="rounded-lg border border-border bg-background/50 transition-colors focus-within:border-primary/50">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Añade un comentario…"
              className="block w-full resize-none bg-transparent px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-2">
              <div ref={pickRef} className="flex items-center gap-0.5">
                <button type="button" aria-label="Adjuntar archivo"
                  className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50">
                  <Icon name="paperclip" size={16} />
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Marcar estado"
                    className="size-8 inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent/50">
                    {mark
                      ? <span className={"size-6 inline-flex items-center justify-center rounded-md " + TINT[markOf(mark).tone]}><Icon name={markOf(mark).icon} size={14} /></span>
                      : <span className="text-muted-foreground"><Icon name="spark" size={16} /></span>}
                  </button>
                  {open && (
                    <div className="absolute bottom-10 left-0 z-20 w-52 rounded-lg border border-border bg-popover py-1.5 shadow-md">
                      {MARKS.map((m) => (
                        <button key={m.v} type="button" onClick={() => { setMark(m.v); setOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors hover:bg-accent/50">
                          <span className={"size-7 inline-flex items-center justify-center rounded-md " + TINT[m.tone]}><Icon name={m.icon} size={14} /></span>
                          <span className="text-[12.5px] text-foreground">{m.name}</span>
                          {mark === m.v && <Icon name="check" size={14} className="ml-auto text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" disabled={!text.trim()}
                className="h-8 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                Comentar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_TIMELINE = `// Timeline con iconos — nodo opaco sobre la línea + acción/objeto + hora
<ul role="list" className="-mb-6">
  {events.map((e, i) => (
    <li key={i}>
      <div className="relative pb-6">
        {i !== events.length - 1 && (
          <span aria-hidden className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" />
        )}
        <div className="relative flex gap-3">
          <span className={\`flex size-8 items-center justify-center rounded-full ring-8 ring-card \${NODE[e.tone]}\`}>
            <Icon name={e.icon} size={16} />
          </span>
          <div className="flex min-w-0 flex-1 justify-between gap-4 pt-1.5">
            <p className="text-[13px] text-muted-foreground">
              {e.content} <span className="font-semibold text-foreground">{e.target}</span>
            </p>
            <time className="shrink-0 font-mono text-[11px] text-muted-foreground">{e.at}</time>
          </div>
        </div>
      </div>
    </li>
  ))}
</ul>
// NODE = { muted:'bg-secondary text-muted-foreground', accent:'bg-accent text-accent-foreground', primary:'bg-primary text-primary-foreground' }`;

const CODE_ACTIVITY = `// Stream con comentarios — evento = punto en la línea, comentario = card
<ul role="list" className="space-y-6">
  {items.map((it, i) => (
    <li key={i} className="relative flex gap-3">
      <div className={\`absolute left-0 top-0 flex w-6 justify-center \${i === items.length - 1 ? 'h-6' : '-bottom-6'}\`}>
        <span className="w-px bg-border" />
      </div>
      {it.type === 'comment' ? (
        <>
          <span className="relative z-10 mt-1.5"><Avatar initials={it.init} /></span>
          <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
            <div className="flex justify-between gap-3 text-[12px] text-muted-foreground">
              <span><b className="text-foreground">{it.who}</b> comentó</span>
              <time>{it.when}</time>
            </div>
            <p className="mt-1 text-[13px] text-foreground/80">{it.body}</p>
          </div>
        </>
      ) : (
        <>
          <div className="relative z-10 flex size-6 items-center justify-center bg-card">
            {it.type === 'done'
              ? <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><CheckIcon /></span>
              : <span className="size-1.5 rounded-full bg-muted-foreground/40 ring-2 ring-border" />}
          </div>
          <p className="flex-auto py-0.5 text-[12px] text-muted-foreground">
            <b className="text-foreground">{it.who}</b> {it.verb}.
          </p>
          <time className="py-0.5 font-mono text-[11px] text-muted-foreground">{it.when}</time>
        </>
      )}
    </li>
  ))}
</ul>
// + compositor: textarea + adjuntar + picker de estado (Listbox) + "Comentar"`;

const CODE_MIXED = `// Feed mixto — comentario (avatar + badge), asignación y etiquetas
<ul role="list" className="-mb-8">
  {feed.map((it, i) => (
    <li key={it.id}>
      <div className="relative pb-8">
        {i !== feed.length - 1 && (
          <span aria-hidden className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
        )}
        <div className="relative flex items-start gap-3">
          {it.type === 'comment' && (
            <>
              <span className="relative">
                <Avatar initials={it.init} size={40} />
                <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-card px-0.5 py-px">
                  <Icon name="chat" size={15} className="text-muted-foreground" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <b className="text-[13px] text-foreground">{it.who}</b>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Comentó {it.when}</p>
                <p className="mt-2 text-[13px] text-foreground/80">{it.body}</p>
              </div>
            </>
          )}
          {it.type === 'assignment' && (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card">
                <Icon name="user" size={16} />
              </span>
              <p className="min-w-0 flex-1 pt-1.5 text-[13px] text-muted-foreground">
                <b className="text-foreground">{it.who}</b> asignó a <b className="text-foreground">{it.assigned}</b>
                <span className="ml-1 whitespace-nowrap">· {it.when}</span>
              </p>
            </>
          )}
          {it.type === 'tags' && (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card">
                <Icon name="tag" size={16} />
              </span>
              <p className="min-w-0 flex-1 pt-1 text-[13px] text-muted-foreground">
                <b className="text-foreground">{it.who}</b> añadió etiquetas{' '}
                {it.tags.map((t) => (
                  <span key={t.name} className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground">
                    <svg viewBox="0 0 6 6" className={\`size-1.5 \${t.dot}\`}><circle cx="3" cy="3" r="3" /></svg>{t.name}
                  </span>
                ))}{' '}
                <span className="whitespace-nowrap">· {it.when}</span>
              </p>
            </>
          )}
        </div>
      </div>
    </li>
  ))}
</ul>`;

/* ════════════════════════════════════════════════════════════════════════
   Familia 2 · PASOS DE SETUP — lo que falta por hacer (onboarding del workspace)
   ════════════════════════════════════════════════════════════════════════ */

// 4-7 · timeline de estado del workspace (done · en curso · pendiente)
const TIMELINE_STEPS = [
  { id: 1, type: 'done',     title: 'Workspace creado',           desc: 'Creaste tu primer workspace en modo privado.',          time: 'hace 3d' },
  { id: 2, type: 'done',     title: 'Base de datos conectada',    desc: 'Conectada a Postgres · prod (solo lectura).',           time: 'hace 2d' },
  { id: 3, type: 'done',     title: 'Política de costes activa',  desc: 'cost-guard con tope de $500/día por namespace.',        time: 'hace 31 min' },
  { id: 4, type: 'progress', title: 'Auditoría de seguridad',     desc: 'Revisando políticas y accesos no autorizados.',         time: 'Ejecutando…' },
  { id: 5, type: 'open',     title: 'Invita al equipo',           desc: 'Añade operadores al workspace y asígnales un rol.',     time: 'Próximamente' },
];
// 5 · checklist con CTA en el paso activo
const SETUP = [
  { type: 'done',     title: 'Crea tu workspace',           desc: 'Creaste tu primer workspace en modo privado. Edítalo cuando quieras.' },
  { type: 'progress', title: 'Conecta una fuente de datos',  desc: 'Enlaza tu base al workspace con cualquiera de los 20+ conectores.', cta: 'Conectar base', icon: 'database' },
  { type: 'open',     title: 'Despliega tu primer agente',   desc: 'Lánzalo desde una plantilla o desde tu propia configuración.' },
];
// 6 · checklist numerado con barra de progreso
const GETTING = [
  { id: '1.', status: 'complete', title: 'Configura tu organización',    desc: 'Creaste tu cuenta. Puedes editar los datos cuando quieras.' },
  { id: '2.', status: 'open',     title: 'Conecta una fuente de datos',  desc: 'La plataforma soporta más de 50 bases y warehouses.' },
  { id: '3.', status: 'open',     title: 'Define tus métricas',          desc: 'Créalas con SQL propio o con el editor visual de consultas.' },
  { id: '4.', status: 'open',     title: 'Crea un reporte',              desc: 'Convierte las métricas en visualizaciones y ordénalas.' },
];
const DETAILS = [
  { name: 'Nombre',         value: 'prod_workspace' },
  { name: 'Almacenamiento', value: '0.25 / 10 GB' },
  { name: 'Ciclo de pago',  value: 'día 1 del mes' },
];

/* ── nodo del timeline de estado (bg-card enmascara la línea) ────────────── */
const StepNode = ({ type }) => (
  <div className="relative z-10 flex size-6 flex-none items-center justify-center bg-card">
    {type === 'done'
      ? <Icon name="check" size={18} className="text-primary" />
      : type === 'progress'
        ? <span className="size-2.5 rounded-full bg-primary ring-4 ring-card" />
        : <span className="size-3 rounded-full border border-muted-foreground/40 bg-card ring-4 ring-card" />}
  </div>
);

/* ── círculo de checklist (done lleno · activo aro verde · pendiente sutil) ── */
const CheckCircle = ({ type }) => (
  type === 'done'
    ? <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
    : type === 'progress'
      ? <span className="size-6 shrink-0 rounded-full border-2 border-primary" />
      : <span className="size-6 shrink-0 rounded-full border-2 border-muted-foreground/30" />
);

/* ── barra de progreso (track secondary · fill primary) ──────────────────── */
const ProgressBar = ({ value }) => (
  <div className="h-2 w-32 rounded-full bg-secondary overflow-hidden">
    <div className="h-full rounded-full bg-primary" style={{ width: value + '%' }} />
  </div>
);

/* ── el timeline de estado, reutilizado por la variante bare y la tabbed ──── */
const StatusTimeline = () => (
  <ul role="list" className="space-y-6">
    {TIMELINE_STEPS.map((s, i) => (
      <li key={s.id} className="relative flex gap-x-3">
        <div className={"absolute left-0 top-0 flex w-6 justify-center " + (i === TIMELINE_STEPS.length - 1 ? 'h-6' : '-bottom-6')}>
          <span className="w-px bg-border" />
        </div>
        <div className="flex items-start gap-2.5">
          <StepNode type={s.type} />
          <div>
            <p className="text-[13px] font-medium text-foreground">
              {s.title} <span className="font-normal text-muted-foreground/70">· {s.time}</span>
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

/* ── panel con tabs (Actualizaciones / Detalles) ─────────────────────────── */
function SetupTabs() {
  const [tab, setTab] = useState(0);
  const TABS = ['Actualizaciones', 'Detalles'];
  return (
    <div>
      <h3 className="font-sans font-semibold text-[14px] text-foreground">Configuración del workspace</h3>
      <div className="mt-4 flex gap-1 rounded-lg bg-secondary p-1">
        {TABS.map((t, k) => (
          <button key={t} onClick={() => setTab(k)}
            className={"flex-1 h-8 rounded-md text-[12.5px] font-medium transition-colors " + (tab === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 ? (
        <div className="mt-6">
          <StatusTimeline />
          <button type="button"
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold transition-colors hover:bg-primary/90">
            <Icon name="bell" size={16} />Notificarme al terminar
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <h4 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">General</h4>
          <ul className="mt-2 rounded-md bg-secondary divide-y divide-border/70">
            {DETAILS.map((d) => (
              <li key={d.name} className="flex items-center justify-between h-12 px-4">
                <span className="text-[13px] text-muted-foreground">{d.name}</span>
                <span className="text-[13px] font-medium text-foreground">{d.value}</span>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Privacidad</h4>
          <ul className="mt-2 rounded-md bg-secondary divide-y divide-border/70">
            <li className="flex items-center justify-between h-12 px-4">
              <span className="text-[13px] text-muted-foreground">Usuarios</span>
              <div className="flex -space-x-1.5">
                {['DR', 'MV', 'LO'].map((a) => (
                  <span key={a} className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary font-mono text-[9px] font-semibold ring-2 ring-secondary">{a}</span>
                ))}
              </div>
            </li>
            <li className="flex items-center justify-between h-12 px-4">
              <span className="text-[13px] text-muted-foreground">Acceso</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 text-[11px] font-medium text-foreground ring-1 ring-border">
                <Icon name="lock" size={13} className="text-muted-foreground" />Privado
              </span>
            </li>
          </ul>
          <a href="#" onClick={(e) => e.preventDefault()}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card text-[13px] font-medium text-foreground transition-colors hover:bg-accent/40">
            <Icon name="sliders" size={16} />Ir a ajustes del workspace
          </a>
        </div>
      )}
    </div>
  );
}

const CODE_TIMELINE_STATUS = `// Timeline de estado — done = check, en curso = punto con anillo, pendiente = aro
<ul role="list" className="space-y-6">
  {steps.map((s, i) => (
    <li key={s.id} className="relative flex gap-x-3">
      <div className={\`absolute left-0 top-0 flex w-6 justify-center \${i === steps.length - 1 ? 'h-6' : '-bottom-6'}\`}>
        <span className="w-px bg-border" />
      </div>
      <div className="flex items-start gap-2.5">
        <div className="relative z-10 flex size-6 items-center justify-center bg-card">
          {s.type === 'done'
            ? <Icon name="check" className="text-primary" />
            : s.type === 'progress'
              ? <span className="size-2.5 rounded-full bg-primary ring-4 ring-card" />
              : <span className="size-3 rounded-full border border-muted-foreground/40 bg-card ring-4 ring-card" />}
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {s.title} <span className="font-normal text-muted-foreground/70">· {s.time}</span>
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{s.desc}</p>
        </div>
      </div>
    </li>
  ))}
</ul>`;

const CODE_CHECKLIST = `// Checklist — done (link + check lleno), en curso (card con CTA), pendiente (atenuado)
<ul role="list" className="space-y-3">
  {steps.map((s, i) =>
    s.type === 'progress' ? (
      <li key={i} className="rounded-lg bg-secondary p-4">
        <div className="flex items-start gap-3">
          <span className="size-6 shrink-0 rounded-full border-2 border-primary" />
          <div>
            <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
            <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90">
              <Icon name={s.icon} size={15} />{s.cta}
            </button>
          </div>
        </div>
      </li>
    ) : (
      <li key={i} className="relative rounded-lg p-4 hover:bg-accent/30">
        <a href={s.href} className="absolute inset-0" aria-hidden />
        <div className="flex items-start gap-3">
          {s.type === 'done'
            ? <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
            : <span className="size-6 rounded-full border-2 border-muted-foreground/30" />}
          <div className={s.type === 'open' ? 'opacity-60' : ''}>
            <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
          </div>
        </div>
      </li>
    )
  )}
</ul>`;

const CODE_PROGRESS = `// Checklist con progreso — contador + barra arriba, pasos numerados en cards
<div className="flex items-center justify-end gap-3">
  <span className="text-[12.5px] text-muted-foreground">Paso 1/{steps.length}</span>
  <div className="h-2 w-32 rounded-full bg-secondary">
    <div className="h-full rounded-full bg-primary" style={{ width: '25%' }} />
  </div>
</div>
<ul role="list" className="mt-4 space-y-3">
  {steps.map((s) => (
    <li key={s.id} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {s.status === 'complete'
          ? <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
          : <span className="flex size-6 items-center justify-center font-mono text-[13px] text-muted-foreground">{s.id}</span>}
        <div>
          <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
        </div>
      </div>
    </li>
  ))}
</ul>`;

const CODE_TABS = `// Panel con tabs — Actualizaciones (timeline + CTA) / Detalles (listas + acceso)
<TabGroup>
  <TabList variant="solid">
    <Tab>Actualizaciones</Tab>
    <Tab>Detalles</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>{/* <StatusTimeline /> + botón "Notificarme al terminar" */}</TabPanel>
    <TabPanel>{/* listas General + Privacidad (avatares + badge Privado) */}</TabPanel>
  </TabPanels>
</TabGroup>
// segmented control sobrio: bg-secondary p-1 · activo = bg-card shadow-sm`;

function FeedsSection() {
  return (
    <div>
      <SectionHead kicker="Listas" title="Feeds" status="done"
        intro="El feed cuenta qué pasa con un recurso a lo largo del tiempo — y qué falta por hacer. Dos familias en una sola sección: timelines de actividad (el lifecycle de un run, el hilo de una incidencia, un feed mixto) y pasos de setup (timeline de estado, checklists y un panel con pestañas) para el onboarding del workspace. Mismo vocabulario sobrio: nodos sobre una línea fina, el verde de marca para lo completado y tonos semánticos para el estado." />

      {/* 1 · Timeline con iconos */}
      <Variant title="Timeline con iconos"
        desc="El ciclo de vida de un run en orden: cada paso es un nodo sobre la línea, con la acción y su objeto a la izquierda y la marca de tiempo a la derecha. El tono avanza de neutro a verde a medida que el run progresa hasta completarse."
        code={CODE_TIMELINE}>
        <div className="mx-auto w-full max-w-[520px]">
          <ul role="list" className="-mb-6">
            {LIFECYCLE.map((e, i) => (
              <li key={i}>
                <div className="relative pb-6">
                  {i !== LIFECYCLE.length - 1 && (
                    <span aria-hidden="true" className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" />
                  )}
                  <div className="relative flex gap-3">
                    <span className={"flex size-8 items-center justify-center rounded-full ring-8 ring-card shrink-0 " + NODE[e.tone]}>
                      <Icon name={e.icon} size={16} />
                    </span>
                    <div className="flex min-w-0 flex-1 justify-between gap-4 pt-1.5">
                      <p className="text-[13px] text-muted-foreground">
                        {e.content} <span className="font-semibold text-foreground">{e.target}</span>
                      </p>
                      <time className="shrink-0 font-mono text-[11px] text-muted-foreground pt-px">{e.at}</time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 2 · Stream con comentarios + compositor */}
      <Variant title="Stream con comentarios"
        desc="Los eventos menores caen como un punto en la línea; los comentarios se abren en una card. Abajo, un compositor real: escribe, adjunta, marca el estado en el popover y publica — el comentario se añade al hilo con su marca."
        code={CODE_ACTIVITY}>
        <ActivityFeed />
      </Variant>

      {/* 3 · Feed mixto */}
      <Variant title="Feed mixto"
        desc="Un solo hilo que entrelaza tipos: comentarios con avatar y badge, asignaciones y altas de etiquetas. Cada tipo trae su propio nodo pero comparte la misma línea — los puntos de color de las etiquetas usan los acentos categóricos."
        code={CODE_MIXED}>
        <div className="mx-auto w-full max-w-[560px]">
          <ul role="list" className="-mb-8">
            {MIXED.map((it, i) => (
              <li key={it.id}>
                <div className="relative pb-8">
                  {i !== MIXED.length - 1 && (
                    <span aria-hidden="true" className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
                  )}
                  <div className="relative flex items-start gap-3">
                    {it.type === 'comment' && (
                      <>
                        <span className="relative shrink-0">
                          <Avatar initials={it.init} size={40} />
                          <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-card px-0.5 py-px">
                            <Icon name="chat" size={15} className="text-muted-foreground" />
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[13px] font-semibold text-foreground">{it.who}</span>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">Comentó {it.when}</p>
                          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80" style={{ textWrap: 'pretty' }}>{it.body}</p>
                        </div>
                      </>
                    )}
                    {it.type === 'assignment' && (
                      <>
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card shrink-0">
                          <Icon name="user" size={16} />
                        </span>
                        <p className="min-w-0 flex-1 pt-1.5 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{it.who}</span> asignó a <span className="font-semibold text-foreground">{it.assigned}</span>
                          <span className="ml-1 whitespace-nowrap">· {it.when}</span>
                        </p>
                      </>
                    )}
                    {it.type === 'tags' && (
                      <>
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card shrink-0">
                          <Icon name="tag" size={16} />
                        </span>
                        <p className="min-w-0 flex-1 pt-1 text-[13px] leading-7 text-muted-foreground">
                          <span className="font-semibold text-foreground">{it.who}</span> añadió etiquetas{' '}
                          {it.tags.map((t) => (
                            <span key={t.name} className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground align-middle">
                              <svg viewBox="0 0 6 6" aria-hidden="true" className={"size-1.5 " + t.dot}><circle cx="3" cy="3" r="3" /></svg>{t.name}
                            </span>
                          ))}{' '}
                          <span className="whitespace-nowrap">· {it.when}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 4 · Timeline de estado */}
      <Variant title="Timeline de estado"
        desc="El progreso de un setup como timeline vertical: lo completado se marca con un check verde, el paso en curso es un punto con anillo y los pendientes quedan como un aro hueco. Cada paso lleva su tiempo relativo."
        code={CODE_TIMELINE_STATUS}>
        <div className="mx-auto w-full max-w-[460px]">
          <StatusTimeline />
        </div>
      </Variant>

      {/* 5 · Checklist de pasos */}
      <Variant title="Checklist de pasos"
        desc="Onboarding como checklist: los pasos completados son links sobrios con un check lleno, el paso activo se resalta en una card con su llamada a la acción y los pendientes quedan atenuados. Para guiar el primer setup."
        code={CODE_CHECKLIST}>
        <div className="mx-auto w-full max-w-[460px]">
          <ul role="list" className="space-y-3">
            {SETUP.map((s, i) => (
              s.type === 'progress' ? (
                <li key={i} className="rounded-lg bg-secondary p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle type="progress" />
                    <div>
                      <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                      <button type="button" className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                        <Icon name={s.icon} size={15} />{s.cta}
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={i} className="relative rounded-lg p-4 transition-colors hover:bg-accent/30">
                  <a href="#" onClick={(e) => e.preventDefault()} className="absolute inset-0 rounded-lg" aria-hidden="true" />
                  <div className="flex items-start gap-3">
                    <CheckCircle type={s.type} />
                    <div className={s.type === 'open' ? 'opacity-60' : ''}>
                      <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </li>
              )
            ))}
          </ul>
        </div>
      </Variant>

      {/* 6 · Checklist con progreso */}
      <Variant title="Checklist con progreso"
        desc="La misma idea con un indicador de avance: contador de paso y barra en la cabecera, pasos numerados en cards y un pie con el contacto de soporte. Para flujos de varios pasos donde importa cuánto falta."
        code={CODE_PROGRESS}>
        <div className="mx-auto w-full max-w-[460px]">
          <h3 className="font-sans font-semibold text-[14px] text-foreground">Primeros pasos</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">Completa los pasos para dejar tu workspace listo y crear tu primer dashboard.</p>
          <div className="mt-4 flex items-center justify-end gap-3">
            <span className="text-[12.5px] text-muted-foreground">Paso 1/{GETTING.length}</span>
            <ProgressBar value={25} />
          </div>
          <ul role="list" className="mt-4 space-y-3">
            {GETTING.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  {s.status === 'complete'
                    ? <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
                    : <span className="flex size-6 shrink-0 items-center justify-center font-mono text-[13px] text-muted-foreground">{s.id}</span>}
                  <div>
                    <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <h4 className="text-[13px] font-medium text-foreground">¿Necesitas ayuda?</h4>
            <p className="mt-1 text-[13px] text-muted-foreground">Habla con el equipo en <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary hover:text-primary/80">support@musematic.app</a>.</p>
          </div>
        </div>
      </Variant>

      {/* 7 · Panel con tabs */}
      <Variant title="Panel con tabs"
        desc="El timeline montado en un panel con pestañas: «Actualizaciones» muestra el progreso y un botón para avisar al terminar; «Detalles» abre la ficha del workspace — datos, usuarios y nivel de acceso. La pestaña cambia en vivo."
        code={CODE_TABS}>
        <div className="mx-auto w-full max-w-[480px]">
          <SetupTabs />
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['feeds'] = FeedsSection;
})();
