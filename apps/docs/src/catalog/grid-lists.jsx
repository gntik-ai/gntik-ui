/* ============================================================================
   Gntik UI · grid-lists.jsx — card grid for resources.
   When a list needs room to breathe: services as cards, the team as contact
   cards, namespaces as a compact mosaic and resources as horizontal tiles.
   Plus four views with a grid⇄table switcher. Neutral fixtures · tokens.
   Variants: service cards · contact cards · namespace mosaic · horizontal
   tiles · connectors · templates · workspaces · services by region.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── status pill ─────────────────────────────────────────────────────────── */
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

/* ── variant wrapper ────────────────────────────────────────────────────── */
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

/* ── view switcher: grid ⇄ table ───────────────────────────────────── */
const ViewToggle = ({ view, setView }) => (
  <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
    {[['grid', 'grid', 'Grid'], ['table', 'table', 'Table']].map(([v, icon, label]) => (
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

/* ── table header cell ─────────────────────────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);

/* ── avatar: photo if present, otherwise initials (automatic fallback on onError) ─ */
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

/* ── data ────────────────────────────────────────────────────────────────── */
const AGENTS = [
  { name: 'support-triage', icon: 'chat', model: 'node-24', tone: 'running', state: 'Running', runs: '18.2k', cost: '$412.80' },
  { name: 'billing-api', icon: 'coin', model: 'go-1.24', tone: 'running', state: 'Running', runs: '9.4k', cost: '$88.40' },
  { name: 'data-enricher', icon: 'database', model: 'python-3.13', tone: 'degraded', state: 'Degraded', runs: '22.9k', cost: '$1,204' },
  { name: 'lead-router', icon: 'net', model: 'node-24', tone: 'running', state: 'Running', runs: '7.1k', cost: '$233.50' },
  { name: 'fraud-scan', icon: 'shield', model: 'rust-1.85', tone: 'failed', state: 'Failed', runs: '1.1k', cost: '$51.20' },
  { name: 'churn-watch', icon: 'activity', model: 'go-1.24', tone: 'paused', state: 'Paused', runs: '0', cost: '$0.00' },
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
  { label: 'Active services', value: '31', icon: 'bot', meta: '+4 this week' },
  { label: 'Events today', value: '4.8M', icon: 'spark', meta: '68% of cap' },
  { label: 'Cost this month', value: '$2,124', icon: 'coin', meta: '-12% vs. Apr' },
  { label: 'Failed runs', value: '0.4%', icon: 'alert', meta: '24 of 6.1k' },
];

/* ── interactive service card: pause/resume toggle ──────────────────────── */
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
        <div className="font-mono text-[11.5px] text-muted-foreground mt-0.5">{a.model}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div><div className="font-mono text-[14px] text-foreground">{a.runs}</div><div className="text-[11px] text-muted-foreground">runs 30 d</div></div>
        <div><div className="font-mono text-[14px] text-foreground">{a.cost}</div><div className="text-[11px] text-muted-foreground">cost 30 d</div></div>
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <button onClick={() => canToggle && onToggle()} disabled={!canToggle}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors">
          <Icon name={canToggle && running ? 'pause' : 'play'} size={15} />{canToggle && running ? 'Pause' : 'Resume'}
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="external" size={15} /></button>
      </div>
    </div>
  );
}

/* ── data for the switchable views ───────────────────────────────── */
const CONNECTORS = [
  { name: 'Slack', icon: 'chat', desc: 'Sends workspace alerts and updates to your channels.', connected: true },
  { name: 'PostgreSQL', icon: 'database', desc: 'Primary store for data and run results.', connected: true },
  { name: 'Webhooks', icon: 'bolt', desc: 'Triggers services from external events over HTTP.', connected: false },
  { name: 'Datadog', icon: 'activity', desc: 'Exports run, latency and cost metrics.', connected: false },
  { name: 'S3 Bucket', icon: 'box', desc: 'Syncs artifacts and exports to your bucket.', connected: true },
  { name: 'PagerDuty', icon: 'bell', desc: 'Escalates incidents from degraded services.', connected: false },
];

const TEMPLATES = [
  { name: 'Support Triage', icon: 'chat', desc: 'Classifies and routes incoming tickets by topic.', deploys: 983 },
  { name: 'Billing API', icon: 'coin', desc: 'Handles invoices, payments and refunds.', deploys: 461 },
  { name: 'Data Enricher', icon: 'database', desc: 'Enriches records with live external sources.', deploys: 719 },
  { name: 'Lead Router', icon: 'net', desc: 'Scores and assigns leads to the right team.', deploys: 889 },
  { name: 'Churn Watch', icon: 'activity', desc: 'Detects churn signals and alerts the operator.', deploys: 199 },
  { name: 'Doc Indexer', icon: 'book', desc: 'Indexes documentation for full-text search.', deploys: 642 },
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
    { name: 'support-triage', status: 'active', type: 'API', model: 'node-24', caps: [['users', '34'], ['database', '5.0M'], ['clock', '1d']] },
    { name: 'data-enricher', status: 'inactive', type: 'Batch', model: 'go-1.24', caps: [['users', '28'], ['database', '7.4M'], ['clock', '2d']] },
    { name: 'doc-indexer', status: 'active', type: 'Indexer', model: 'node-24', caps: [['users', '38'], ['database', '3.2M'], ['clock', '4h']] },
    { name: 'fraud-scan', status: 'inactive', type: 'Classifier', model: 'rust-1.85', caps: [['users', '34'], ['database', '5.9M'], ['clock', '7d']] },
  ]},
  { region: 'us-east-1', agents: [
    { name: 'billing-api', status: 'active', type: 'API', model: 'go-1.24', caps: [['users', '27'], ['database', '5.1M'], ['clock', '1d']] },
    { name: 'lead-router', status: 'active', type: 'Router', model: 'node-24', caps: [['users', '41'], ['database', '7.8M'], ['clock', '3h']] },
    { name: 'research-beta', status: 'inactive', type: 'Batch', model: 'rust-1.85', caps: [['users', '39'], ['database', '6.4M'], ['clock', '2h']] },
  ]},
  { region: 'ap-south-1', agents: [
    { name: 'churn-watch', status: 'active', type: 'Classifier', model: 'go-1.24', caps: [['users', '24'], ['database', '6.1M'], ['clock', '1h']] },
    { name: 'sandbox-test', status: 'inactive', type: 'Test', model: 'go-1.24', caps: [['users', '12'], ['database', '1.1M'], ['clock', '3d']] },
  ]},
];

/* ── view A · Connectors (connect action, grid ⇄ table) ────────────────── */
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
                  {on && <Pill tone="running">Connected</Pill>}
                </div>
                <div className="mt-4 flex-1">
                  <div className="text-[14px] font-semibold text-foreground">{c.name}</div>
                  <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' }}>{c.desc}</p>
                </div>
                <button onClick={() => toggle(c.name)}
                  className={"mt-5 w-full h-9 rounded-md text-[12.5px] font-semibold transition-colors " +
                    (on ? 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                  {on ? 'Disconnect' : 'Connect'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Integration</Th><Th>Status</Th><Th className="text-right pr-4">Action</Th>
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
                    <td className="px-4 py-3"><Pill tone={on ? 'running' : 'paused'}>{on ? 'Connected' : 'Available'}</Pill></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggle(c.name)}
                        className={"h-8 px-3 rounded-md text-[12px] font-semibold transition-colors " +
                          (on ? 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                        {on ? 'Disconnect' : 'Connect'}
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

/* ── view B · Templates (link card + metric, grid ⇄ table) ────────────── */
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
                <Icon name="download" size={16} /><span className="font-mono text-[12px]">{t.deploys} deployments</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Template</Th><Th>Description</Th><Th className="text-right pr-4">Deployments</Th>
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

/* ── view C · Workspaces (the canonical switcher, grid ⇄ table) ───────── */
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
                {[['Storage', w.storage], ['Users', w.users], ['Requests', w.requests]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <dt className="text-[12.5px] text-muted-foreground">{k}</dt>
                    <dd className="font-mono text-[12.5px] text-foreground">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[12.5px] text-muted-foreground">Status</dt>
                  <dd><Pill tone={w.status === 'Live' ? 'running' : 'paused'}>{w.status === 'Live' ? 'Live' : 'Inactive'}</Pill></dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Workspace</Th><Th>Storage</Th><Th>Users</Th><Th>Requests</Th><Th>Status</Th><Th className="text-right pr-4">Action</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {WORKSPACES.map((w) => (
                <tr key={w.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-foreground whitespace-nowrap">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.storage}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.users}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{w.requests}</td>
                  <td className="px-4 py-3"><Pill tone={w.status === 'Live' ? 'running' : 'paused'}>{w.status === 'Live' ? 'Live' : 'Inactive'}</Pill></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap"><a href="#" onClick={e => e.preventDefault()} className="text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">Edit</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── view D · Services by region (tabs + search + active + switcher) ───── */
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
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services…"
            className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Switch on={activeOnly} onChange={() => setActiveOnly(v => !v)} label="Active only" />
          <span className="hidden sm:block h-6 w-px bg-border" />
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>
      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <div className="text-[13px] text-foreground font-medium">No matching services</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Adjust the search or the active filter.</div>
        </div>
      ) : view === 'grid' ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <li key={a.name} className="relative rounded-xl border border-border bg-card p-4 shadow-sm hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-mono text-[13px] font-semibold text-foreground">
                  <a href="#" onClick={e => e.preventDefault()} className="focus:outline-none"><span className="absolute inset-0" aria-hidden="true" />{a.name}</a>
                </h4>
                {a.status === 'active' && <span className="inline-flex items-center rounded-md bg-primary/14 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary shrink-0">active</span>}
              </div>
              <dl className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[12.5px]"><dt className="text-muted-foreground">Type:</dt><dd className="font-medium text-foreground">{a.type}</dd></div>
                <div className="flex items-center gap-2 text-[12.5px]"><dt className="text-muted-foreground">Runtime:</dt>
                  <dd className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ring-1 ring-inset ring-border">
                    <span className={"w-2 h-2 rounded-sm " + (a.model.includes('go') ? 'bg-muted-foreground' : 'bg-primary')} />
                    <span className="font-mono text-[11px] text-foreground">{a.model}</span>
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
              <Th>Service</Th><Th>Type</Th><Th>Runtime</Th><Th className="text-right">Invocations</Th><Th className="text-right">Records</Th><Th>Status</Th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {agents.map((a) => (
                <tr key={a.name} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-foreground whitespace-nowrap">{a.name}</td>
                  <td className="px-4 py-3 text-[12.5px] text-muted-foreground whitespace-nowrap">{a.type}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground whitespace-nowrap">{a.model}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.caps[0][1]}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.caps[1][1]}</td>
                  <td className="px-4 py-3"><Pill tone={a.status === 'active' ? 'running' : 'paused'}>{a.status === 'active' ? 'Active' : 'Inactive'}</Pill></td>
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
const CODE_AGENT = `// Service cards — card grid; wrapped in the grid⇄table switcher (see "Workspaces")
<ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {agents.map((a) => (
    <li key={a.name} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={a.icon} /></span>
        <StatusPill tone={a.tone}>{a.state}</StatusPill>
      </div>
      <div className="mt-4">
        <div className="text-[14px] font-semibold text-foreground">{a.name}</div>
        <div className="font-mono text-[11.5px] text-muted-foreground">{a.model}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat value={a.runs} label="runs 30 d" />
        <Stat value={a.cost} label="cost 30 d" />
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <button className="text-primary font-semibold text-[12.5px]">Pause</button>
        <ExternalIcon />
      </div>
    </li>
  ))}
</ul>`;

const CODE_CONTACT = `// Contact cards — Avatar (photo with initials fallback) · switches to table
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
        <a className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"><ChatIcon /> Message</a>
      </div>
    </li>
  ))}
</ul>`;

const CODE_TILES = `// Namespace mosaic — compact tiles: icon + name + meta · switches to table
<ul role="list" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
  {spaces.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-accent/30">
        <span className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={s.icon} /></span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">{s.name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{s.agents} services · {s.runs} runs</div>
        </div>
      </a>
    </li>
  ))}
</ul>`;

const CODE_RES = `// Horizontal tiles — icon on the left, number + delta on the right · switches to table
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

const CODE_SWITCHABLE = `// The switcher: one piece of state decides grid or table
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
  ? <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{/* …cards with header + detail list… */}</ul>
  : <table className="w-full">{/* …one row per workspace, same columns… */}</table>}`;

const CODE_CONNECTORS = `// Connectors — card with icon + status + action; "Connect" toggles live
const [conn, setConn] = useState(() =>
  Object.fromEntries(connectors.map((c) => [c.name, c.connected])));
const toggle = (n) => setConn((s) => ({ ...s, [n]: !s[n] }));

<li className="flex flex-col rounded-xl border border-border bg-card p-5">
  <div className="flex items-start justify-between">
    <span className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><Icon name={c.icon} /></span>
    {conn[c.name] && <StatusPill>Connected</StatusPill>}
  </div>
  <div className="mt-4 flex-1">
    <div className="text-[14px] font-semibold text-foreground">{c.name}</div>
    <p className="mt-1 text-[12.5px] text-muted-foreground">{c.desc}</p>
  </div>
  <button onClick={() => toggle(c.name)}
    className={conn[c.name] ? 'border border-border text-muted-foreground' : 'bg-primary text-primary-foreground'}>
    {conn[c.name] ? 'Disconnect' : 'Connect'}
  </button>
</li>`;

const CODE_TEMPLATES = `// Templates — link card: the <a> stretches over the whole card with inset-0
<li className="relative flex flex-col rounded-xl border border-border bg-card p-5 hover:bg-accent/20">
  <div className="flex items-center gap-3">
    <span className="w-12 h-12 rounded-lg border border-border flex items-center justify-center"><Icon name={t.icon} className="text-muted-foreground" /></span>
    <h4 className="text-[14px] font-semibold text-foreground">
      <a href={t.href} className="focus:outline-none"><span className="absolute inset-0" />{t.name}</a>
    </h4>
  </div>
  <p className="mt-4 flex-1 text-[12.5px] text-muted-foreground">{t.desc}</p>
  <div className="mt-6 flex items-center gap-2 text-muted-foreground">
    <DownloadIcon /> <span className="font-mono text-[12px]">{t.deploys} deployments</span>
  </div>
</li>`;

const CODE_REGION = `// By region — tabs + search + 'active only' switch + switcher
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
  <Switch on={activeOnly} onChange={...} label="Active only" />
  <ViewToggle view={view} setView={setView} />
</div>
{/* … grid of service cards, or a table with the same columns … */}`;

/* ── switchable views for the four base densities ───────────────────── */
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
              <Th>Service</Th><Th>Status</Th><Th className="text-right">Runs 30 d</Th><Th className="text-right">Cost 30 d</Th><Th className="text-right pr-4">Action</Th>
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
                        <div><div className="text-[13px] font-semibold text-foreground">{a.name}</div><div className="font-mono text-[11px] text-muted-foreground">{a.model}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Pill tone={live}>{liveState}</Pill></td>
                    <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{a.runs}</td>
                    <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{a.cost}</td>
                    <td className="px-4 py-3 text-right">
                      {canToggle
                        ? <button onClick={() => toggle(a.name)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-semibold text-foreground hover:bg-secondary transition-colors"><Icon name={on ? 'pause' : 'play'} size={14} />{on ? 'Pause' : 'Resume'}</button>
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
                <a href="#" onClick={e => e.preventDefault()} className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"><Icon name="chat" size={15} /> Message</a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Member</Th><Th>Role</Th><Th>Region</Th><Th className="text-right pr-4">Actions</Th>
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
                      <button aria-label="Message" className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors"><Icon name="chat" size={15} /></button>
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
                  <div className="font-mono text-[11px] text-muted-foreground">{s.agents} services · {s.runs} runs</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-border bg-secondary/30">
              <Th>Namespace</Th><Th className="text-right">Services</Th><Th className="text-right">Runs</Th><Th className="w-10"> </Th>
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
              <Th>Metric</Th><Th className="text-right">Value</Th><Th className="text-right pr-4">Detail</Th>
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
      <SectionHead kicker="Lists" title="Grid lists" status="done"
        intro="When a list needs room to breathe, it becomes a grid. The first four are card densities — services, team, namespaces, metrics. The other four add a grid⇄table switcher (and the last one adds region tabs, search and an active filter): the same collection, seen as cards or rows as needed." />

      <Variant title="Service cards" desc="Each service as a card: icon and status on top, identity, two metrics and a footer with an action. Pause/resume responds to clicks and updates the pill live; the corner control switches to a table." code={CODE_AGENT}>
        <AgentsView />
      </Variant>

      <Variant title="Contact cards" desc="The team as centered cards: large avatar, name and role, with a footer split into actions. Switch to a table for a dense directory with per-row actions." code={CODE_CONTACT}>
        <ContactsView />
      </Variant>

      <Variant title="Namespace mosaic" desc="Compact tiles in a dense grid: icon, name and meta on one line. Switch to a table when you want to compare services and runs column by column." code={CODE_TILES}>
        <NamespacesView />
      </Variant>

      <Variant title="Horizontal tiles" desc="Metrics as wide tiles: icon on the left, big number and detail on the right. Switch to a table to read them as a compact list." code={CODE_RES}>
        <MetricsView />
      </Variant>

      <Variant title="Connectors · grid ⇄ table" desc="Workspace integrations as cards with icon, description and a connect action that toggles live. The corner switcher changes between grid and table — same data, different density." code={CODE_CONNECTORS}>
        <ConnectorsView />
      </Variant>

      <Variant title="Templates · grid ⇄ table" desc="Service templates as link cards: the whole card is clickable (the <a> stretches with inset-0) and shows the deployments metric. Switch to a table to scan many at once." code={CODE_TEMPLATES}>
        <TemplatesView />
      </Variant>

      <Variant title="Workspaces · grid ⇄ table" desc="The canonical switcher: in grid mode, each workspace is a card with a header and a detail list; in table mode, one row per workspace with the same columns. A single piece of state decides the view." code={CODE_SWITCHABLE}>
        <WorkspacesView />
      </Variant>

      <Variant title="Services by region" desc="The full view: region tabs, a live-filtering search box, an active-only switch and the grid⇄table switcher. The card carries a status badge, type, runtime with a dot and metrics with icons." code={CODE_REGION}>
        <RegionView />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['grid-lists'] = GridListsSection;
})();
