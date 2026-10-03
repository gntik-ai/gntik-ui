/* ============================================================================
   Gntik UI · filters.jsx — filtering system ("Filters" group).
   The list toolbar: live search + facet popovers (multi-select with counts
   and search) + active filter chips + saved views. Filters a real list
   of services. Tokens only.
   Variants: facet popover · chips · saved views · compact toolbar · full toolbar.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── variant wrapper ─────────────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── sample service data ─────────────────────────────────────────────────── */
const FLEET = [
  { id: 1,  name: 'support-triage', model: 'node-24', region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 412.8,  owner: 'Emma Crown' },
  { id: 2,  name: 'billing-api',    model: 'python-3.13',  region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 88.4,   owner: 'Leo Park' },
  { id: 3,  name: 'data-enricher',  model: 'node-24', region: 'eu-west-1',  tone: 'degraded', state: 'Degraded', cost: 1204.1, owner: 'Mara Vidal' },
  { id: 4,  name: 'churn-watch',    model: 'python-3.13',  region: 'ap-south-1', tone: 'paused',   state: 'Paused',   cost: 0,      owner: 'Noah Frey' },
  { id: 5,  name: 'lead-router',    model: 'node-24', region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 233.5,  owner: 'Emma Crown' },
  { id: 6,  name: 'fraud-scan',     model: 'go-1.24',   region: 'eu-west-1',  tone: 'failed',   state: 'Failed',   cost: 51.2,   owner: 'Inés Roca' },
  { id: 7,  name: 'invoice-parse',  model: 'python-3.13',  region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 142.6,  owner: 'Leo Park' },
  { id: 8,  name: 'kb-summarizer',  model: 'node-24', region: 'ap-south-1', tone: 'degraded', state: 'Degraded', cost: 319.0,  owner: 'Mara Vidal' },
  { id: 9,  name: 'tos-classifier', model: 'go-1.24',   region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 688.9,  owner: 'Emma Crown' },
  { id: 10, name: 'spam-gate',      model: 'python-3.13',  region: 'us-east-1',  tone: 'paused',   state: 'Paused',   cost: 0,      owner: 'Noah Frey' },
  { id: 11, name: 'sentiment-tap',  model: 'node-24', region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 97.3,   owner: 'Inés Roca' },
  { id: 12, name: 'doc-router',     model: 'go-1.24',   region: 'ap-south-1', tone: 'failed',   state: 'Failed',   cost: 24.7,   owner: 'Mara Vidal' },
];

const FACETS = {
  state:  { key: 'state',  label: 'Status',   icon: 'activity', options: ['Running', 'Degraded', 'Paused', 'Failed'] },
  model:  { key: 'model',  label: 'Runtime',  icon: 'bot',      options: ['node-24', 'python-3.13', 'go-1.24'] },
  region: { key: 'region', label: 'Region',   icon: 'net',      options: ['eu-west-1', 'us-east-1', 'ap-south-1'] },
  owner:  { key: 'owner',  label: 'Owner',    icon: 'user', searchable: true, options: ['Emma Crown', 'Leo Park', 'Mara Vidal', 'Noah Frey', 'Inés Roca'] },
};
const LABELS = { state: 'Status', model: 'Runtime', region: 'Region', owner: 'Owner' };

const countBy = (key) => FLEET.reduce((m, a) => { m[a[key]] = (m[a[key]] || 0) + 1; return m; }, {});
const COUNTS = { state: countBy('state'), model: countBy('model'), region: countBy('region'), owner: countBy('owner') };

/* saved views: each one stores its set of facets */
const VIEWS = [
  { id: 'all',  label: 'All',             facets: {} },
  { id: 'inc',  label: 'Incidents',       facets: { state: ['Degraded', 'Failed'] } },
  { id: 'eu',   label: 'EU production',   facets: { region: ['eu-west-1'], state: ['Running'] } },
  { id: 'prem', label: 'Go & Node',       facets: { model: ['go-1.24', 'node-24'] } },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const initials = (n) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
const cloneFacets = (f) => Object.fromEntries(Object.entries(f).map(([k, a]) => [k, [...a]]));
const hasAny = (f) => Object.values(f).some(a => a && a.length);

function applyFilters(list, q, facets) {
  const query = (q || '').trim().toLowerCase();
  return list.filter(a => {
    if (query && !(a.name + ' ' + a.model + ' ' + a.region + ' ' + a.owner).toLowerCase().includes(query)) return false;
    for (const key of Object.keys(facets)) {
      const sel = facets[key];
      if (sel && sel.length && !sel.includes(a[key])) return false;
    }
    return true;
  });
}
function sameFacets(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    const sa = [...(a[k] || [])].sort(), sb = [...(b[k] || [])].sort();
    if (sa.length !== sb.length || sa.some((v, i) => v !== sb[i])) return false;
  }
  return true;
}

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

/* ── column header (compact toolbar table) ───────────────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);

/* ── mini checkbox (read-only; the row handles the toggle) ───────────────── */
const Box = ({ on }) => (
  <span className="relative inline-flex items-center justify-center w-[16px] h-[16px] shrink-0">
    <span className={"w-[16px] h-[16px] rounded-[4px] border transition-colors " + (on ? 'bg-primary border-primary' : 'border-border bg-card')} />
    <span className={"pointer-events-none absolute text-primary-foreground transition-opacity " + (on ? 'opacity-100' : 'opacity-0')}><Icon name="check" size={11} stroke={2.6} /></span>
  </span>
);

/* ── FacetFilter · button + multi-select popover with counts ─────────────── */
function FacetFilter({ facet, selected, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, () => { setOpen(false); setQ(''); }, open);
  const sel = selected || [];
  const counts = COUNTS[facet.key] || {};
  const opts = (facet.searchable && q.trim())
    ? facet.options.filter(o => o.toLowerCase().includes(q.trim().toLowerCase()))
    : facet.options;
  const toggle = (val) => onChange(sel.includes(val) ? sel.filter(v => v !== val) : [...sel, val]);
  const active = sel.length > 0;
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen(o => !o)}
        className={"inline-flex items-center rounded-md border font-medium transition-colors " +
          (compact ? 'h-8 px-2.5 gap-1.5 text-[12px] ' : 'h-9 px-3 gap-2 text-[12.5px] ') +
          (active ? 'border-primary/45 bg-primary/8 text-foreground' : 'border-border bg-card text-foreground hover:bg-secondary/60')}>
        <Icon name={facet.icon} size={compact ? 14 : 15} className={active ? 'text-primary' : 'text-muted-foreground'} />
        {facet.label}
        {active && (
          <>
            <span className="h-4 w-px bg-border" />
            {sel.length === 1
              ? <span className="font-mono text-[11px] px-1.5 h-[18px] inline-flex items-center rounded bg-secondary text-foreground max-w-[110px] truncate">{sel[0]}</span>
              : <span className="font-mono text-[11px] px-1.5 h-[18px] inline-flex items-center rounded bg-primary/16 text-primary tabular-nums">{sel.length}</span>}
          </>
        )}
        <Icon name="chevron" size={compact ? 13 : 14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-[246px] rounded-md border border-border bg-popover shadow-lg">
          {facet.searchable && (
            <div className="flex items-center gap-2 px-2.5 h-9 border-b border-border/70">
              <Icon name="search" size={14} className="text-muted-foreground shrink-0" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={'Search ' + facet.label.toLowerCase() + '…'}
                className="w-full bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
          )}
          <ul role="listbox" aria-multiselectable="true" className="max-h-60 overflow-auto p-1">
            {opts.length === 0
              ? <li className="px-2.5 py-3 text-center text-[12px] text-muted-foreground">No matches.</li>
              : opts.map(val => {
                const on = sel.includes(val);
                return (
                  <li key={val} role="option" aria-selected={on} onClick={() => toggle(val)}
                    className={"flex cursor-pointer items-center gap-2.5 rounded-[6px] px-2 py-1.5 text-[13px] " + (on ? 'bg-primary/10' : 'hover:bg-secondary/70')}>
                    <Box on={on} />
                    <span className={"min-w-0 flex-1 truncate text-foreground " + (on ? 'font-medium' : '')}>{val}</span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{counts[val] ?? 0}</span>
                  </li>
                );
              })}
          </ul>
          {active && (
            <div className="border-t border-border/70 p-1">
              <button onClick={() => onChange([])}
                className="w-full h-8 rounded-[6px] text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors">
                Clear {facet.label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── ActiveChips · always-visible summary of applied filters ─────────────── */
function ActiveChips({ facets, onRemove, onClear }) {
  const entries = [];
  Object.keys(facets).forEach(key => (facets[key] || []).forEach(val => entries.push({ key, val })));
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground/80">Filters</span>
      {entries.map(({ key, val }) => (
        <span key={key + val} className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
          <span className="text-muted-foreground">{LABELS[key]}:</span>
          <span className="font-medium text-foreground max-w-[140px] truncate">{val}</span>
          <button onClick={() => onRemove(key, val)} aria-label={'Remove ' + val}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Icon name="x" size={12} stroke={2.4} />
          </button>
        </span>
      ))}
      <button onClick={onClear} className="inline-flex items-center h-7 px-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
    </div>
  );
}

/* ── SavedViews · named filter sets ──────────────────────────────────────── */
function SavedViews({ views, activeId, onPick, onSave, canSave }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {views.map(v => {
        const on = v.id === activeId;
        return (
          <button key={v.id} onClick={() => onPick(v)}
            className={"inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12.5px] font-medium transition-colors " +
              (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50')}>
            <Icon name={v.id === 'all' ? 'layers' : 'filter'} size={13} className={on ? 'text-primary' : 'text-muted-foreground'} />
            {v.label}
          </button>
        );
      })}
      {onSave && (
        <>
          <span className="h-5 w-px bg-border mx-1" />
          <button onClick={onSave} disabled={!canSave}
            className={"inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12.5px] font-medium transition-colors " +
              (canSave ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/50' : 'text-muted-foreground/40 cursor-not-allowed')}>
            <Icon name="plus" size={14} />Save view
          </button>
        </>
      )}
    </div>
  );
}

/* ── 1 · Facet popover (standalone) ──────────────────────────────────────── */
function FacetDemo() {
  const [facets, setFacets] = useState({ state: ['Running'] });
  const setFacet = (key, vals) => setFacets(f => { const n = { ...f }; if (vals.length) n[key] = vals; else delete n[key]; return n; });
  const n = applyFilters(FLEET, '', facets).length;
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <FacetFilter facet={FACETS.state} selected={facets.state} onChange={v => setFacet('state', v)} />
        <FacetFilter facet={FACETS.model} selected={facets.model} onChange={v => setFacet('model', v)} />
        <FacetFilter facet={FACETS.owner} selected={facets.owner} onChange={v => setFacet('owner', v)} />
      </div>
      <p className="mt-4 text-[12.5px] text-muted-foreground">
        <span className="font-mono text-foreground tabular-nums">{n}</span> of {FLEET.length} services match. The popover is multi-select; each option's count shows on the right and “Owner” has search built in.
      </p>
    </div>
  );
}

/* ── 2 · Active filter chips (standalone) ────────────────────────────────── */
function ChipsDemo() {
  const [facets, setFacets] = useState({ state: ['Degraded', 'Failed'], region: ['eu-west-1'], owner: ['Mara Vidal'] });
  const removeChip = (key, val) => setFacets(f => { const n = { ...f }; const arr = (n[key] || []).filter(v => v !== val); if (arr.length) n[key] = arr; else delete n[key]; return n; });
  return (
    <div className="p-6 sm:p-8">
      {hasAny(facets)
        ? <ActiveChips facets={facets} onRemove={removeChip} onClear={() => setFacets({})} />
        : (
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <Icon name="check" size={15} className="text-primary" />No active filters.
            <button onClick={() => setFacets({ state: ['Degraded', 'Failed'], region: ['eu-west-1'], owner: ['Mara Vidal'] })}
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2">Restore example</button>
          </div>
        )}
    </div>
  );
}

/* ── 3 · Saved views (standalone) ────────────────────────────────────────── */
function ViewsDemo() {
  const [activeId, setActiveId] = useState('inc');
  const view = VIEWS.find(v => v.id === activeId) || VIEWS[0];
  const facets = view.facets;
  const n = applyFilters(FLEET, '', facets).length;
  return (
    <div>
      <div className="px-3 py-2 border-b border-border bg-secondary/20 overflow-x-auto">
        <SavedViews views={VIEWS} activeId={activeId} onPick={v => setActiveId(v.id)} />
      </div>
      <div className="px-4 py-4">
        {hasAny(facets)
          ? <ActiveChips facets={facets} onRemove={() => {}} onClear={() => setActiveId('all')} />
          : <span className="text-[12.5px] text-muted-foreground">“All” applies no filters.</span>}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground tabular-nums">{n} of {FLEET.length} services in this view</p>
      </div>
    </div>
  );
}

/* ── 4 · Compact toolbar (search + column filters) ───────────────────────── */
function CompactToolbar() {
  const [q, setQ] = useState('');
  const [facets, setFacets] = useState({ state: ['Running'] });
  const setFacet = (key, vals) => setFacets(f => { const n = { ...f }; if (vals.length) n[key] = vals; else delete n[key]; return n; });
  const clearAll = () => { setFacets({}); setQ(''); };
  const rows = applyFilters(FLEET, q, facets);
  const active = hasAny(facets) || q.trim() !== '';
  return (
    <div>
      {/* compact toolbar: search + column filters */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/20">
        <div className="relative flex-1 min-w-[150px] max-w-[240px]">
          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
            className="w-full h-8 rounded-md border border-border bg-background pl-8 pr-2.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <FacetFilter compact facet={FACETS.state} selected={facets.state} onChange={v => setFacet('state', v)} />
        <FacetFilter compact facet={FACETS.region} selected={facets.region} onChange={v => setFacet('region', v)} />
        <FacetFilter compact facet={FACETS.model} selected={facets.model} onChange={v => setFacet('model', v)} />
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {active && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">
              <Icon name="x" size={13} />Clear
            </button>
          )}
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{rows.length}/{FLEET.length}</span>
        </div>
      </div>
      {/* filtered table — filters over real columns */}
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border bg-secondary/30">
          <Th>Service</Th><Th>Region</Th><Th>Status</Th><Th className="text-right">Cost 30 d</Th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map(a => (
            <tr key={a.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={15} /></span>
                  <div>
                    <div className="font-sans font-semibold text-[13px] text-foreground">{a.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{a.model}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
              <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
              <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap tabular-nums">{money(a.cost)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-12 text-center">
              <div className="text-[13px] text-foreground font-medium">No services match</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Loosen a filter or clear the search.</div>
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── 5 · Full toolbar (the whole system) ─────────────────────────────────── */
function FullToolbar() {
  const [q, setQ] = useState('');
  const [facets, setFacets] = useState({});
  const [views, setViews] = useState(VIEWS);
  const counterRef = useRef(1);

  const setFacet = (key, vals) => setFacets(f => { const n = { ...f }; if (vals.length) n[key] = vals; else delete n[key]; return n; });
  const removeChip = (key, val) => setFacets(f => { const n = { ...f }; const arr = (n[key] || []).filter(v => v !== val); if (arr.length) n[key] = arr; else delete n[key]; return n; });
  const clearAll = () => { setFacets({}); setQ(''); };

  const activeId = q.trim() === '' ? (views.find(v => sameFacets(v.facets, facets))?.id ?? null) : null;
  const pickView = (v) => { setFacets(cloneFacets(v.facets)); setQ(''); };
  const canSave = activeId === null && hasAny(facets);
  const saveView = () => {
    const nv = { id: 'v' + Date.now(), label: 'View ' + (++counterRef.current - 1 || ''), facets: cloneFacets(facets) };
    nv.label = 'View ' + (views.filter(v => v.id[0] === 'v').length + 1);
    setViews(vs => [...vs, nv]);
  };

  const rows = applyFilters(FLEET, q, facets);

  return (
    <div>
      {/* saved views */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/20 overflow-x-auto">
        <SavedViews views={views} activeId={activeId} onPick={pickView} onSave={saveView} canSave={canSave} />
      </div>

      {/* toolbar: search + facets */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-border">
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services…"
            className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <FacetFilter facet={FACETS.state} selected={facets.state} onChange={v => setFacet('state', v)} />
        <FacetFilter facet={FACETS.model} selected={facets.model} onChange={v => setFacet('model', v)} />
        <FacetFilter facet={FACETS.region} selected={facets.region} onChange={v => setFacet('region', v)} />
        <FacetFilter facet={FACETS.owner} selected={facets.owner} onChange={v => setFacet('owner', v)} />
      </div>

      {/* active chips */}
      {(hasAny(facets) || q.trim()) && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/10">
          {q.trim() && (
            <span className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
              <span className="text-muted-foreground">Search:</span>
              <span className="font-medium text-foreground max-w-[140px] truncate">{q.trim()}</span>
              <button onClick={() => setQ('')} aria-label="Clear search" className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Icon name="x" size={12} stroke={2.4} /></button>
            </span>
          )}
          <ActiveChips facets={facets} onRemove={removeChip} onClear={() => setFacets({})} />
          {(hasAny(facets) && q.trim()) && (
            <button onClick={clearAll} className="inline-flex items-center h-7 px-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
          )}
        </div>
      )}

      {/* results */}
      <div className="divide-y divide-border">
        {rows.map(a => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={15} /></span>
            <div className="min-w-0">
              <div className="font-sans font-semibold text-[13px] text-foreground truncate">{a.name}</div>
              <div className="font-mono text-[11px] text-muted-foreground truncate">{a.model} · {a.region}</div>
            </div>
            <span className="ml-auto hidden sm:inline-grid place-items-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shrink-0" title={a.owner}>{initials(a.owner)}</span>
            <div className="w-[104px] hidden md:flex shrink-0"><Pill tone={a.tone}>{a.state}</Pill></div>
            <div className="w-[92px] text-right font-mono text-[12.5px] text-foreground shrink-0 tabular-nums">{money(a.cost)}</div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-4 py-14 text-center">
            <span className="w-11 h-11 rounded-xl bg-secondary text-muted-foreground inline-flex items-center justify-center mb-3"><Icon name="filter" size={20} /></span>
            <div className="text-[13px] text-foreground font-medium">No services match</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Loosen a filter or clear to see every service.</div>
            <button onClick={clearAll} className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-secondary/60 transition-colors"><Icon name="x" size={13} />Clear filters</button>
          </div>
        )}
      </div>

      {/* counter */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/20">
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{rows.length} of {FLEET.length} services</span>
        {activeId
          ? <span className="font-mono text-[11px] text-muted-foreground">View · {views.find(v => v.id === activeId)?.label}</span>
          : (hasAny(facets) || q.trim())
            ? <span className="font-mono text-[11px] text-primary">Unsaved view</span>
            : null}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_FACET = `// FacetFilter — a button that opens a multi-select popover with counts
const [open, setOpen] = useState(false);
const ref = useRef(null);
useClickOutside(ref, () => setOpen(false), open);
const toggle = (val) => onChange(sel.includes(val) ? sel.filter((v) => v !== val) : [...sel, val]);

<button onClick={() => setOpen((o) => !o)}
  className={\`inline-flex items-center gap-2 h-9 px-3 rounded-md border text-[12.5px] font-medium \${
    sel.length ? 'border-primary/45 bg-primary/8' : 'border-border bg-card hover:bg-secondary/60'}\`}>
  <Icon name={facet.icon} className={sel.length ? 'text-primary' : 'text-muted-foreground'} />
  {facet.label}
  {sel.length > 0 && (<>
    <span className="h-4 w-px bg-border" />
    {sel.length === 1
      ? <span className="rounded bg-secondary px-1.5 text-[11px] font-mono">{sel[0]}</span>
      : <span className="rounded bg-primary/16 px-1.5 text-[11px] font-mono text-primary">{sel.length}</span>}
  </>)}
  <ChevronIcon className={open ? 'rotate-180' : ''} />
</button>
{open && (
  <div className="absolute z-30 mt-1.5 w-[246px] rounded-md border border-border bg-popover shadow-lg">
    {/* search inside when the list is long */}
    <ul className="max-h-60 overflow-auto p-1">
      {options.map((val) => (
        <li key={val} onClick={() => toggle(val)}
          className={\`flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 cursor-pointer \${
            sel.includes(val) ? 'bg-primary/10' : 'hover:bg-secondary/70'}\`}>
          <Checkbox on={sel.includes(val)} />
          <span className="flex-1 truncate">{val}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{counts[val]}</span>
        </li>
      ))}
    </ul>
    {sel.length > 0 && <button onClick={() => onChange([])}>Clear {facet.label}</button>}
  </div>
)}`;

const CODE_CHIPS = `// ActiveChips — one key:value chip per filter; the × removes it, "Clear all" resets
const entries = Object.entries(facets).flatMap(([key, vals]) => vals.map((val) => ({ key, val })));

<div className="flex flex-wrap items-center gap-2">
  <span className="font-mono text-[10px] uppercase text-muted-foreground/80">Filters</span>
  {entries.map(({ key, val }) => (
    <span key={key + val} className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
      <span className="text-muted-foreground">{LABELS[key]}:</span>
      <span className="font-medium text-foreground">{val}</span>
      <button onClick={() => removeChip(key, val)}><XIcon /></button>
    </span>
  ))}
  <button onClick={clearAll} className="text-[12px] text-muted-foreground hover:text-destructive">Clear all</button>
</div>`;

const CODE_SYSTEM = `// The system — search + facets + saved views filter a list, all in React
const [q, setQ] = useState('');
const [facets, setFacets] = useState({});           // { state: ['Running'], model: [...] }

const rows = data.filter((a) => {
  if (q && !(a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.toLowerCase())) return false;
  return Object.entries(facets).every(([k, sel]) => !sel.length || sel.includes(a[k]));
});

// Saved views: each view IS a set of facets. The matching one is active.
const activeId = q.trim() === '' ? views.find((v) => sameFacets(v.facets, facets))?.id : null;
const pickView = (v) => { setFacets(structuredClone(v.facets)); setQ(''); };
const saveView = () => setViews((vs) => [...vs, { id: crypto.randomUUID(), label: 'View ' + (vs.length + 1), facets }]);
// canSave: matches no view and there are filters → the current filtering is new`;

const CODE_COMPACT = `// Compact toolbar — search + column filters; no views or chips
const [q, setQ] = useState('');
const [facets, setFacets] = useState({});
const rows = data.filter((a) => {
  if (q && !(a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.toLowerCase())) return false;
  return Object.entries(facets).every(([k, sel]) => !sel.length || sel.includes(a[k]));
});

<div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/20">
  <div className="relative flex-1 max-w-[240px]">
    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
      className="w-full h-8 rounded-md border border-border bg-background pl-8 text-[12.5px] focus:ring-2 focus:ring-ring/35" />
  </div>
  <FacetFilter compact facet={FACETS.state} selected={facets.state} onChange={(v) => setFacet('state', v)} />
  <FacetFilter compact facet={FACETS.region} selected={facets.region} onChange={(v) => setFacet('region', v)} />
  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{rows.length}/{data.length}</span>
</div>
{/* … <table> with real columns (Service · Region · Status · Cost); rows = rows … */}`;

/* ── section ─────────────────────────────────────────────────────────────── */
function FiltersSection() {
  return (
    <div>
      <SectionHead kicker="Filters" title="Filters" status="done"
        intro="The system for narrowing a list without leaving it. Four pieces that fit together: live search, facet popovers with multi-select and per-option counts, chips summarising what is applied, and saved views that turn a filter set into a named shortcut. Mono-brand green, Select menus popovers and check, all on tokens." />

      <Variant title="Facet popover"
        desc="Each facet is a button that opens a multi-select popover with per-option counts and, when the list is long, search inside. The button shows the single chosen value or how many are active."
        code={CODE_FACET}>
        <FacetDemo />
      </Variant>

      <Variant title="Active filter chips"
        desc="Each applied filter becomes a “key: value” chip removed with the ×; “Clear all” resets in one go. It is the always-visible summary of what is narrowing the list."
        code={CODE_CHIPS}>
        <ChipsDemo />
      </Variant>

      <Variant title="Saved views"
        desc="Named filter sets — incidents, EU production, Go & Node. One click applies them and the chips show what each one narrows. In the toolbar, “Save view” turns the current filtering into a new view."
        code={CODE_SYSTEM}>
        <ViewsDemo />
      </Variant>

      <Variant title="Compact toolbar"
        desc="A reduced version: just search and a few column filters (status, region, runtime) over the table. No saved views or chip row — the selection lives in each button and the counter sits on the right. For tables where a quick narrow-down is enough."
        code={CODE_COMPACT}>
        <CompactToolbar />
      </Variant>

      <Variant title="Full toolbar"
        desc="Everything together: search, facets, active chips and saved views filtering a real list of services. Change a facet and the view becomes “unsaved” until you save it; search and you will see the term as another chip."
        code={CODE_SYSTEM}>
        <FullToolbar />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['filters'] = FiltersSection;
})();
