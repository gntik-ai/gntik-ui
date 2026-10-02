/* ============================================================================
   Gntik UI · comboboxes.jsx — autocompletar (grupo "Formularios").
   Combobox de marca con filtrado en vivo: básico con check, con avatar +
   secundario, y multiselección con chips. Reutiliza el patrón de popover de
   Select menus. Dominio musematic (modelos, operadores, policies). Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

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

const labelCls = "block text-[13px] font-medium text-foreground mb-2";
const Avatar = ({ initials, size = 22 }) => (
  <span className="inline-grid place-items-center rounded-full bg-accent text-accent-foreground font-semibold shrink-0"
    style={{ width: size, height: size, fontSize: size * 0.42 }}>{initials}</span>
);
const Empty = () => <li className="px-2.5 py-3 text-center text-[12.5px] text-muted-foreground">Sin coincidencias.</li>;

/* ── Combobox de selección única ─────────────────────────────────────────── */
function Combobox({ options, getLabel, render, value, onChange, placeholder = 'Buscar…' }) {
  const [q, setQ] = useState(() => { const s = options.find(o => o.value === value); return s ? getLabel(s) : ''; });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const sel = options.find(o => o.value === value);
  const showAll = q.trim() === '' || (sel && q.trim().toLowerCase() === getLabel(sel).toLowerCase());
  const filtered = showAll ? options : options.filter(o => getLabel(o).toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (o) => { onChange(o.value); setQ(getLabel(o)); setOpen(false); };
  return (
    <div ref={ref} className="relative">
      <div className={"flex items-center rounded-md border bg-background pl-3 pr-1 shadow-sm transition-colors " +
        (open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border')}>
        <Icon name="search" size={15} className="text-muted-foreground shrink-0" />
        <input value={q} placeholder={placeholder}
          onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          className="h-9 w-full bg-transparent pl-2.5 pr-1 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <button type="button" tabIndex={-1} onClick={() => setOpen(o => !o)} aria-label="Abrir"
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Icon name="chevron" size={15} className={"transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
      </div>
      {open && (
        <ul role="listbox" className="absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {filtered.length === 0 ? <Empty /> : filtered.map(o => {
            const on = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={on} onClick={() => pick(o)}
                className={"flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] " + (on ? 'bg-primary/12' : 'hover:bg-secondary/70')}>
                <span className="flex min-w-0 items-center gap-2">{render(o)}</span>
                {on && <Icon name="check" size={15} className="text-primary shrink-0" stroke={2.4} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Combobox multiselección con chips ───────────────────────────────────── */
function MultiCombobox({ options, getLabel, values, onChange, placeholder = 'Añadir…' }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => { setOpen(false); setQ(''); }, open);
  const avail = options.filter(o => !values.includes(o.value));
  const filtered = q.trim() === '' ? avail : avail.filter(o => getLabel(o).toLowerCase().includes(q.trim().toLowerCase()));
  const add = (val) => { onChange([...values, val]); setQ(''); };
  const remove = (val) => onChange(values.filter(v => v !== val));
  const onKey = (e) => {
    if (e.key === 'Enter' && filtered[0]) { e.preventDefault(); add(filtered[0].value); }
    if (e.key === 'Backspace' && q === '' && values.length) remove(values[values.length - 1]);
  };
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(true)}
        className={"flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 shadow-sm transition-colors cursor-text " +
          (open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border')}>
        {values.map(v => {
          const o = options.find(x => x.value === v);
          return (
            <span key={v} className="inline-flex items-center gap-1 rounded bg-primary/14 pl-2 pr-1 h-[24px] text-[12px] font-medium text-primary">
              {getLabel(o)}
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(v); }} className="grid h-4 w-4 place-items-center rounded hover:bg-primary/20 transition-colors"><Icon name="x" size={11} stroke={2.4} /></button>
            </span>
          );
        })}
        <input value={q} placeholder={values.length ? '' : placeholder}
          onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          className="h-[24px] min-w-[80px] flex-1 bg-transparent px-1 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
      </div>
      {open && (
        <ul role="listbox" className="absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {filtered.length === 0
            ? <li className="px-2.5 py-3 text-center text-[12.5px] text-muted-foreground">{avail.length === 0 ? 'Todo añadido.' : 'Sin coincidencias.'}</li>
            : filtered.map(o => (
              <li key={o.value} role="option" onClick={() => add(o.value)}
                className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] text-foreground hover:bg-secondary/70">
                <Icon name="plus" size={14} className="text-muted-foreground shrink-0" />{getLabel(o)}
                {o.note && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{o.note}</span>}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

/* ── datos ───────────────────────────────────────────────────────────────── */
const MODELS = [
  { value: 'sonnet4', label: 'sonnet-4', note: 'Anthropic' },
  { value: 'haiku', label: 'haiku-3.5', note: 'Anthropic' },
  { value: 'opus4', label: 'opus-4', note: 'Anthropic' },
  { value: 'gpt4o', label: 'gpt-4o', note: 'OpenAI' },
  { value: 'gpt4omini', label: 'gpt-4o-mini', note: 'OpenAI' },
  { value: 'o3', label: 'o3', note: 'OpenAI' },
  { value: 'llama', label: 'llama-3.1-70b', note: 'Meta' },
  { value: 'mixtral', label: 'mixtral-8x22b', note: 'Mistral' },
];
const OPERATORS = [
  { value: 'emma', name: 'Emma Crown', email: 'emma@acme.com', init: 'EC' },
  { value: 'leo', name: 'Leo Park', email: 'leo@acme.com', init: 'LP' },
  { value: 'mara', name: 'Mara Vidal', email: 'mara@acme.com', init: 'MV' },
  { value: 'noah', name: 'Noah Frey', email: 'noah@acme.com', init: 'NF' },
  { value: 'ines', name: 'Inés Roca', email: 'ines@acme.com', init: 'IR' },
];
const POLICIES = [
  { value: 'pii', label: 'Redacción de PII', note: 'guardrail' },
  { value: 'rate', label: 'Rate limit', note: 'tráfico' },
  { value: 'cost', label: 'Techo de coste', note: 'coste' },
  { value: 'escal', label: 'Escalado a humano', note: 'fallback' },
  { value: 'allow', label: 'Allowlist de tools', note: 'guardrail' },
  { value: 'audit', label: 'Log de auditoría', note: 'compliance' },
];

/* ── instancias ──────────────────────────────────────────────────────────── */
function BasicCombo() {
  const [v, setV] = useState('sonnet4');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Modelo del agente</label>
      <Combobox options={MODELS} value={v} onChange={setV} getLabel={(o) => o.label} placeholder="Buscar modelo…"
        render={(o) => (<><span className="truncate font-medium text-foreground">{o.label}</span><span className="font-mono text-[11px] text-muted-foreground">{o.note}</span></>)} />
      <p className="mt-2 text-[12px] text-muted-foreground">Escribe para filtrar; Enter elige el primero. Filtra sobre el nombre del modelo.</p>
    </div>
  );
}
function AvatarCombo() {
  const [v, setV] = useState('mara');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Asignar operador on-call</label>
      <Combobox options={OPERATORS} value={v} onChange={setV} getLabel={(o) => o.name} placeholder="Buscar operador…"
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={o.init} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium text-foreground">{o.name}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">{o.email}</span>
            </span>
          </span>
        )} />
    </div>
  );
}
function MultiCombo() {
  const [vals, setVals] = useState(['pii', 'cost']);
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Policies del agente</label>
      <MultiCombobox options={POLICIES} values={vals} onChange={setVals} getLabel={(o) => o.label} placeholder="Añadir policy…" />
      <p className="mt-2 text-[12px] text-muted-foreground">Chips con quitar; Backspace borra el último. Lo elegido sale del desplegable.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_COMBO = `// Combobox — filtra en vivo; muestra todo cuando el campo aún tiene el label elegido
const [q, setQ] = useState('');
const [open, setOpen] = useState(false);
const ref = useRef(null);
useClickOutside(ref, () => setOpen(false), open);

const sel = options.find((o) => o.value === value);
const showAll = q.trim() === '' || (sel && q.toLowerCase() === getLabel(sel).toLowerCase());
const filtered = showAll ? options : options.filter((o) =>
  getLabel(o).toLowerCase().includes(q.trim().toLowerCase()));

<div className={\`flex items-center rounded-md border bg-background pl-3 pr-1 shadow-sm \${
  open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border'}\`}>
  <SearchIcon className="text-muted-foreground" />
  <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
    className="h-9 w-full bg-transparent pl-2.5 text-[13px] focus:outline-none" />
  <button tabIndex={-1} onClick={() => setOpen((o) => !o)}><ChevronIcon /></button>
</div>
{open && (
  <ul className="absolute inset-x-0 z-30 mt-1.5 rounded-md border border-border bg-popover p-1 shadow-lg">
    {filtered.length === 0
      ? <li className="px-2.5 py-3 text-center text-muted-foreground">Sin coincidencias.</li>
      : filtered.map((o) => (
        <li key={o.value} onClick={() => { onChange(o.value); setQ(getLabel(o)); setOpen(false); }}
          className={\`flex justify-between rounded-[6px] px-2.5 py-1.5 cursor-pointer \${
            o.value === value ? 'bg-primary/12' : 'hover:bg-secondary/70'}\`}>
          {render(o)} {o.value === value && <CheckIcon className="text-primary" />}
        </li>
      ))}
  </ul>
)}`;

const CODE_MULTI = `// Multiselección — chips dentro del campo; Enter añade el primero, Backspace quita el último
const avail = options.filter((o) => !values.includes(o.value));
const filtered = q ? avail.filter((o) => getLabel(o).toLowerCase().includes(q.toLowerCase())) : avail;
const onKey = (e) => {
  if (e.key === 'Enter' && filtered[0]) { e.preventDefault(); add(filtered[0].value); }
  if (e.key === 'Backspace' && q === '' && values.length) remove(values.at(-1));
};

<div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
  {values.map((v) => (
    <span key={v} className="inline-flex items-center gap-1 rounded bg-primary/14 pl-2 pr-1 h-6 text-[12px] font-medium text-primary">
      {label(v)}<button onClick={() => remove(v)}><XIcon /></button>
    </span>
  ))}
  <input value={q} onKeyDown={onKey} className="flex-1 min-w-[80px] bg-transparent focus:outline-none" />
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ComboboxesSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Comboboxes" status="done"
        intro="Autocompletar de marca: un input que filtra la lista en vivo mientras escribes. Tres usos del dominio musematic — elegir modelo, asignar un operador con avatar y email, y adjuntar varias policies como chips. Comparte el popover y el check verde de Select menus; añade búsqueda, estado vacío y, en el multi, gestión de etiquetas con teclado." />

      <Variant title="Básico"
        desc="Selección única con filtrado: escribe para acotar, Enter elige el primer resultado, chevron abre la lista completa y aparece «Sin coincidencias» cuando no hay match."
        code={CODE_COMBO}>
        <BasicCombo />
      </Variant>

      <Variant title="Con avatar y secundario"
        desc="El mismo combobox con render de avatar + nombre + email. Filtra por nombre del operador; ideal para asignar on-call o transferir un run."
        code={CODE_COMBO}>
        <AvatarCombo />
      </Variant>

      <Variant title="Multiselección con chips"
        desc="Varias opciones a la vez: cada elección entra como chip dentro del campo y sale del desplegable. Enter añade el primer resultado y Backspace borra el último chip."
        code={CODE_MULTI}>
        <MultiCombo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['comboboxes'] = ComboboxesSection;
})();
