/* ============================================================================
   Gntik UI · stacked-lists.jsx — filas apiladas con avatar, meta y acción.
   El patrón de fila: lo que va DENTRO de cada renglón. Avatar de iniciales,
   título + meta secundaria, pill de estado, tiempo relativo y una acción al
   hover. Dominio musematic · tokens. Variantes: simple · con acción · estado a
   la derecha · agrupada con cabecera sticky.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── pill de estado (mono · tono semántico, nunca el primario como severidad) ── */
const TONES = {
  running: 'bg-primary/14 text-primary',
  paused: 'bg-muted-foreground/16 text-muted-foreground',
  degraded: 'bg-warning/16 text-warning',
  failed: 'bg-destructive/15 text-destructive',
};
const Pill = ({ tone = 'running', children }) => (
  <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + (TONES[tone] || TONES.running)}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{children}
  </span>
);

/* ── avatar de iniciales (brand-tinted) ──────────────────────────────────── */
const Avatar = ({ initials, size = 36 }) => (
  <span className="rounded-full bg-primary/14 text-primary font-mono font-semibold inline-flex items-center justify-center shrink-0"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}>{initials}</span>
);

/* ── tile de icono (para filas de agente) ────────────────────────────────── */
const IconTile = ({ name = 'bot', tone = 'primary' }) => {
  const t = tone === 'muted' ? 'bg-secondary text-muted-foreground' : 'bg-primary/14 text-primary';
  return <span className={"w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0 " + t}><Icon name={name} size={18} /></span>;
};

/* ── envoltura de variante: nombre + descripción + preview + código ──────── */
const Variant = ({ title, desc, code, surface = false, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    {surface
      ? <div className="preview-surface rounded-lg border border-border p-8 flex justify-center">{children}</div>
      : <div className="rounded-lg border border-border bg-card p-2 sm:p-3">{children}</div>}
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── datos ───────────────────────────────────────────────────────────────── */
const TEAM = [
  { initials: 'DR', name: 'Dana Ruiz', email: 'dana@musematic.app', role: 'Owner', seen: 'Activa ahora', online: true },
  { initials: 'MV', name: 'Marco Vidal', email: 'marco@musematic.app', role: 'Admin', seen: 'hace 12 min', online: true },
  { initials: 'LO', name: 'Lena Ortiz', email: 'lena@musematic.app', role: 'Operator', seen: 'hace 3 h', online: false },
  { initials: 'SC', name: 'Sam Cho', email: 'sam@musematic.app', role: 'Viewer', seen: 'ayer', online: false },
];

const AGENTS = [
  { name: 'support-triage', desc: 'claude-sonnet-4 · eu-west-1', tone: 'running', state: 'Running', icon: 'chat' },
  { name: 'billing-bot', desc: 'claude-haiku-4 · us-east-1', tone: 'running', state: 'Running', icon: 'coin' },
  { name: 'data-enricher', desc: 'claude-sonnet-4 · eu-west-1', tone: 'degraded', state: 'Degraded', icon: 'database' },
  { name: 'churn-watch', desc: 'claude-haiku-4 · ap-south-1', tone: 'paused', state: 'Paused', icon: 'activity' },
];

const RUNS = [
  { id: 'run_5h2k8d3f', trigger: 'webhook · POST /ingest', tone: 'running', state: 'Succeeded', when: 'hace 2 min', tokens: '18.2k' },
  { id: 'run_9a1c7e0b', trigger: 'schedule · 0 */6 * * *', tone: 'running', state: 'Succeeded', when: 'hace 41 min', tokens: '6.4k' },
  { id: 'run_2f8b4d6a', trigger: 'manual · Dana Ruiz', tone: 'degraded', state: 'Retried', when: 'hace 1 h', tokens: '22.9k' },
  { id: 'run_7c3e9f15', trigger: 'webhook · POST /ingest', tone: 'failed', state: 'Failed', when: 'hace 3 h', tokens: '1.1k' },
];

const GROUPED = [
  { region: 'eu-west-1', items: [
    { name: 'support-triage', meta: '8 runs/min', tone: 'running', state: 'Running' },
    { name: 'data-enricher', meta: '2 runs/min', tone: 'degraded', state: 'Degraded' },
    { name: 'doc-indexer', meta: '0 runs/min', tone: 'paused', state: 'Paused' },
  ]},
  { region: 'us-east-1', items: [
    { name: 'billing-bot', meta: '12 runs/min', tone: 'running', state: 'Running' },
    { name: 'lead-router', meta: '5 runs/min', tone: 'running', state: 'Running' },
  ]},
  { region: 'ap-south-1', items: [
    { name: 'churn-watch', meta: '0 runs/min', tone: 'paused', state: 'Paused' },
  ]},
];

/* ── fila 2 (con acción) interactiva: pin/estrella + chevron al hover ─────── */
function AgentRow({ a }) {
  const [pinned, setPinned] = useState(false);
  return (
    <li className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/40 transition-colors">
      <IconTile name={a.icon} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-[13.5px] text-foreground truncate">{a.name}</span>
          <Pill tone={a.tone}>{a.state}</Pill>
        </div>
        <div className="font-mono text-[11.5px] text-muted-foreground mt-0.5">{a.desc}</div>
      </div>
      <button onClick={() => setPinned(p => !p)} aria-label="Fijar"
        className={"shrink-0 transition-colors " + (pinned ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100')}>
        <Icon name="spark" size={16} />
      </button>
      <Icon name="chevronRight" size={16} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </li>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — avatar + nombre/email a la izquierda, rol + estado a la derecha
<ul role="list" className="divide-y divide-border">
  {team.map((p) => (
    <li key={p.email} className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative">
          <span className="w-9 h-9 rounded-full bg-primary/14 text-primary font-mono text-[11.5px] font-semibold flex items-center justify-center">{p.initials}</span>
          {p.online && <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-card" />}
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-foreground truncate">{p.name}</div>
          <div className="font-mono text-[11.5px] text-muted-foreground truncate">{p.email}</div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[12.5px] text-foreground">{p.role}</div>
        <div className="text-[11.5px] text-muted-foreground">{p.seen}</div>
      </div>
    </li>
  ))}
</ul>`;

const CODE_ACTION = `// Con acción — fila completa clicable; pin + chevron aparecen al hover
<ul role="list" className="divide-y divide-border">
  {agents.map((a) => (
    <li key={a.name} className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/40">
      <span className="w-9 h-9 rounded-lg bg-primary/14 text-primary flex items-center justify-center"><BotIcon /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-foreground truncate">{a.name}</span>
          <StatusPill tone={a.tone}>{a.state}</StatusPill>
        </div>
        <div className="font-mono text-[11.5px] text-muted-foreground mt-0.5">{a.desc}</div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-muted-foreground"><StarIcon /></button>
      <ChevronRight className="text-muted-foreground/40 group-hover:text-muted-foreground" />
    </li>
  ))}
</ul>`;

const CODE_RIGHT = `// Estado a la derecha — dos líneas a la izq, pill + tiempo + meta a la der
<li className="flex items-center justify-between gap-4 px-4 py-3.5">
  <div className="min-w-0">
    <div className="font-mono text-[13px] text-foreground truncate">{run.id}</div>
    <div className="text-[12px] text-muted-foreground truncate mt-0.5">{run.trigger}</div>
  </div>
  <div className="flex items-center gap-5 shrink-0">
    <div className="hidden sm:block text-right">
      <div className="font-mono text-[12px] text-foreground">{run.tokens}</div>
      <div className="text-[11px] text-muted-foreground">tokens</div>
    </div>
    <StatusPill tone={run.tone}>{run.state}</StatusPill>
    <span className="text-[12px] text-muted-foreground w-16 text-right">{run.when}</span>
  </div>
</li>`;

const CODE_GROUPED = `// Agrupada — cabecera de grupo sticky por región dentro de un scroll
<div className="max-h-[320px] overflow-y-auto">
  {groups.map((g) => (
    <div key={g.region}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-1.5 bg-secondary/80 backdrop-blur border-y border-border">
        <span className="font-mono text-[10.5px] tracking-wide uppercase text-muted-foreground">{g.region}</span>
        <span className="font-mono text-[10.5px] text-muted-foreground/70">{g.items.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {g.items.map((a) => (
          <li key={a.name} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <span className="text-[13px] font-medium text-foreground">{a.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">{a.meta}</span>
              <StatusPill tone={a.tone}>{a.state}</StatusPill>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>`;

function StackedListsSection() {
  return (
    <div>
      <SectionHead kicker="Listas" title="Stacked lists" status="done"
        intro="La lista apilada es el caballo de batalla de las pantallas de musematic: equipo, fleet de agentes, runs recientes. Aquí el foco es el contenido de la fila — avatar de iniciales, título con su meta secundaria, pill de estado, tiempo relativo y una acción que aparece al hover. Cuatro patrones: simple, con acción, con estado a la derecha y agrupada con cabecera sticky." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Avatar con indicador de presencia, nombre y email a la izquierda; rol y último acceso alineados a la derecha. El directorio del equipo." code={CODE_SIMPLE}>
        <ul role="list" className="divide-y divide-border">
          {TEAM.map((p) => (
            <li key={p.email} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-accent/30 transition-colors rounded-md">
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative">
                  <Avatar initials={p.initials} />
                  {p.online && <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-card" />}
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-foreground truncate">{p.name}</div>
                  <div className="font-mono text-[11.5px] text-muted-foreground truncate">{p.email}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12.5px] text-foreground">{p.role}</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">{p.seen}</div>
              </div>
            </li>
          ))}
        </ul>
      </Variant>

      {/* 2 · Con acción */}
      <Variant title="Con acción" desc="Fila de agente con tile de icono, nombre, pill de estado y meta mono. La fila se ilumina al hover y revela una acción de fijar y el chevron. El pin responde al clic." code={CODE_ACTION}>
        <ul role="list" className="divide-y divide-border">
          {AGENTS.map((a) => <AgentRow key={a.name} a={a} />)}
        </ul>
      </Variant>

      {/* 3 · Estado a la derecha */}
      <Variant title="Estado a la derecha" desc="Run ID mono y trigger a la izquierda; tokens, pill de resultado y tiempo relativo a la derecha. Para feeds densos de actividad donde el estado manda la lectura." code={CODE_RIGHT}>
        <ul role="list" className="divide-y divide-border">
          {RUNS.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-accent/30 transition-colors rounded-md">
              <div className="min-w-0">
                <div className="font-mono text-[13px] text-foreground truncate">{r.id}</div>
                <div className="text-[12px] text-muted-foreground truncate mt-0.5">{r.trigger}</div>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="hidden sm:block text-right">
                  <div className="font-mono text-[12px] text-foreground">{r.tokens}</div>
                  <div className="text-[11px] text-muted-foreground">tokens</div>
                </div>
                <Pill tone={r.tone}>{r.state}</Pill>
                <span className="text-[12px] text-muted-foreground w-16 text-right">{r.when}</span>
              </div>
            </li>
          ))}
        </ul>
      </Variant>

      {/* 4 · Agrupada */}
      <Variant title="Agrupada (sticky)" desc="Agentes agrupados por región, con la cabecera del grupo pegada al borde superior mientras se hace scroll. Para listas largas con secciones — por región, namespace o inicial." code={CODE_GROUPED}>
        <div className="max-h-[320px] overflow-y-auto rounded-md">
          {GROUPED.map((g) => (
            <div key={g.region}>
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-1.5 bg-secondary/80 backdrop-blur border-y border-border">
                <span className="font-mono text-[10.5px] tracking-wide uppercase text-muted-foreground">{g.region}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground/70">{g.items.length}</span>
              </div>
              <ul role="list" className="divide-y divide-border">
                {g.items.map((a) => (
                  <li key={a.name} className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-accent/30 transition-colors">
                    <span className="text-[13px] font-medium text-foreground">{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{a.meta}</span>
                      <Pill tone={a.tone}>{a.state}</Pill>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['stacked-lists'] = StackedListsSection;
})();
