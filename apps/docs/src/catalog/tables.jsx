/* ============================================================================
   Gntik UI · tables.jsx — dense table with status, sorting and selection.
   The services table: services as rows, columns for runtime, region, status,
   cost and last run. Sortable headers (click), checkbox selection + bulk
   action bar, and a per-row actions menu. Neutral fixtures · tokens.
   Variants: simple · sortable · with selection · with row actions.
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

/* ── brand checkbox (styled native input) ───────────────────────────────── */
const Check = ({ checked, indeterminate, onChange }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
    <input type="checkbox" checked={checked} ref={el => el && (el.indeterminate = !!indeterminate)} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-card cursor-pointer checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);

/* ── variant wrapper ────────────────────────────────────────────────────── */
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

/* ── services data ──────────────────────────────────────────────────────── */
const FLEET = [
  { id: 1, name: 'support-triage', model: 'node-24', region: 'eu-west-1', tone: 'running', state: 'Running', cost: 412.8, runs: 18204, last: '2 min ago' },
  { id: 2, name: 'billing-api', model: 'go-1.24', region: 'us-east-1', tone: 'running', state: 'Running', cost: 88.4, runs: 9442, last: '5 min ago' },
  { id: 3, name: 'data-enricher', model: 'python-3.13', region: 'eu-west-1', tone: 'degraded', state: 'Degraded', cost: 1204.1, runs: 22931, last: '1 h ago' },
  { id: 4, name: 'churn-watch', model: 'go-1.24', region: 'ap-south-1', tone: 'paused', state: 'Paused', cost: 0, runs: 0, last: '2 d ago' },
  { id: 5, name: 'lead-router', model: 'node-24', region: 'us-east-1', tone: 'running', state: 'Running', cost: 233.5, runs: 7188, last: '11 min ago' },
  { id: 6, name: 'fraud-scan', model: 'rust-1.85', region: 'eu-west-1', tone: 'failed', state: 'Failed', cost: 51.2, runs: 1102, last: '3 h ago' },
];

const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (n) => n.toLocaleString('en-US');

/* ── shared cells ───────────────────────────────────────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);
const NameCell = ({ name, model }) => (
  <td className="px-4 py-3 whitespace-nowrap">
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={16} /></span>
      <div>
        <div className="font-sans font-semibold text-[13px] text-foreground">{name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{model}</div>
      </div>
    </div>
  </td>
);

/* ── 1 · Simple ──────────────────────────────────────────────────────────── */
function SimpleTable() {
  return (
    <table className="w-full border-collapse">
      <thead><tr className="border-b border-border bg-secondary/30">
        <Th>Service</Th><Th>Region</Th><Th>Status</Th><Th className="text-right">Cost 30 d</Th><Th className="text-right">Last run</Th>
      </tr></thead>
      <tbody className="divide-y divide-border">
        {FLEET.slice(0, 5).map((a) => (
          <tr key={a.id} className="hover:bg-accent/30 transition-colors">
            <NameCell name={a.name} model={a.model} />
            <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
            <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
            <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{money(a.cost)}</td>
            <td className="px-4 py-3 text-right text-[12px] text-muted-foreground whitespace-nowrap">{a.last}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 2 · Sortable ────────────────────────────────────────────────────────── */
function SortableTable() {
  const [sort, setSort] = useState({ key: 'cost', dir: 'desc' });
  const click = (key) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  const rows = [...FLEET].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const va = a[sort.key], vb = b[sort.key];
    return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))) * dir;
  });
  const SortTh = ({ k, children, align = 'left' }) => {
    const on = sort.key === k;
    return (
      <th className={"font-sans font-medium text-[11.5px] tracking-wide uppercase px-4 h-10 whitespace-nowrap " + (align === 'right' ? 'text-right' : 'text-left')}>
        <button onClick={() => click(k)} className={"inline-flex items-center gap-1 transition-colors " + (on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground') + (align === 'right' ? ' flex-row-reverse' : '')}>
          {children}
          <Icon name={on ? (sort.dir === 'asc' ? 'chevronUp' : 'chevron') : 'chevron'} size={13} className={on ? 'opacity-100' : 'opacity-25'} />
        </button>
      </th>
    );
  };
  return (
    <table className="w-full border-collapse">
      <thead><tr className="border-b border-border bg-secondary/30">
        <SortTh k="name">Service</SortTh><SortTh k="region">Region</SortTh><SortTh k="state">Status</SortTh>
        <SortTh k="runs" align="right">Runs</SortTh><SortTh k="cost" align="right">Cost 30 d</SortTh>
      </tr></thead>
      <tbody className="divide-y divide-border">
        {rows.map((a) => (
          <tr key={a.id} className="hover:bg-accent/30 transition-colors">
            <NameCell name={a.name} model={a.model} />
            <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
            <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
            <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{fmt(a.runs)}</td>
            <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{money(a.cost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 3 · With selection + bulk action bar ───────────────────────────────── */
function SelectableTable() {
  const [sel, setSel] = useState(() => new Set([1, 3]));
  const all = FLEET.length, n = sel.size;
  const toggle = (id) => setSel(s => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const toggleAll = () => setSel(s => s.size === all ? new Set() : new Set(FLEET.map(a => a.id)));
  return (
    <div className="relative">
      {/* bulk action bar (appears with a selection) */}
      <div className={"flex items-center gap-3 px-4 h-12 border-b border-border transition-colors " + (n ? 'bg-primary/8' : 'bg-secondary/30')}>
        {n > 0 ? (
          <>
            <span className="font-sans text-[12.5px] font-semibold text-foreground">{n} selected</span>
            <div className="h-4 w-px bg-border" />
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"><Icon name="pause" size={14} />Pause</button>
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"><Icon name="refresh" size={14} />Reassign</button>
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-destructive/90 hover:text-destructive transition-colors"><Icon name="trash" size={14} />Delete</button>
          </>
        ) : (
          <span className="font-sans text-[12.5px] text-muted-foreground">Select services for bulk actions</span>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border">
          <th className="w-12 px-4 h-10"><Check checked={n === all} indeterminate={n > 0 && n < all} onChange={toggleAll} /></th>
          <Th>Service</Th><Th>Region</Th><Th>Status</Th><Th className="text-right">Cost 30 d</Th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {FLEET.map((a) => {
            const on = sel.has(a.id);
            return (
              <tr key={a.id} className={"transition-colors " + (on ? 'bg-primary/6' : 'hover:bg-accent/30')}>
                <td className="px-4 py-3"><Check checked={on} onChange={() => toggle(a.id)} /></td>
                <NameCell name={a.name} model={a.model} />
                <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
                <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{money(a.cost)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── 4 · With row actions (menu) ───────────────────────────────────────── */
function ActionRow({ a }) {
  const [open, setOpen] = useState(false);
  const ref = window.useRef(null);
  window.useClickOutside(ref, () => setOpen(false), open);
  return (
    <tr className="group hover:bg-accent/30 transition-colors">
      <NameCell name={a.name} model={a.model} />
      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
      <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{money(a.cost)}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1 justify-end">
          <button className="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Open</button>
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(o => !o)} aria-label="More actions"
              className={"w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors " + (open ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
              <Icon name="dot3" size={16} />
            </button>
            {open && (
              <div className="absolute right-0 top-8 z-20 w-40 py-1 rounded-lg border border-border bg-popover shadow-md">
                {[['eye', 'View details'], ['pause', 'Pause'], ['refresh', 'Retry']].map(([ic, l]) => (
                  <button key={l} onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3 h-8 text-[12.5px] text-popover-foreground hover:bg-accent/60 transition-colors"><Icon name={ic} size={14} className="text-muted-foreground" />{l}</button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3 h-8 text-[12.5px] text-destructive hover:bg-destructive/10 transition-colors"><Icon name="trash" size={14} />Delete</button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
function RowActionsTable() {
  return (
    <table className="w-full border-collapse">
      <thead><tr className="border-b border-border bg-secondary/30">
        <Th>Service</Th><Th>Region</Th><Th>Status</Th><Th className="text-right">Cost 30 d</Th><Th className="text-right pr-4">Actions</Th>
      </tr></thead>
      <tbody className="divide-y divide-border">
        {FLEET.slice(0, 5).map((a) => <ActionRow key={a.id} a={a} />)}
      </tbody>
    </table>
  );
}

/* ── 5 · With toolbar (live search + filters + add) ───────────────── */
function ToolbarTable() {
  const [q, setQ] = useState('');
  const [added, setAdded] = useState(false);
  const query = q.trim().toLowerCase();
  const rows = FLEET.filter(a => !query || (a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(query));
  return (
    <div>
      {/* toolbar: search + filters on the left, add on the right */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border bg-secondary/20">
        <div className="relative flex-1 min-w-0 max-w-[300px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search service, runtime or region…"
            className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-secondary/60 transition-colors shrink-0">
          <Icon name="filter" size={15} className="text-muted-foreground" />Filters
        </button>
        <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1600); }}
          className="ml-auto shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold hover:bg-primary/90 transition-colors">
          <Icon name={added ? 'check' : 'plus'} size={15} />{added ? 'Service added' : 'Add service'}
        </button>
      </div>
      {/* filtered table */}
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border bg-secondary/30">
          <Th>Service</Th><Th>Region</Th><Th>Status</Th><Th className="text-right">Cost 30 d</Th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map((a) => (
            <tr key={a.id} className="hover:bg-accent/30 transition-colors">
              <NameCell name={a.name} model={a.model} />
              <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">{a.region}</td>
              <td className="px-4 py-3"><Pill tone={a.tone}>{a.state}</Pill></td>
              <td className="px-4 py-3 text-right font-mono text-[12.5px] text-foreground whitespace-nowrap">{money(a.cost)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-14 text-center">
              <span className="w-11 h-11 rounded-xl bg-secondary text-muted-foreground inline-flex items-center justify-center mb-3"><Icon name="search" size={20} /></span>
              <div className="text-[13px] text-foreground font-medium">No services match “{q}”</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Try another name, runtime or region.</div>
            </td></tr>
          )}
        </tbody>
      </table>
      {/* counter */}
      <div className="px-4 py-2.5 border-t border-border bg-secondary/20">
        <span className="font-mono text-[11px] text-muted-foreground">{rows.length} of {FLEET.length} services</span>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — subtly tinted thead, divided rows, mono numbers on the right
<table className="w-full border-collapse">
  <thead>
    <tr className="border-b border-border bg-secondary/30">
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Service</th>
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Region</th>
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Status</th>
      <th className="text-right text-[11.5px] uppercase text-muted-foreground px-4 h-10">Cost 30 d</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border">
    {rows.map((a) => (
      <tr key={a.id} className="hover:bg-accent/30">
        <td className="px-4 py-3">{/* avatar + name + runtime */}</td>
        <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{a.region}</td>
        <td className="px-4 py-3"><StatusPill tone={a.tone}>{a.state}</StatusPill></td>
        <td className="px-4 py-3 text-right font-mono text-[12.5px]">{money(a.cost)}</td>
      </tr>
    ))}
  </tbody>
</table>`;

const CODE_SORT = `// Sortable — sort state lives in React; the header toggles asc/desc
const [sort, setSort] = useState({ key: 'cost', dir: 'desc' });
const click = (key) => setSort((s) => s.key === key
  ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
  : { key, dir: 'asc' });

const rows = [...data].sort((a, b) => {
  const dir = sort.dir === 'asc' ? 1 : -1;
  const va = a[sort.key], vb = b[sort.key];
  return (typeof va === 'number' ? va - vb : String(va).localeCompare(vb)) * dir;
});

<th>
  <button onClick={() => click('cost')} className="inline-flex items-center gap-1">
    Cost 30 d
    <ChevronIcon className={sort.key === 'cost' ? 'opacity-100' : 'opacity-25'} dir={sort.dir} />
  </button>
</th>`;

const CODE_SELECT = `// With selection — Set of ids; indeterminate master checkbox; bulk bar
const [sel, setSel] = useState(new Set());
const toggle = (id) => setSel((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
const toggleAll = () => setSel((s) => s.size === all ? new Set() : new Set(data.map((a) => a.id)));

{sel.size > 0 && (
  <div className="flex items-center gap-3 px-4 h-12 border-b border-border bg-primary/8">
    <span className="text-[12.5px] font-semibold">{sel.size} selected</span>
    <button>Pause</button><button>Reassign</button>
    <button className="text-destructive">Delete</button>
  </div>
)}

<th><Checkbox checked={n === all} indeterminate={n > 0 && n < all} onChange={toggleAll} /></th>
<td><Checkbox checked={sel.has(a.id)} onChange={() => toggle(a.id)} /></td>`;

const CODE_ROWACT = `// Row actions — "Open" button + (…) menu that closes on outside click
const [open, setOpen] = useState(false);
const ref = useRef(null);
useClickOutside(ref, () => setOpen(false), open);

<td className="text-right">
  <button className="h-7 px-2.5 rounded-md text-[12px] hover:bg-secondary">Open</button>
  <div className="relative" ref={ref}>
    <button onClick={() => setOpen((o) => !o)}><DotsIcon /></button>
    {open && (
      <div className="absolute right-0 top-8 w-40 py-1 rounded-lg border border-border bg-popover shadow-md">
        <button>View details</button><button>Pause</button><button>Retry</button>
        <div className="my-1 h-px bg-border" />
        <button className="text-destructive">Delete</button>
      </div>
    )}
  </div>
</td>`;

const CODE_TOOLBAR = `// With toolbar — live-filtering search + "Add"; filtering lives in React
const [q, setQ] = useState('');
const rows = data.filter((a) => !q ||
  (a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.trim().toLowerCase()));

<div className="flex items-center gap-2 px-3 py-3 border-b border-border bg-secondary/20">
  <div className="relative flex-1 max-w-[300px]">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…"
      className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] focus:ring-2 focus:ring-ring/35" />
  </div>
  <button className="h-9 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium"><FilterIcon /> Filters</button>
  <button className="ml-auto h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold"><PlusIcon /> Add service</button>
</div>

{/* … the table renders rows; empty state when rows.length === 0 … */}
// The full system (popovers, chips, saved views) lives in the Filters component.`;

function TablesSection() {
  return (
    <div>
      <SectionHead kicker="Lists" title="Tables" status="done"
        intro="The services table: each service in a row, with runtime, region, status, cost and activity as columns. Dense but readable — right-aligned mono numbers, status pills and a subtly tinted header. Five levels: simple, with sortable headers, with selection and a bulk action bar, with a per-row actions menu, and with a toolbar for live search and adding a service." />

      <Variant title="Simple" desc="The base: subtly tinted header, divided rows that highlight on hover, service identity with avatar on the left and mono metrics on the right." code={CODE_SIMPLE}>
        <SimpleTable />
      </Variant>

      <Variant title="Sortable" desc="Click a header to sort; a second click reverses the direction. The arrow marks the active column and its direction. Starts sorted by cost, descending." code={CODE_SORT}>
        <SortableTable />
      </Variant>

      <Variant title="With selection" desc="A checkbox per row plus a master one with an indeterminate state. Selecting shows the bulk action bar — pause, reassign, delete. Checked rows are tinted." code={CODE_SELECT}>
        <SelectableTable />
      </Variant>

      <Variant title="With row actions" desc="A visible primary action plus an overflow menu that closes on outside click or Escape. To open, pause, retry or delete a service without leaving the table." code={CODE_ROWACT}>
        <RowActionsTable />
      </Variant>

      <Variant title="With toolbar" desc="The self-contained table: the search box filters rows live, next to a filters button and an add-service action in the header. The full filtering system — popovers, chips, saved views — lives in the Filters component; this is the minimal embedded version." code={CODE_TOOLBAR}>
        <ToolbarTable />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tables'] = TablesSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
