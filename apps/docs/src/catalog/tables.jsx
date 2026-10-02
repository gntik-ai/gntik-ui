/* ============================================================================
   Gntik UI · tables.jsx — tabla densa con estado, orden y selección.
   La tabla del Fleet: agentes en filas, columnas de modelo, región, estado,
   coste y último run. Cabeceras ordenables (clic), selección con checkbox +
   barra de acciones en bloque, y menú de acciones por fila. Dominio musematic ·
   tokens. Variantes: simple · ordenable · con selección · con acciones de fila.
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

/* ── checkbox de marca (input nativo estilizado) ─────────────────────────── */
const Check = ({ checked, indeterminate, onChange }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
    <input type="checkbox" checked={checked} ref={el => el && (el.indeterminate = !!indeterminate)} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-card cursor-pointer checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);

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
  { id: 1, name: 'support-triage', model: 'sonnet-4', region: 'eu-west-1', tone: 'running', state: 'Running', cost: 412.8, runs: 18204, last: 'hace 2 min' },
  { id: 2, name: 'billing-bot', model: 'haiku-4', region: 'us-east-1', tone: 'running', state: 'Running', cost: 88.4, runs: 9442, last: 'hace 5 min' },
  { id: 3, name: 'data-enricher', model: 'sonnet-4', region: 'eu-west-1', tone: 'degraded', state: 'Degraded', cost: 1204.1, runs: 22931, last: 'hace 1 h' },
  { id: 4, name: 'churn-watch', model: 'haiku-4', region: 'ap-south-1', tone: 'paused', state: 'Paused', cost: 0, runs: 0, last: 'hace 2 d' },
  { id: 5, name: 'lead-router', model: 'sonnet-4', region: 'us-east-1', tone: 'running', state: 'Running', cost: 233.5, runs: 7188, last: 'hace 11 min' },
  { id: 6, name: 'fraud-scan', model: 'opus-4', region: 'eu-west-1', tone: 'failed', state: 'Failed', cost: 51.2, runs: 1102, last: 'hace 3 h' },
];

const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (n) => n.toLocaleString('en-US');

/* ── celdas comunes ──────────────────────────────────────────────────────── */
const Th = ({ children, className = '' }) => (
  <th className={"text-left font-sans font-medium text-[11.5px] tracking-wide uppercase text-muted-foreground px-4 h-10 whitespace-nowrap " + className}>{children}</th>
);
const NameCell = ({ name, model }) => (
  <td className="px-4 py-3 whitespace-nowrap">
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name="bot" size={16} /></span>
      <div>
        <div className="font-sans font-semibold text-[13px] text-foreground">{name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">claude-{model}</div>
      </div>
    </div>
  </td>
);

/* ── 1 · Simple ──────────────────────────────────────────────────────────── */
function SimpleTable() {
  return (
    <table className="w-full border-collapse">
      <thead><tr className="border-b border-border bg-secondary/30">
        <Th>Agente</Th><Th>Región</Th><Th>Estado</Th><Th className="text-right">Coste 30 d</Th><Th className="text-right">Último run</Th>
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

/* ── 2 · Ordenable ───────────────────────────────────────────────────────── */
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
        <SortTh k="name">Agente</SortTh><SortTh k="region">Región</SortTh><SortTh k="state">Estado</SortTh>
        <SortTh k="runs" align="right">Runs</SortTh><SortTh k="cost" align="right">Coste 30 d</SortTh>
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

/* ── 3 · Con selección + barra de acciones en bloque ─────────────────────── */
function SelectableTable() {
  const [sel, setSel] = useState(() => new Set([1, 3]));
  const all = FLEET.length, n = sel.size;
  const toggle = (id) => setSel(s => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const toggleAll = () => setSel(s => s.size === all ? new Set() : new Set(FLEET.map(a => a.id)));
  return (
    <div className="relative">
      {/* barra de acciones en bloque (aparece con selección) */}
      <div className={"flex items-center gap-3 px-4 h-12 border-b border-border transition-colors " + (n ? 'bg-primary/8' : 'bg-secondary/30')}>
        {n > 0 ? (
          <>
            <span className="font-sans text-[12.5px] font-semibold text-foreground">{n} seleccionado{n > 1 ? 's' : ''}</span>
            <div className="h-4 w-px bg-border" />
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"><Icon name="pause" size={14} />Pausar</button>
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"><Icon name="refresh" size={14} />Reasignar</button>
            <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-destructive/90 hover:text-destructive transition-colors"><Icon name="trash" size={14} />Eliminar</button>
          </>
        ) : (
          <span className="font-sans text-[12.5px] text-muted-foreground">Selecciona agentes para acciones en bloque</span>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border">
          <th className="w-12 px-4 h-10"><Check checked={n === all} indeterminate={n > 0 && n < all} onChange={toggleAll} /></th>
          <Th>Agente</Th><Th>Región</Th><Th>Estado</Th><Th className="text-right">Coste 30 d</Th>
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

/* ── 4 · Con acciones de fila (menú) ─────────────────────────────────────── */
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
          <button className="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Abrir</button>
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(o => !o)} aria-label="Más acciones"
              className={"w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors " + (open ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
              <Icon name="dot3" size={16} />
            </button>
            {open && (
              <div className="absolute right-0 top-8 z-20 w-40 py-1 rounded-lg border border-border bg-popover shadow-md">
                {[['eye', 'Ver detalle'], ['pause', 'Pausar'], ['refresh', 'Reintentar']].map(([ic, l]) => (
                  <button key={l} onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3 h-8 text-[12.5px] text-popover-foreground hover:bg-accent/60 transition-colors"><Icon name={ic} size={14} className="text-muted-foreground" />{l}</button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3 h-8 text-[12.5px] text-destructive hover:bg-destructive/10 transition-colors"><Icon name="trash" size={14} />Eliminar</button>
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
        <Th>Agente</Th><Th>Región</Th><Th>Estado</Th><Th className="text-right">Coste 30 d</Th><Th className="text-right pr-4">Acciones</Th>
      </tr></thead>
      <tbody className="divide-y divide-border">
        {FLEET.slice(0, 5).map((a) => <ActionRow key={a.id} a={a} />)}
      </tbody>
    </table>
  );
}

/* ── 5 · Con toolbar (buscar en vivo + filtros + añadir) ───────────── */
function ToolbarTable() {
  const [q, setQ] = useState('');
  const [added, setAdded] = useState(false);
  const query = q.trim().toLowerCase();
  const rows = FLEET.filter(a => !query || (a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(query));
  return (
    <div>
      {/* toolbar: buscador + filtros a la izquierda, alta a la derecha */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border bg-secondary/20">
        <div className="relative flex-1 min-w-0 max-w-[300px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar agente, modelo o región…"
            className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35 focus:border-ring/60 transition-shadow" />
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-secondary/60 transition-colors shrink-0">
          <Icon name="filter" size={15} className="text-muted-foreground" />Filtros
        </button>
        <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1600); }}
          className="ml-auto shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold hover:bg-primary/90 transition-colors">
          <Icon name={added ? 'check' : 'plus'} size={15} />{added ? 'Agente añadido' : 'Añadir agente'}
        </button>
      </div>
      {/* tabla filtrada */}
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-border bg-secondary/30">
          <Th>Agente</Th><Th>Región</Th><Th>Estado</Th><Th className="text-right">Coste 30 d</Th>
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
              <div className="text-[13px] text-foreground font-medium">Sin agentes para “{q}”</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Prueba con otro nombre, modelo o región.</div>
            </td></tr>
          )}
        </tbody>
      </table>
      {/* contador */}
      <div className="px-4 py-2.5 border-t border-border bg-secondary/20">
        <span className="font-mono text-[11px] text-muted-foreground">{rows.length} de {FLEET.length} agentes</span>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — thead con tono sutil, filas divididas, números en mono a la derecha
<table className="w-full border-collapse">
  <thead>
    <tr className="border-b border-border bg-secondary/30">
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Agente</th>
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Región</th>
      <th className="text-left text-[11.5px] uppercase text-muted-foreground px-4 h-10">Estado</th>
      <th className="text-right text-[11.5px] uppercase text-muted-foreground px-4 h-10">Coste 30 d</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border">
    {rows.map((a) => (
      <tr key={a.id} className="hover:bg-accent/30">
        <td className="px-4 py-3">{/* avatar + nombre + modelo */}</td>
        <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{a.region}</td>
        <td className="px-4 py-3"><StatusPill tone={a.tone}>{a.state}</StatusPill></td>
        <td className="px-4 py-3 text-right font-mono text-[12.5px]">{money(a.cost)}</td>
      </tr>
    ))}
  </tbody>
</table>`;

const CODE_SORT = `// Ordenable — el estado de orden vive en React; la cabecera alterna asc/desc
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
    Coste 30 d
    <ChevronIcon className={sort.key === 'cost' ? 'opacity-100' : 'opacity-25'} dir={sort.dir} />
  </button>
</th>`;

const CODE_SELECT = `// Con selección — Set de ids; checkbox maestro indeterminado; barra en bloque
const [sel, setSel] = useState(new Set());
const toggle = (id) => setSel((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
const toggleAll = () => setSel((s) => s.size === all ? new Set() : new Set(data.map((a) => a.id)));

{sel.size > 0 && (
  <div className="flex items-center gap-3 px-4 h-12 border-b border-border bg-primary/8">
    <span className="text-[12.5px] font-semibold">{sel.size} seleccionados</span>
    <button>Pausar</button><button>Reasignar</button>
    <button className="text-destructive">Eliminar</button>
  </div>
)}

<th><Checkbox checked={n === all} indeterminate={n > 0 && n < all} onChange={toggleAll} /></th>
<td><Checkbox checked={sel.has(a.id)} onChange={() => toggle(a.id)} /></td>`;

const CODE_ROWACT = `// Acciones de fila — botón "Abrir" + menú (…) con cierre al clic fuera
const [open, setOpen] = useState(false);
const ref = useRef(null);
useClickOutside(ref, () => setOpen(false), open);

<td className="text-right">
  <button className="h-7 px-2.5 rounded-md text-[12px] hover:bg-secondary">Abrir</button>
  <div className="relative" ref={ref}>
    <button onClick={() => setOpen((o) => !o)}><DotsIcon /></button>
    {open && (
      <div className="absolute right-0 top-8 w-40 py-1 rounded-lg border border-border bg-popover shadow-md">
        <button>Ver detalle</button><button>Pausar</button><button>Reintentar</button>
        <div className="my-1 h-px bg-border" />
        <button className="text-destructive">Eliminar</button>
      </div>
    )}
  </div>
</td>`;

const CODE_TOOLBAR = `// Con toolbar — buscador que filtra en vivo + "Añadir"; el filtrado vive en React
const [q, setQ] = useState('');
const rows = data.filter((a) => !q ||
  (a.name + ' ' + a.model + ' ' + a.region).toLowerCase().includes(q.trim().toLowerCase()));

<div className="flex items-center gap-2 px-3 py-3 border-b border-border bg-secondary/20">
  <div className="relative flex-1 max-w-[300px]">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar agente…"
      className="w-full h-9 rounded-md border border-border bg-card pl-9 pr-3 text-[13px] focus:ring-2 focus:ring-ring/35" />
  </div>
  <button className="h-9 px-3 rounded-md border border-border bg-card text-[12.5px] font-medium"><FilterIcon /> Filtros</button>
  <button className="ml-auto h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold"><PlusIcon /> Añadir agente</button>
</div>

{/* … la tabla pinta rows; estado vacío cuando rows.length === 0 … */}
// El sistema completo (popovers, chips, vistas guardadas) vive en el componente Filters.`;

function TablesSection() {
  return (
    <div>
      <SectionHead kicker="Listas" title="Tables" status="done"
        intro="La tabla del Fleet: cada agente en una fila, con modelo, región, estado, coste y actividad en columnas. Densa pero legible — números en mono alineados a la derecha, pills de estado y tono sutil en la cabecera. Cinco niveles: simple, con cabeceras ordenables, con selección y barra de acciones en bloque, con menú de acciones por fila, y con toolbar de búsqueda en vivo y alta de agente." />

      <Variant title="Simple" desc="La base: cabecera con tono sutil, filas divididas que se iluminan al hover, identidad del agente con avatar a la izquierda y métricas en mono a la derecha." code={CODE_SIMPLE}>
        <SimpleTable />
      </Variant>

      <Variant title="Ordenable" desc="Clic en una cabecera para ordenar; un segundo clic invierte la dirección. La flecha marca la columna activa y su sentido. Empieza ordenada por coste descendente." code={CODE_SORT}>
        <SortableTable />
      </Variant>

      <Variant title="Con selección" desc="Checkbox por fila más uno maestro con estado indeterminado. Al seleccionar aparece la barra de acciones en bloque — pausar, reasignar, eliminar. Las filas marcadas quedan teñidas." code={CODE_SELECT}>
        <SelectableTable />
      </Variant>

      <Variant title="Con acciones de fila" desc="Una acción primaria visible más un menú de overflow que se cierra al hacer clic fuera o con Escape. Para abrir, pausar, reintentar o eliminar un agente sin salir de la tabla." code={CODE_ROWACT}>
        <RowActionsTable />
      </Variant>

      <Variant title="Con toolbar" desc="La tabla autocontenida: el buscador filtra las filas en vivo, junto a un botón de filtros y el alta de agente en la cabecera. El sistema completo de filtrado — popovers, chips, vistas guardadas — vive en el componente Filters; aquí va la versión mínima embebida." code={CODE_TOOLBAR}>
        <ToolbarTable />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tables'] = TablesSection;
})();
