/* ============================================================================
   Gntik UI · filters.jsx — sistema de filtrado (grupo "Filtros").
   La toolbar del Fleet: buscador en vivo + popovers de faceta (selección
   múltiple con recuento y búsqueda) + chips de filtro activo + vistas
   guardadas. Filtra una lista real de agentes. Dominio musematic · tokens.
   Variantes: popover de faceta · chips · vistas guardadas · toolbar completo.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── envoltura de variante ───────────────────────────────────────────────── */
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

/* ── datos del fleet ─────────────────────────────────────────────────────── */
const FLEET = [
  { id: 1,  name: 'support-triage', model: 'sonnet-4', region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 412.8,  owner: 'Emma Crown' },
  { id: 2,  name: 'billing-bot',    model: 'haiku-4',  region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 88.4,   owner: 'Leo Park' },
  { id: 3,  name: 'data-enricher',  model: 'sonnet-4', region: 'eu-west-1',  tone: 'degraded', state: 'Degraded', cost: 1204.1, owner: 'Mara Vidal' },
  { id: 4,  name: 'churn-watch',    model: 'haiku-4',  region: 'ap-south-1', tone: 'paused',   state: 'Paused',   cost: 0,      owner: 'Noah Frey' },
  { id: 5,  name: 'lead-router',    model: 'sonnet-4', region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 233.5,  owner: 'Emma Crown' },
  { id: 6,  name: 'fraud-scan',     model: 'opus-4',   region: 'eu-west-1',  tone: 'failed',   state: 'Failed',   cost: 51.2,   owner: 'Inés Roca' },
  { id: 7,  name: 'invoice-parse',  model: 'haiku-4',  region: 'us-east-1',  tone: 'running',  state: 'Running',  cost: 142.6,  owner: 'Leo Park' },
  { id: 8,  name: 'kb-summarizer',  model: 'sonnet-4', region: 'ap-south-1', tone: 'degraded', state: 'Degraded', cost: 319.0,  owner: 'Mara Vidal' },
  { id: 9,  name: 'tos-classifier', model: 'opus-4',   region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 688.9,  owner: 'Emma Crown' },
  { id: 10, name: 'spam-gate',      model: 'haiku-4',  region: 'us-east-1',  tone: 'paused',   state: 'Paused',   cost: 0,      owner: 'Noah Frey' },
  { id: 11, name: 'sentiment-tap',  model: 'sonnet-4', region: 'eu-west-1',  tone: 'running',  state: 'Running',  cost: 97.3,   owner: 'Inés Roca' },
  { id: 12, name: 'doc-router',     model: 'opus-4',   region: 'ap-south-1', tone: 'failed',   state: 'Failed',   cost: 24.7,   owner: 'Mara Vidal' },
];

const FACETS = {
  state:  { key: 'state',  label: 'Estado',   icon: 'activity', options: ['Running', 'Degraded', 'Paused', 'Failed'] },
  model:  { key: 'model',  label: 'Modelo',   icon: 'bot',      options: ['sonnet-4', 'haiku-4', 'opus-4'] },
  region: { key: 'region', label: 'Región',   icon: 'net',      options: ['eu-west-1', 'us-east-1', 'ap-south-1'] },
  owner:  { key: 'owner',  label: 'Operador', icon: 'user', searchable: true, options: ['Emma Crown', 'Leo Park', 'Mara Vidal', 'Noah Frey', 'Inés Roca'] },
};
const LABELS = { state: 'Estado', model: 'Modelo', region: 'Región', owner: 'Operador' };

const countBy = (key) => FLEET.reduce((m, a) => { m[a[key]] = (m[a[key]] || 0) + 1; return m; }, {});
const COUNTS = { state: countBy('state'), model: countBy('model'), region: countBy('region'), owner: countBy('owner') };

/* vistas guardadas: cada una almacena su conjunto de facetas */
const VIEWS = [
  { id: 'all',  label: 'Todos',           facets: {} },
  { id: 'inc',  label: 'Incidencias',     facets: { state: ['Degraded', 'Failed'] } },
  { id: 'eu',   label: 'Producción EU',   facets: { region: ['eu-west-1'], state: ['Running'] } },
  { id: 'prem', label: 'Modelos premium', facets: { model: ['opus-4', 'sonnet-4'] } },
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

/* ── cabecera de columna (tabla del toolbar ligero) ──────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);

/* ── mini-checkbox (solo lectura; la fila gestiona el toggle) ────────────── */
const Box = ({ on }) => (
  <span className="relative inline-flex items-center justify-center w-[16px] h-[16px] shrink-0">
    <span className={"w-[16px] h-[16px] rounded-[4px] border transition-colors " + (on ? 'bg-primary border-primary' : 'border-border bg-card')} />
    <span className={"pointer-events-none absolute text-primary-foreground transition-opacity " + (on ? 'opacity-100' : 'opacity-0')}><Icon name="check" size={11} stroke={2.6} /></span>
  </span>
);

/* ── FacetFilter · botón + popover de selección múltiple con recuento ─────── */
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
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={'Buscar ' + facet.label.toLowerCase() + '…'}
                className="w-full bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
          )}
          <ul role="listbox" aria-multiselectable="true" className="max-h-60 overflow-auto p-1">
            {opts.length === 0
              ? <li className="px-2.5 py-3 text-center text-[12px] text-muted-foreground">Sin coincidencias.</li>
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
                Limpiar {facet.label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── ActiveChips · resumen siempre visible de los filtros aplicados ───────── */
function ActiveChips({ facets, onRemove, onClear }) {
  const entries = [];
  Object.keys(facets).forEach(key => (facets[key] || []).forEach(val => entries.push({ key, val })));
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground/80">Filtros</span>
      {entries.map(({ key, val }) => (
        <span key={key + val} className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
          <span className="text-muted-foreground">{LABELS[key]}:</span>
          <span className="font-medium text-foreground max-w-[140px] truncate">{val}</span>
          <button onClick={() => onRemove(key, val)} aria-label={'Quitar ' + val}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Icon name="x" size={12} stroke={2.4} />
          </button>
        </span>
      ))}
      <button onClick={onClear} className="inline-flex items-center h-7 px-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">Limpiar todo</button>
    </div>
  );
}

/* ── SavedViews · conjuntos de filtros con nombre ────────────────────────── */
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
            <Icon name="plus" size={14} />Guardar vista
          </button>
        </>
      )}
    </div>
  );
}

/* ── 1 · Popover de faceta (independiente) ───────────────────────────────── */
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
        <span className="font-mono text-foreground tabular-nums">{n}</span> de {FLEET.length} agentes coinciden. El popover es multi-selección; el recuento de cada opción sale a la derecha y «Operador» trae búsqueda dentro.
      </p>
    </div>
  );
}

/* ── 2 · Chips de filtro activo (independiente) ──────────────────────────── */
function ChipsDemo() {
  const [facets, setFacets] = useState({ state: ['Degraded', 'Failed'], region: ['eu-west-1'], owner: ['Mara Vidal'] });
  const removeChip = (key, val) => setFacets(f => { const n = { ...f }; const arr = (n[key] || []).filter(v => v !== val); if (arr.length) n[key] = arr; else delete n[key]; return n; });
  return (
    <div className="p-6 sm:p-8">
      {hasAny(facets)
        ? <ActiveChips facets={facets} onRemove={removeChip} onClear={() => setFacets({})} />
        : (
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <Icon name="check" size={15} className="text-primary" />Sin filtros activos.
            <button onClick={() => setFacets({ state: ['Degraded', 'Failed'], region: ['eu-west-1'], owner: ['Mara Vidal'] })}
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2">Restaurar ejemplo</button>
          </div>
        )}
    </div>
  );
}

/* ── 3 · Vistas guardadas (independiente) ────────────────────────────────── */
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
          : <span className="text-[12.5px] text-muted-foreground">«Todos» no aplica ningún filtro.</span>}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground tabular-nums">{n} de {FLEET.length} agentes en esta vista</p>
      </div>
    </div>
  );
}

/* ── 4 · Toolbar ligero (buscador + filtros de columna) ──────────────────── */
function CompactToolbar() {
  const [q, setQ] = useState('');
  const [facets, setFacets] = useState({ state: ['Running'] });
  const setFacet = (key, vals) => setFacets(f => { const n = { ...f }; if (vals.length) n[key] = vals; else delete n[key]; return n; });
  const clearAll = () => { setFacets({}); setQ(''); };
  const rows = applyFilters(FLEET, q, facets);
  const active = hasAny(facets) || q.trim() !== '';
  return (
    <div>
      {/* toolbar compacto: buscador + filtros de columna */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/20">
        <div className="relative flex-1 min-w-[150px] max-w-[240px]">
          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…"
            className="w-full h-8 rounded-md border border-border bg-background pl-8 pr-2.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <FacetFilter compact facet={FACETS.state} selected={facets.state} onChange={v => setFacet('state', v)} />
        <FacetFilter compact facet={FACETS.region} selected={facets.region} onChange={v => setFacet('region', v)} />
        <FacetFilter compact facet={FACETS.model} selected={facets.model} onChange={v => setFacet('model', v)} />
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {active && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">
              <Icon name="x" size={13} />Limpiar
            </button>
          )}
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{rows.length}/{FLEET.length}</span>
        </div>
      </div>
      {/* tabla filtrada — filtros sobre columnas reales */}
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border bg-secondary/30">
          <Th>Agente</Th><Th>Región</Th><Th>Estado</Th><Th className="text-right">Coste 30 d</Th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map(a => (
            <tr key={a.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={15} /></span>
                  <div>
                    <div className="font-sans font-semibold text-[13px] text-foreground">{a.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">claude-{a.model}</div>
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
              <div className="text-[13px] text-foreground font-medium">Ningún agente coincide</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Afloja un filtro o limpia la búsqueda.</div>
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── 5 · Toolbar completo (todo el sistema) ──────────────────────────────── */
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
    const nv = { id: 'v' + Date.now(), label: 'Vista ' + (++counterRef.current - 1 || ''), facets: cloneFacets(facets) };
    nv.label = 'Vista ' + (views.filter(v => v.id[0] === 'v').length + 1);
    setViews(vs => [...vs, nv]);
  };

  const rows = applyFilters(FLEET, q, facets);

  return (
    <div>
      {/* vistas guardadas */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/20 overflow-x-auto">
        <SavedViews views={views} activeId={activeId} onPick={pickView} onSave={saveView} canSave={canSave} />
      </div>

      {/* toolbar: buscador + facetas */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-border">
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar agente…"
            className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <FacetFilter facet={FACETS.state} selected={facets.state} onChange={v => setFacet('state', v)} />
        <FacetFilter facet={FACETS.model} selected={facets.model} onChange={v => setFacet('model', v)} />
        <FacetFilter facet={FACETS.region} selected={facets.region} onChange={v => setFacet('region', v)} />
        <FacetFilter facet={FACETS.owner} selected={facets.owner} onChange={v => setFacet('owner', v)} />
      </div>

      {/* chips activos */}
      {(hasAny(facets) || q.trim()) && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/10">
          {q.trim() && (
            <span className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
              <span className="text-muted-foreground">Buscar:</span>
              <span className="font-medium text-foreground max-w-[140px] truncate">{q.trim()}</span>
              <button onClick={() => setQ('')} aria-label="Quitar búsqueda" className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Icon name="x" size={12} stroke={2.4} /></button>
            </span>
          )}
          <ActiveChips facets={facets} onRemove={removeChip} onClear={() => setFacets({})} />
          {(hasAny(facets) && q.trim()) && (
            <button onClick={clearAll} className="inline-flex items-center h-7 px-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">Limpiar todo</button>
          )}
        </div>
      )}

      {/* resultados */}
      <div className="divide-y divide-border">
        {rows.map(a => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={15} /></span>
            <div className="min-w-0">
              <div className="font-sans font-semibold text-[13px] text-foreground truncate">{a.name}</div>
              <div className="font-mono text-[11px] text-muted-foreground truncate">claude-{a.model} · {a.region}</div>
            </div>
            <span className="ml-auto hidden sm:inline-grid place-items-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shrink-0" title={a.owner}>{initials(a.owner)}</span>
            <div className="w-[104px] hidden md:flex shrink-0"><Pill tone={a.tone}>{a.state}</Pill></div>
            <div className="w-[92px] text-right font-mono text-[12.5px] text-foreground shrink-0 tabular-nums">{money(a.cost)}</div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-4 py-14 text-center">
            <span className="w-11 h-11 rounded-xl bg-secondary text-muted-foreground inline-flex items-center justify-center mb-3"><Icon name="filter" size={20} /></span>
            <div className="text-[13px] text-foreground font-medium">Ningún agente coincide</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Afloja un filtro o limpia para ver todo el Fleet.</div>
            <button onClick={clearAll} className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-secondary/60 transition-colors"><Icon name="x" size={13} />Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* contador */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/20">
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{rows.length} de {FLEET.length} agentes</span>
        {activeId
          ? <span className="font-mono text-[11px] text-muted-foreground">Vista · {views.find(v => v.id === activeId)?.label}</span>
          : (hasAny(facets) || q.trim())
            ? <span className="font-mono text-[11px] text-primary">Vista sin guardar</span>
            : null}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_FACET = `// FacetFilter — botón que abre un popover de selección múltiple con recuento
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
    {/* búsqueda dentro si la lista es larga */}
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
    {sel.length > 0 && <button onClick={() => onChange([])}>Limpiar {facet.label}</button>}
  </div>
)}`;

const CODE_CHIPS = `// ActiveChips — un chip clave:valor por filtro; la × lo quita, "Limpiar todo" resetea
const entries = Object.entries(facets).flatMap(([key, vals]) => vals.map((val) => ({ key, val })));

<div className="flex flex-wrap items-center gap-2">
  <span className="font-mono text-[10px] uppercase text-muted-foreground/80">Filtros</span>
  {entries.map(({ key, val }) => (
    <span key={key + val} className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md border border-border bg-background text-[12px]">
      <span className="text-muted-foreground">{LABELS[key]}:</span>
      <span className="font-medium text-foreground">{val}</span>
      <button onClick={() => removeChip(key, val)}><XIcon /></button>
    </span>
  ))}
  <button onClick={clearAll} className="text-[12px] text-muted-foreground hover:text-destructive">Limpiar todo</button>
</div>`;

const CODE_SYSTEM = `// El sistema — buscador + facetas + vistas guardadas filtran una lista, todo en React
const [q, setQ] = useState('');
const [facets, setFacets] = useState({});           // { state: ['Running'], model: [...] }

const rows = data.filter((a) => {
  if (q && !(a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.toLowerCase())) return false;
  return Object.entries(facets).every(([k, sel]) => !sel.length || sel.includes(a[k]));
});

// Vistas guardadas: cada vista ES un conjunto de facetas. Está activa la que coincide.
const activeId = q.trim() === '' ? views.find((v) => sameFacets(v.facets, facets))?.id : null;
const pickView = (v) => { setFacets(structuredClone(v.facets)); setQ(''); };
const saveView = () => setViews((vs) => [...vs, { id: crypto.randomUUID(), label: 'Vista ' + (vs.length + 1), facets }]);
// canSave: no coincide con ninguna vista y hay filtros → el filtrado actual es nuevo`;

const CODE_COMPACT = `// Toolbar ligero — buscador + filtros de columna; sin vistas ni chips
const [q, setQ] = useState('');
const [facets, setFacets] = useState({});
const rows = data.filter((a) => {
  if (q && !(a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.toLowerCase())) return false;
  return Object.entries(facets).every(([k, sel]) => !sel.length || sel.includes(a[k]));
});

<div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/20">
  <div className="relative flex-1 max-w-[240px]">
    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…"
      className="w-full h-8 rounded-md border border-border bg-background pl-8 text-[12.5px] focus:ring-2 focus:ring-ring/35" />
  </div>
  <FacetFilter compact facet={FACETS.state} selected={facets.state} onChange={(v) => setFacet('state', v)} />
  <FacetFilter compact facet={FACETS.region} selected={facets.region} onChange={(v) => setFacet('region', v)} />
  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{rows.length}/{data.length}</span>
</div>
{/* … <table> con columnas reales (Agente · Región · Estado · Coste); filas = rows … */}`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function FiltersSection() {
  return (
    <div>
      <SectionHead kicker="Filtros" title="Filters" status="done"
        intro="El sistema para acotar el Fleet sin salir de la lista. Cuatro piezas que encajan: un buscador en vivo, popovers de faceta con selección múltiple y recuento por opción, chips que resumen lo aplicado, y vistas guardadas que convierten un filtrado en un atajo con nombre. Mono-brand verde, popovers y check de Select menus, todo sobre tokens." />

      <Variant title="Popover de faceta"
        desc="Cada faceta es un botón que abre un popover de selección múltiple con recuento por opción y, cuando la lista es larga, búsqueda dentro. El botón muestra el valor único elegido o cuántos hay activos."
        code={CODE_FACET}>
        <FacetDemo />
      </Variant>

      <Variant title="Chips de filtro activo"
        desc="Cada filtro aplicado se vuelve un chip «clave: valor» que se quita con la ×; «Limpiar todo» resetea de una. Es el resumen siempre visible de qué está acotando la lista."
        code={CODE_CHIPS}>
        <ChipsDemo />
      </Variant>

      <Variant title="Vistas guardadas"
        desc="Conjuntos de filtros con nombre — incidencias, producción EU, modelos premium. Un clic los aplica y los chips muestran qué acota cada uno. En la toolbar, «Guardar vista» convierte el filtrado actual en una vista nueva."
        code={CODE_SYSTEM}>
        <ViewsDemo />
      </Variant>

      <Variant title="Toolbar ligero"
        desc="Una versión reducida: solo el buscador y unos filtros de columna (estado, región, modelo) sobre la tabla. Sin vistas guardadas ni fila de chips — lo elegido vive en cada botón y el contador va a la derecha. Para tablas donde basta con acotar rápido."
        code={CODE_COMPACT}>
        <CompactToolbar />
      </Variant>

      <Variant title="Toolbar completo"
        desc="Todo junto sobre el Fleet: buscador, facetas, chips activos y vistas guardadas filtrando una lista real de agentes. Cambia una faceta y la vista pasa a «sin guardar» hasta que la guardes; busca y verás el término como un chip más."
        code={CODE_SYSTEM}>
        <FullToolbar />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['filters'] = FiltersSection;
})();
