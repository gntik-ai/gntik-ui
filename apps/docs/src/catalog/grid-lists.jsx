/* ============================================================================
   Gntik UI · grid-lists.jsx — rejilla de tarjetas para recursos.
   Cuando la lista quiere respirar: el fleet como tarjetas, el equipo como
   fichas de contacto, los namespaces como mosaico compacto y los recursos como
   tiles horizontales. Y cuatro vistas con conmutador rejilla⇄tabla. Dominio
   musematic · tokens. Variantes: tarjetas de agente · fichas de contacto ·
   mosaico de namespaces · tiles horizontales · conectores · plantillas ·
   workspaces · agentes por región.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── pill de estado ──────────────────────────────────────────────────────── */
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

/* ── envoltura de variante ───────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-6">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── conmutador de vista: rejilla ⇄ tabla ──────────────────────────── */
const ViewToggle = ({ view, setView }) => (
  <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
    {[['grid', 'grid', 'Rejilla'], ['table', 'table', 'Tabla']].map(([v, icon, label]) => (
      <button key={v} onClick={() => setView(v)} title={label} aria-label={label} aria-pressed={view === v}
        className={"w-7 h-7 rounded-[5px] inline-flex items-center justify-center transition-colors " +
          (view === v ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
        <Icon name={icon} size={15} />
      </button>
    ))}
  </div>
);

/* ── switch on/off ───────────────────────────────────────────── */
const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onChange} className="inline-flex items-center gap-2 group">
    <span className={"relative w-9 h-5 rounded-full transition-colors " + (on ? 'bg-primary' : 'bg-secondary border border-border')}>
      <span className={"absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform " + (on ? 'translate-x-4 bg-primary-foreground' : 'bg-muted-foreground')} />
    </span>
    {label && <span className="text-[12.5px] text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">{label}</span>}
  </button>
);

/* ── celda de cabecera de tabla ─────────────────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);

/* ── avatar: foto si existe, si no las iniciales (fallback automático en onError) ─ */
function Avatar({ src, initials, size = 36 }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt={initials} onError={() => setFailed(true)}
      className="rounded-full object-cover bg-secondary shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <span className="rounded-full bg-primary/14 text-primary font-mono font-semibold inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}>{initials}</span>
  );
}

/* ── datos ───────────────────────────────────────────────────────────────── */
const AGENTS = [
  { name: 'support-triage', icon: 'chat', model: 'sonnet-4', tone: 'running', state: 'Running', runs: '18.2k', cost: '$412.80' },
  { name: 'billing-bot', icon: 'coin', model: 'haiku-4', tone: 'running', state: 'Running', runs: '9.4k', cost: '$88.40' },
  { name: 'data-enricher', icon: 'database', model: 'sonnet-4', tone: 'degraded', state: 'Degraded', runs: '22.9k', cost: '$1,204' },
  { name: 'lead-router', icon: 'net', model: 'sonnet-4', tone: 'running', state: 'Running', runs: '7.1k', cost: '$233.50' },
  { name: 'fraud-scan', icon: 'shield', model: 'opus-4', tone: 'failed', state: 'Failed', runs: '1.1k', cost: '$51.20' },
  { name: 'churn-watch', icon: 'activity', model: 'haiku-4', tone: 'paused', state: 'Paused', runs: '0', cost: '$0.00' },
];

const TEAM = [
  { initials: 'DR', name: 'Dana Ruiz', role: 'Owner', region: 'eu-west-1', avatar: 'assets/avatar-1.png' },
  { initials: 'MV', name: 'Marco Vidal', role: 'Admin', region: 'us-east-1' },
  { initials: 'LO', name: 'Lena Ortiz', role: 'Operator', region: 'eu-west-1', avatar: 'assets/avatar-2.png' },
  { initials: 'PN', name: 'Priya Nair', role: 'Operator', region: 'ap-south-1' },
];

const SPACES = [
  { name: 'production', icon: 'box', agents: 12, runs: '1.2M' },
  { name: 'staging', icon: 'flask', agents: 6, runs: '88k' },
  { name: 'sandbox', icon: 'bot', agents: 4, runs: '12k' },
  { name: 'eu-residency', icon: 'shield', agents: 8, runs: '640k' },
  { name: 'batch-jobs', icon: 'bricks', agents: 3, runs: '210k' },
  { name: 'webhooks', icon: 'bolt', agents: 5, runs: '430k' },
];

const RESOURCES = [
  { label: 'Agentes activos', value: '31', icon: 'bot', meta: '+4 esta semana' },
  { label: 'Tokens hoy', value: '4.8M', icon: 'spark', meta: '68% del cap' },
  { label: 'Coste mes', value: '$2,124', icon: 'coin', meta: '-12% vs. abr' },
  { label: 'Runs fallidos', value: '0.4%', icon: 'alert', meta: '24 de 6.1k' },
];

/* ── tarjeta de agente interactiva: toggle pausar/reanudar ───────────────── */
function AgentCard({ a, running, onToggle }) {
  const canToggle = a.tone === 'running' || a.tone === 'paused';
  const live = canToggle ? (running ? 'running' : 'paused') : a.tone;
  const liveState = canToggle ? (running ? 'Running' : 'Paused') : a.state;
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center"><Icon name={a.icon} size={20} /></span>
        <Pill tone={live}>{liveState}</Pill>
      </div>
      <div className="mt-4">
        <div className="font-sans font-semibold text-[14px] text-foreground">{a.name}</div>
        <div className="font-mono text-[11.5px] text-muted-foreground mt-0.5">claude-{a.model}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div><div className="font-mono text-[14px] text-foreground">{a.runs}</div><div className="text-[11px] text-muted-foreground">runs 30 d</div></div>
        <div><div className="font-mono text-[14px] text-foreground">{a.cost}</div><div className="text-[11px] text-muted-foreground">coste 30 d</div></div>
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <button onClick={() => canToggle && onToggle()} disabled={!canToggle}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors">
          <Icon name={canToggle && running ? 'pause' : 'play'} size={15} />{canToggle && running ? 'Pausar' : 'Reanudar'}
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="external" size={15} /></button>
      </div>
    </div>
  );
}

/* ── datos de las vistas conmutables ──────────────────────────────── */
const CONNECTORS = [
  { name: 'Slack', icon: 'chat', desc: 'Envía alertas y updates del workspace a tus canales.', connected: true },
  { name: 'PostgreSQL', icon: 'database', desc: 'Almacén primario de datos y resultados de runs.', connected: true },
  { name: 'Webhooks', icon: 'bolt', desc: 'Dispara agentes desde eventos externos vía HTTP.', connected: false },
  { name: 'Datadog', icon: 'activity', desc: 'Exporta métricas de runs, latencia y coste.', connected: false },
  { name: 'S3 Bucket', icon: 'box', desc: 'Sincroniza artefactos y exports a tu bucket.', connected: true },
  { name: 'PagerDuty', icon: 'bell', desc: 'Escala incidencias de agentes degradados.', connected: false },
];

const TEMPLATES = [
  { name: 'Support Triage', icon: 'chat', desc: 'Clasifica y enruta tickets entrantes por intención.', deploys: 983 },
  { name: 'Billing Assistant', icon: 'coin', desc: 'Resuelve dudas de facturación y reembolsos.', deploys: 461 },
  { name: 'Data Enricher', icon: 'database', desc: 'Completa registros con fuentes externas en vivo.', deploys: 719 },
  { name: 'Lead Router', icon: 'net', desc: 'Puntúa y asigna leads al equipo correcto.', deploys: 889 },
  { name: 'Churn Watch', icon: 'activity', desc: 'Detecta señales de abandono y alerta al operador.', deploys: 199 },
  { name: 'Doc Indexer', icon: 'book', desc: 'Indexa y vectoriza documentación para RAG.', deploys: 642 },
];

const WORKSPACES = [
  { name: 'production', storage: '8.2/10 GB', users: '89/100', requests: '995/10K', status: 'Live' },
  { name: 'staging', storage: '9.8/10 GB', users: '23/100', requests: '435/10K', status: 'Inactive' },
  { name: 'eu-residency', storage: '5.6/10 GB', users: '79/100', requests: '642/10K', status: 'Live' },
  { name: 'sandbox', storage: '3.1/10 GB', users: '12/100', requests: '120/10K', status: 'Inactive' },
  { name: 'batch-jobs', storage: '5.9/10 GB', users: '41/100', requests: '880/10K', status: 'Live' },
  { name: 'webhooks', storage: '2.4/10 GB', users: '18/100', requests: '510/10K', status: 'Live' },
];

const BYREGION = [
  { region: 'eu-west-1', agents: [
    { name: 'support-triage', status: 'active', type: 'Conversacional', model: 'sonnet-4', caps: [['users', '34'], ['database', '5.0M'], ['clock', '1d']] },
    { name: 'data-enricher', status: 'inactive', type: 'Batch', model: 'haiku-4', caps: [['users', '28'], ['database', '7.4M'], ['clock', '2d']] },
    { name: 'doc-indexer', status: 'active', type: 'RAG', model: 'sonnet-4', caps: [['users', '38'], ['database', '3.2M'], ['clock', '4h']] },
    { name: 'fraud-scan', status: 'inactive', type: 'Clasificador', model: 'opus-4', caps: [['users', '34'], ['database', '5.9M'], ['clock', '7d']] },
  ]},
  { region: 'us-east-1', agents: [
    { name: 'billing-bot', status: 'active', type: 'Conversacional', model: 'haiku-4', caps: [['users', '27'], ['database', '5.1M'], ['clock', '1d']] },
    { name: 'lead-router', status: 'active', type: 'Enrutador', model: 'sonnet-4', caps: [['users', '41'], ['database', '7.8M'], ['clock', '3h']] },
    { name: 'research-beta', status: 'inactive', type: 'Batch', model: 'opus-4', caps: [['users', '39'], ['database', '6.4M'], ['clock', '2h']] },
  ]},
  { region: 'ap-south-1', agents: [
    { name: 'churn-watch', status: 'active', type: 'Clasificador', model: 'haiku-4', caps: [['users', '24'], ['database', '6.1M'], ['clock', '1h']] },
    { name: 'sandbox-test', status: 'inactive', type: 'Test', model: 'haiku-4', caps: [['users', '12'], ['database', '1.1M'], ['clock', '3d']] },
  ]},
];

/* ── vista A · Conectores (acción de conectar, rejilla ⇄ tabla) ─────────── */
function ConnectorsView() {
  const [view, setView] = useState('grid');
  const [conn, setConn] = useState(() => Object.fromEntries(CONNECTORS.map(c => [c.name, c.connected])));
  const toggle = (n) => setConn(s => ({ ...s, [n]: !s[n] }));
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONNECTORS.map((c) => {
            const on = conn[c.name];
            return (
              <li key={c.name} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center"><Icon name={c.icon} size={20} /></span>
                  {on && <Pill tone="running">Conectado</Pill>}
                </div>
                <div className="mt-4 flex-1">
                  <div className="text-[14px] font-semibold text-foreground">{c.name}</div>
                  <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' }}>{c.desc}</p>
                </div>
                <button onClick={() => toggle(c.name)}
                  className={"mt-5 w-full h-9 rounded-md text-[12.5px] font-semibold transition-colors " +
                    (on ? 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                  {on ? 'Desconectar' : 'Conectar'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Integración</Th><Th>Estado</Th><Th className="text-right pr-4">Acción</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {CONNECTORS.map((c) => {
                const on = conn[c.name];
                return (
                  <tr key={c.name} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={c.icon} size={16} /></span>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground">{c.name}</div>
                          <div className="text-[11.5px] text-muted-foreground truncate">{c.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Pill tone={on ? 'running' : 'paused'}>{on ? 'Conectado' : 'Disponible'}</Pill></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggle(c.name)}
                        className={"h-8 px-3 rounded-md text-[12px] font-semibold transition-colors " +
                          (on ? 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                        {on ? 'Desconectar' : 'Conectar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── vista B · Plantillas (tarjeta-enlace + métrica, rejilla ⇄ tabla) ───── */
function TemplatesView() {
  const [view, setView] = useState('grid');
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <li key={t.name} className="relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-lg border border-border bg-card inline-flex items-center justify-center shrink-0"><Icon name={t.icon} size={22} className="text-muted-foreground" /></span>
                <h4 className="text-[14px] font-semibold text-foreground">
                  <a href="#" onClick={e => e.preventDefault()} className="focus:outline-none"><span className="absolute inset-0" aria-hidden="true" />{t.name}</a>
                </h4>
              </div>
              <p className="mt-4 flex-1 text-[12.5px] text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' }}>{t.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <Icon name="download" size={16} /><span className="font-mono text-[12px]">{t.deploys} despliegues</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Plantilla</Th><Th>Descripción</Th><Th className="text-right pr-4">Despliegues</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {TEMPLATES.map((t) => (
                <tr key={t.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg border border-border bg-card inline-flex items-center justify-center shrink-0"><Icon name={t.icon} size={16} className="text-muted-foreground" /></span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors">{t.name}</a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground max-w-sm"><span className="line-clamp-1">{t.desc}</span></td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{t.deploys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── vista C · Workspaces (el conmutador canónico, rejilla ⇄ tabla) ────── */
function WorkspacesView() {
  const [view, setView] = useState('grid');
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKSPACES.map((w) => (
            <li key={w.name} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/30">
                <span className="w-10 h-10 rounded-lg border border-border bg-card inline-flex items-center justify-center shrink-0"><Icon name="box" size={18} className="text-muted-foreground" /></span>
                <h4 className="font-mono text-[13.5px] font-semibold text-foreground truncate">{w.name}</h4>
              </div>
              <dl className="px-5 py-1 divide-y divide-border">
                {[['Almacenamiento', w.storage], ['Usuarios', w.users], ['Peticiones', w.requests]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <dt className="text-[12.5px] text-muted-foreground">{k}</dt>
                    <dd className="font-mono text-[12.5px] text-foreground">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[12.5px] text-muted-foreground">Estado</dt>
                  <dd><Pill tone={w.status === 'Live' ? 'running' : 'paused'}>{w.status === 'Live' ? 'Live' : 'Inactivo'}</Pill></dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Workspace</Th><Th>Almacenamiento</Th><Th>Usuarios</Th><Th>Peticiones</Th><Th>Estado</Th><Th className="text-right pr-4">Acción</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {WORKSPACES.map((w) => (
                <tr key={w.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-foreground whitespace-nowrap">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.storage}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.users}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.requests}</td>
                  <td className="px-4 py-3"><Pill tone={w.status === 'Live' ? 'running' : 'paused'}>{w.status === 'Live' ? 'Live' : 'Inactivo'}</Pill></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap"><a href="#" onClick={e => e.preventDefault()} className="text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">Editar</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── vista D · Agentes por región (tabs + buscar + activos + conmutador) ── */
function RegionView() {
  const [region, setRegion] = useState(BYREGION[0].region);
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const cur = BYREGION.find(r => r.region === region);
  const agents = cur.agents.filter(a =>
    (!activeOnly || a.status === 'active') &&
    (!q || a.name.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {BYREGION.map((r) => {
          const on = r.region === region;
          return (
            <button key={r.region} onClick={() => setRegion(r.region)}
              className={"relative flex items-center gap-2 px-3 h-9 text-[13px] font-medium whitespace-nowrap transition-colors " + (on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <span className="font-mono">{r.region}</span>
              <span className={"inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md font-mono text-[10.5px] font-semibold " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground')}>{r.agents.length}</span>
              {on && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary" />}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">
        <div className="relative flex-1 min-w-0 max-w-[280px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar agente…"
            className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Switch on={activeOnly} onChange={() => setActiveOnly(v => !v)} label="Solo activos" />
          <span className="hidden sm:block h-6 w-px bg-border" />
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>
      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <div className="text-[13px] text-foreground font-medium">Sin agentes que coincidan</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Ajusta la búsqueda o el filtro de activos.</div>
        </div>
      ) : view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <li key={a.name} className="relative rounded-xl border border-border bg-card p-4 shadow-sm hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-mono text-[13px] font-semibold text-foreground">
                  <a href="#" onClick={e => e.preventDefault()} className="focus:outline-none"><span className="absolute inset-0" aria-hidden="true" />{a.name}</a>
                </h4>
                {a.status === 'active' && <span className="inline-flex items-center rounded-md bg-primary/14 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary shrink-0">activo</span>}
              </div>
              <dl className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[12.5px]"><dt className="text-muted-foreground">Tipo:</dt><dd className="font-medium text-foreground">{a.type}</dd></div>
                <div className="flex items-center gap-2 text-[12.5px]"><dt className="text-muted-foreground">Modelo:</dt>
                  <dd className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ring-1 ring-inset ring-border">
                    <span className={"w-2 h-2 rounded-sm " + (a.model.includes('haiku') ? 'bg-muted-foreground' : 'bg-primary')} />
                    <span className="font-mono text-[11px] text-foreground">claude-{a.model}</span>
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-4">
                {a.caps.map(([ic, val]) => (
                  <div key={ic} className="flex items-center gap-1.5"><Icon name={ic} size={15} className="text-muted-foreground" /><span className="font-mono text-[11.5px] text-muted-foreground">{val}</span></div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Agente</Th><Th>Tipo</Th><Th>Modelo</Th><Th className="text-right">Invocaciones</Th><Th className="text-right">Tokens</Th><Th>Estado</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {agents.map((a) => (
                <tr key={a.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-foreground whitespace-nowrap">{a.name}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground whitespace-nowrap">{a.type}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground whitespace-nowrap">claude-{a.model}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.caps[0][1]}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.caps[1][1]}</td>
                  <td className="px-4 py-3"><Pill tone={a.status === 'active' ? 'running' : 'paused'}>{a.status === 'active' ? 'Activo' : 'Inactivo'}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_AGENT = `// Tarjetas de agente — grid de cards; va envuelta en el conmutador rejilla⇄tabla (ver "Workspaces")
<ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {agents.map((a) => (
    <li key={a.name} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={a.icon} /></span>
        <StatusPill tone={a.tone}>{a.state}</StatusPill>
      </div>
      <div className="mt-4">
        <div className="text-[14px] font-semibold text-foreground">{a.name}</div>
        <div className="font-mono text-[11.5px] text-muted-foreground">claude-{a.model}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat value={a.runs} label="runs 30 d" />
        <Stat value={a.cost} label="coste 30 d" />
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <button className="text-primary font-semibold text-[12.5px]">Pausar</button>
        <ExternalIcon />
      </div>
    </li>
  ))}
</ul>`;

const CODE_CONTACT = `// Fichas de contacto — Avatar (foto con fallback a iniciales) · conmuta a tabla
<ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {team.map((p) => (
    <li key={p.name} className="rounded-xl border border-border bg-card text-center">
      <div className="p-6">
        <div className="flex justify-center"><Avatar src={p.avatar} initials={p.initials} size={64} /></div>
        <div className="mt-3 text-[14px] font-semibold text-foreground">{p.name}</div>
        <div className="text-[12px] text-muted-foreground">{p.role} · {p.region}</div>
      </div>
      <div className="flex divide-x divide-border border-t border-border">
        <a className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"><MailIcon /> Email</a>
        <a className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"><ChatIcon /> Mensaje</a>
      </div>
    </li>
  ))}
</ul>`;

const CODE_TILES = `// Mosaico de namespaces — tiles compactos: icono + nombre + meta · conmuta a tabla
<ul role="list" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
  {spaces.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-accent/30">
        <span className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={s.icon} /></span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">{s.name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{s.agents} agentes · {s.runs} runs</div>
        </div>
      </a>
    </li>
  ))}
</ul>`;

const CODE_RES = `// Tiles horizontales — icono a la izquierda, cifra + delta a la derecha · conmuta a tabla
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {resources.map((r) => (
    <div key={r.label} className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4">
      <span className="w-11 h-11 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={r.icon} /></span>
      <div className="min-w-0 flex-1">
        <dt className="text-[12px] text-muted-foreground">{r.label}</dt>
        <dd className="text-[20px] font-semibold tracking-tight text-foreground">{r.value}</dd>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{r.meta}</span>
    </div>
  ))}
</dl>`;

const CODE_SWITCHABLE = `// El conmutador: una pieza de estado decide rejilla o tabla
const [view, setView] = useState('grid');

<div className="flex justify-end mb-4">
  <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
    {['grid', 'table'].map((v) => (
      <button key={v} onClick={() => setView(v)}
        className={"w-7 h-7 rounded-[5px] flex items-center justify-center " +
          (view === v ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
        <Icon name={v} size={15} />
      </button>
    ))}
  </div>
</div>

{view === 'grid'
  ? <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{/* …cards con cabecera + lista de detalles… */}</ul>
  : <table className="w-full">{/* …una fila por workspace, mismas columnas… */}</table>}`;

const CODE_CONNECTORS = `// Conectores — card con icono + estado + acción; "Conectar" alterna en vivo
const [conn, setConn] = useState(() =>
  Object.fromEntries(connectors.map((c) => [c.name, c.connected])));
const toggle = (n) => setConn((s) => ({ ...s, [n]: !s[n] }));

<li className="flex flex-col rounded-xl border border-border bg-card p-5">
  <div className="flex items-start justify-between">
    <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={c.icon} /></span>
    {conn[c.name] && <StatusPill>Conectado</StatusPill>}
  </div>
  <div className="mt-4 flex-1">
    <div className="text-[14px] font-semibold text-foreground">{c.name}</div>
    <p className="mt-1 text-[12.5px] text-muted-foreground">{c.desc}</p>
  </div>
  <button onClick={() => toggle(c.name)}
    className={conn[c.name] ? 'border border-border text-muted-foreground' : 'bg-primary text-primary-foreground'}>
    {conn[c.name] ? 'Desconectar' : 'Conectar'}
  </button>
</li>`;

const CODE_TEMPLATES = `// Plantillas — tarjeta-enlace: el <a> se estira a toda la card con inset-0
<li className="relative flex flex-col rounded-xl border border-border bg-card p-5 hover:bg-accent/20">
  <div className="flex items-center gap-3">
    <span className="w-12 h-12 rounded-lg border border-border flex items-center justify-center"><Icon name={t.icon} className="text-muted-foreground" /></span>
    <h4 className="text-[14px] font-semibold text-foreground">
      <a href={t.href} className="focus:outline-none"><span className="absolute inset-0" />{t.name}</a>
    </h4>
  </div>
  <p className="mt-4 flex-1 text-[12.5px] text-muted-foreground">{t.desc}</p>
  <div className="mt-6 flex items-center gap-2 text-muted-foreground">
    <DownloadIcon /> <span className="font-mono text-[12px]">{t.deploys} despliegues</span>
  </div>
</li>`;

const CODE_REGION = `// Por región — tabs + buscador + switch 'solo activos' + conmutador
const cur = data.find((r) => r.region === region);
const agents = cur.agents.filter((a) =>
  (!activeOnly || a.status === 'active') &&
  (!q || a.name.toLowerCase().includes(q.toLowerCase())));

<div className="flex items-center gap-1 border-b border-border">
  {data.map((r) => (
    <button key={r.region} onClick={() => setRegion(r.region)} className="relative px-3 h-9">
      <span className="font-mono">{r.region}</span><Badge>{r.agents.length}</Badge>
      {r.region === region && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
    </button>
  ))}
</div>

<div className="flex items-center gap-3 mt-4">
  <SearchInput value={q} onChange={setQ} />
  <Switch on={activeOnly} onChange={...} label="Solo activos" />
  <ViewToggle view={view} setView={setView} />
</div>
{/* … rejilla de cards de agente, o tabla con las mismas columnas … */}`;

/* ── vistas conmutables de las cuatro densidades base ────────────────── */
function AgentsView() {
  const [view, setView] = useState('grid');
  const [run, setRun] = useState(() => Object.fromEntries(AGENTS.map(a => [a.name, a.tone === 'running'])));
  const toggle = (n) => setRun(s => ({ ...s, [n]: !s[n] }));
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((a) => <li key={a.name}><AgentCard a={a} running={run[a.name]} onToggle={() => toggle(a.name)} /></li>)}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Agente</Th><Th>Estado</Th><Th className="text-right">Runs 30 d</Th><Th className="text-right">Coste 30 d</Th><Th className="text-right pr-4">Acción</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {AGENTS.map((a) => {
                const canToggle = a.tone === 'running' || a.tone === 'paused';
                const on = run[a.name];
                const live = canToggle ? (on ? 'running' : 'paused') : a.tone;
                const liveState = canToggle ? (on ? 'Running' : 'Paused') : a.state;
                return (
                  <tr key={a.name} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={a.icon} size={16} /></span>
                        <div><div className="text-[13px] font-semibold text-foreground">{a.name}</div><div className="font-mono text-[11px] text-muted-foreground">claude-{a.model}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Pill tone={live}>{liveState}</Pill></td>
                    <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{a.runs}</td>
                    <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{a.cost}</td>
                    <td className="px-4 py-3 text-right">
                      {canToggle
                        ? <button onClick={() => toggle(a.name)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-semibold text-foreground hover:bg-secondary transition-colors"><Icon name={on ? 'pause' : 'play'} size={14} />{on ? 'Pausar' : 'Reanudar'}</button>
                        : <span className="text-[12px] text-muted-foreground/50">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ContactsView() {
  const [view, setView] = useState('grid');
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map((p) => (
            <li key={p.name} className="rounded-xl border border-border bg-card text-center shadow-sm">
              <div className="p-6">
                <div className="flex justify-center"><Avatar src={p.avatar} initials={p.initials} size={64} /></div>
                <div className="mt-3 text-[14px] font-semibold text-foreground">{p.name}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{p.role} · <span className="font-mono">{p.region}</span></div>
              </div>
              <div className="flex divide-x divide-border border-t border-border">
                <a href="#" onClick={e => e.preventDefault()} className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"><Icon name="mail" size={15} /> Email</a>
                <a href="#" onClick={e => e.preventDefault()} className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"><Icon name="chat" size={15} /> Mensaje</a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Miembro</Th><Th>Rol</Th><Th>Región</Th><Th className="text-right pr-4">Acciones</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {TEAM.map((p) => (
                <tr key={p.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={p.avatar} initials={p.initials} size={32} />
                      <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-foreground whitespace-nowrap">{p.role}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{p.region}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button aria-label="Email" className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors"><Icon name="mail" size={15} /></button>
                      <button aria-label="Mensaje" className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors"><Icon name="chat" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NamespacesView() {
  const [view, setView] = useState('grid');
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SPACES.map((s) => (
            <li key={s.name}>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-accent/30 transition-colors">
                <span className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={s.icon} size={17} /></span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">{s.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{s.agents} agentes · {s.runs} runs</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Namespace</Th><Th className="text-right">Agentes</Th><Th className="text-right">Runs</Th><Th className="w-10"> </Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {SPACES.map((s) => (
                <tr key={s.name} className="group hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={s.icon} size={16} /></span>
                      <span className="text-[13px] font-semibold text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{s.agents}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] text-muted-foreground whitespace-nowrap">{s.runs}</td>
                  <td className="px-4 py-3 text-right"><Icon name="chevronRight" size={16} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MetricsView() {
  const [view, setView] = useState('grid');
  return (
    <div>
      <div className="flex justify-end mb-4"><ViewToggle view={view} setView={setView} /></div>
      {view === 'grid' ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RESOURCES.map((r) => (
            <div key={r.label} className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
              <span className="w-11 h-11 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={r.icon} size={20} /></span>
              <div className="min-w-0 flex-1">
                <dt className="text-[12px] text-muted-foreground">{r.label}</dt>
                <dd className="text-[20px] font-semibold tracking-tight text-foreground leading-tight">{r.value}</dd>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{r.meta}</span>
            </div>
          ))}
        </dl>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Métrica</Th><Th className="text-right">Valor</Th><Th className="text-right pr-4">Detalle</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {RESOURCES.map((r) => (
                <tr key={r.label} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground inline-flex items-center justify-center shrink-0"><Icon name={r.icon} size={16} /></span>
                      <span className="text-[13px] text-foreground">{r.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[14px] text-foreground whitespace-nowrap">{r.value}</td>
                  <td className="px-4 py-3 text-right font-mono text-[11.5px] text-muted-foreground whitespace-nowrap">{r.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GridListsSection() {
  return (
    <div>
      <SectionHead kicker="Listas" title="Grid lists" status="done"
        intro="Cuando una lista necesita aire, pasa a rejilla. Las primeras cuatro son densidades de tarjeta — agentes, equipo, namespaces, métricas. Las otras cuatro añaden un conmutador rejilla⇄tabla (y en la última, tabs por región, búsqueda y filtro de activos): la misma colección, vista como tarjetas o como filas según convenga." />

      <Variant title="Tarjetas de agente" desc="Cada agente como tarjeta: icono y estado arriba, identidad, dos métricas y un footer con acción. Pausar/reanudar responde al clic y cambia el pill en vivo; el control de la esquina conmuta a tabla." code={CODE_AGENT}>
        <AgentsView />
      </Variant>

      <Variant title="Fichas de contacto" desc="El equipo como tarjetas centradas: avatar grande, nombre y rol, con un footer dividido en acciones. Conmuta a tabla para un directorio denso con acciones por fila." code={CODE_CONTACT}>
        <ContactsView />
      </Variant>

      <Variant title="Mosaico de namespaces" desc="Tiles compactos en rejilla densa: icono, nombre y meta en una línea. Conmuta a tabla cuando quieres comparar agentes y runs columna a columna." code={CODE_TILES}>
        <NamespacesView />
      </Variant>

      <Variant title="Tiles horizontales" desc="Métricas como tiles anchos: icono a la izquierda, cifra grande y detalle a la derecha. Conmuta a tabla para leerlas como un listado compacto." code={CODE_RES}>
        <MetricsView />
      </Variant>

      <Variant title="Conectores · rejilla ⇄ tabla" desc="Las integraciones del workspace como tarjetas con icono, descripción y una acción de conectar que alterna en vivo. El conmutador de la esquina cambia entre rejilla y tabla — los mismos datos, otra densidad." code={CODE_CONNECTORS}>
        <ConnectorsView />
      </Variant>

      <Variant title="Plantillas · rejilla ⇄ tabla" desc="Plantillas de agente como tarjeta-enlace: toda la card es clicable (el <a> se estira con inset-0) y muestra la métrica de despliegues. Conmuta a tabla para escanear muchas a la vez." code={CODE_TEMPLATES}>
        <TemplatesView />
      </Variant>

      <Variant title="Workspaces · rejilla ⇄ tabla" desc="El conmutador canónico: en rejilla, cada workspace es una card con cabecera y lista de detalles; en tabla, una fila por workspace con las mismas columnas. Una sola pieza de estado decide la vista." code={CODE_SWITCHABLE}>
        <WorkspacesView />
      </Variant>

      <Variant title="Agentes por región" desc="La vista completa: tabs por región, buscador que filtra en vivo, un switch para ver solo activos y el conmutador rejilla⇄tabla. La card lleva badge de estado, tipo, modelo con punto y métricas con icono." code={CODE_REGION}>
        <RegionView />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['grid-lists'] = GridListsSection;
})();
