/* ============================================================================
   Gntik UI · comboboxes.jsx — autocomplete ("Forms" group).
   Brand combobox with live filtering: basic with check, with avatar +
   secondary text, and multi-select with chips. Reuses the Select menus
   popover pattern (runtimes, teammates, policies). Tokens.
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
const Empty = () => <li className="px-2.5 py-3 text-center text-[12.5px] text-muted-foreground">No matches.</li>;

/* ── Single-select combobox ──────────────────────────────────────────────── */
function Combobox({ options, getLabel, render, value, onChange, placeholder = 'Search…' }) {
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
        <button type="button" tabIndex={-1} onClick={() => setOpen(o => !o)} aria-label="Open"
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

/* ── Multi-select combobox with chips ────────────────────────────────────── */
function MultiCombobox({ options, getLabel, values, onChange, placeholder = 'Add…' }) {
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
            ? <li className="px-2.5 py-3 text-center text-[12.5px] text-muted-foreground">{avail.length === 0 ? 'Everything added.' : 'No matches.'}</li>
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

/* ── data ────────────────────────────────────────────────────────────────── */
const MODELS = [
  { value: 'node24', label: 'node-24', note: 'JavaScript' },
  { value: 'node22', label: 'node-22', note: 'JavaScript' },
  { value: 'bun', label: 'bun-1.2', note: 'JavaScript' },
  { value: 'py313', label: 'python-3.13', note: 'Python' },
  { value: 'py312', label: 'python-3.12', note: 'Python' },
  { value: 'go', label: 'go-1.24', note: 'Go' },
  { value: 'java', label: 'java-21', note: 'Java' },
  { value: 'ruby', label: 'ruby-3.4', note: 'Ruby' },
];
const OPERATORS = [
  { value: 'emma', name: 'Emma Crown', email: 'emma@acme.com', init: 'EC' },
  { value: 'leo', name: 'Leo Park', email: 'leo@acme.com', init: 'LP' },
  { value: 'mara', name: 'Mara Vidal', email: 'mara@acme.com', init: 'MV' },
  { value: 'noah', name: 'Noah Frey', email: 'noah@acme.com', init: 'NF' },
  { value: 'ines', name: 'Inés Roca', email: 'ines@acme.com', init: 'IR' },
];
const POLICIES = [
  { value: 'pii', label: 'PII redaction', note: 'safeguard' },
  { value: 'rate', label: 'Rate limit', note: 'traffic' },
  { value: 'cost', label: 'Cost ceiling', note: 'cost' },
  { value: 'escal', label: 'Escalate to on-call', note: 'fallback' },
  { value: 'allow', label: 'Integration allowlist', note: 'safeguard' },
  { value: 'audit', label: 'Audit log', note: 'compliance' },
];

/* ── instances ───────────────────────────────────────────────────────────── */
function BasicCombo() {
  const [v, setV] = useState('node24');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Service runtime</label>
      <Combobox options={MODELS} value={v} onChange={setV} getLabel={(o) => o.label} placeholder="Search runtime…"
        render={(o) => (<><span className="truncate font-medium text-foreground">{o.label}</span><span className="font-mono text-[11px] text-muted-foreground">{o.note}</span></>)} />
      <p className="mt-2 text-[12px] text-muted-foreground">Type to filter; Enter picks the first one. Filters on the runtime name.</p>
    </div>
  );
}
function AvatarCombo() {
  const [v, setV] = useState('mara');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Assign on-call owner</label>
      <Combobox options={OPERATORS} value={v} onChange={setV} getLabel={(o) => o.name} placeholder="Search people…"
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
      <label className={labelCls}>Service policies</label>
      <MultiCombobox options={POLICIES} values={vals} onChange={setVals} getLabel={(o) => o.label} placeholder="Add policy…" />
      <p className="mt-2 text-[12px] text-muted-foreground">Removable chips; Backspace deletes the last one. Chosen items leave the dropdown.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_COMBO = `// Combobox — filters live; shows everything while the field still holds the chosen label
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
      ? <li className="px-2.5 py-3 text-center text-muted-foreground">No matches.</li>
      : filtered.map((o) => (
        <li key={o.value} onClick={() => { onChange(o.value); setQ(getLabel(o)); setOpen(false); }}
          className={\`flex justify-between rounded-[6px] px-2.5 py-1.5 cursor-pointer \${
            o.value === value ? 'bg-primary/12' : 'hover:bg-secondary/70'}\`}>
          {render(o)} {o.value === value && <CheckIcon className="text-primary" />}
        </li>
      ))}
  </ul>
)}`;

const CODE_MULTI = `// Multi-select — chips inside the field; Enter adds the first, Backspace removes the last
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

/* ── section ─────────────────────────────────────────────────────────────── */
function ComboboxesSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Comboboxes" status="done"
        intro="Brand autocomplete: an input that filters the list live as you type. Three uses — picking a runtime, assigning a teammate with avatar and email, and attaching several policies as chips. It shares the popover and green check of Select menus; adds search, an empty state and, in the multi variant, keyboard tag management." />

      <Variant title="Basic"
        desc="Single selection with filtering: type to narrow down, Enter picks the first result, the chevron opens the full list and “No matches” appears when nothing matches."
        code={CODE_COMBO}>
        <BasicCombo />
      </Variant>

      <Variant title="With avatar and secondary text"
        desc="The same combobox rendering avatar + name + email. Filters by person name; ideal for assigning on-call or handing over a task."
        code={CODE_COMBO}>
        <AvatarCombo />
      </Variant>

      <Variant title="Multi-select with chips"
        desc="Several options at once: each choice enters the field as a chip and leaves the dropdown. Enter adds the first result and Backspace deletes the last chip."
        code={CODE_MULTI}>
        <MultiCombo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['comboboxes'] = ComboboxesSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
