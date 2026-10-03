/* ============================================================================
   Gntik UI · select-menus.jsx — selects ("Forms" group).
   The brand native select + a reusable custom Listbox (button → popover
   with a check on the selected option), in text, avatar+secondary and
   status-dot flavors. Neutral fixtures. Tokens, no hardcoding.
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
const Dot = ({ tone }) => <span className={"size-2 rounded-full shrink-0 " + tone} />;

/* ── Reusable custom Listbox ────────────────────────────────────────────── */
function Listbox({ value, onChange, options, render, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const sel = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={"flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background pl-3 pr-2.5 text-[13px] text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/25 " +
          (open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border hover:border-muted-foreground/40')}>
        <span className="flex min-w-0 items-center gap-2 truncate">
          {sel ? render(sel) : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <Icon name="chevron" size={15} className={"text-muted-foreground shrink-0 transition-transform " + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {options.map(o => {
            const on = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={on} onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}
                className={"flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] " +
                  (o.disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer ' + (on ? 'bg-primary/12' : 'hover:bg-secondary/70'))}>
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

/* ── data ────────────────────────────────────────────────────────────────── */
const REGIONS = [
  { value: 'eu', label: 'EU-West · Frankfurt' },
  { value: 'us-e', label: 'US-East · Boston' },
  { value: 'us-w', label: 'US-West · San Francisco' },
  { value: 'ap', label: 'AP-South · Singapore', disabled: true },
];
const OPERATORS = [
  { value: 'emma', name: 'Emma Crown', email: 'emma@acme.com', init: 'EC' },
  { value: 'leo', name: 'Leo Park', email: 'leo@acme.com', init: 'LP' },
  { value: 'mara', name: 'Mara Vidal', email: 'mara@acme.com', init: 'MV' },
  { value: 'noah', name: 'Noah Frey', email: 'noah@acme.com', init: 'NF' },
];
const ENVS = [
  { value: 'prod', label: 'Production', tone: 'bg-primary', note: '12 services' },
  { value: 'staging', label: 'Staging', tone: 'bg-warning', note: '4 services' },
  { value: 'dev', label: 'Development', tone: 'bg-info', note: '7 services' },
  { value: 'paused', label: 'Paused', tone: 'bg-muted-foreground/40', note: '0 services' },
];

/* ── 1 · NATIVE ──────────────────────────────────────────────────────────── */
function NativeSelects() {
  const sel = "h-9 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-9 text-[13px] text-foreground shadow-sm transition-colors focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25 cursor-pointer";
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Region</label>
        <div className="relative">
          <select defaultValue="eu" className={sel}>
            {REGIONS.map(r => <option key={r.value} value={r.value} disabled={r.disabled}>{r.label}</option>)}
          </select>
          <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Instance type</label>
        <div className="relative">
          <select defaultValue="" className={sel}>
            <option value="" disabled>Select instance type…</option>
            <optgroup label="Compute-optimized"><option>c7.large</option><option>c7.xlarge</option></optgroup>
            <optgroup label="Memory-optimized"><option>r7.large</option><option>r7.xlarge</option></optgroup>
          </select>
          <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">The OS-native select, with the brand chevron.</p>
      </div>
    </div>
  );
}

/* ── 2 · CUSTOM basic ────────────────────────────────────────────────────── */
function CustomBasic() {
  const [v, setV] = useState('eu');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Deployment region</label>
      <Listbox value={v} onChange={setV} options={REGIONS}
        render={(o) => <span className="truncate">{o.label}{o.disabled && <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">soon</span>}</span>} />
      <p className="mt-2 text-[12px] text-muted-foreground">Custom Listbox: check on the active option, disabled option and close on outside click.</p>
    </div>
  );
}

/* ── 3 · WITH AVATAR + secondary ─────────────────────────────────────────── */
function WithAvatar() {
  const [v, setV] = useState('emma');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Assign operator</label>
      <Listbox value={v} onChange={setV} options={OPERATORS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={o.init} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium text-foreground">{o.name}</span>
            </span>
          </span>
        )} />
      <p className="mt-2 text-[12px] text-muted-foreground">Each option has an avatar; the email shows in the popover row.</p>
    </div>
  );
}

/* render variant with email in the dropdown (same Listbox, 2-line render) */
function WithAvatarRich() {
  const [v, setV] = useState('leo');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Policy reviewer</label>
      <Listbox value={v} onChange={setV} options={OPERATORS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={o.init} size={26} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium text-foreground">{o.name}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">{o.email}</span>
            </span>
          </span>
        )} />
    </div>
  );
}

/* ── 4 · WITH STATUS (color dot) ────────────────────────────────────────── */
function WithStatus() {
  const [v, setV] = useState('prod');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Active environment</label>
      <Listbox value={v} onChange={setV} options={ENVS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Dot tone={o.tone} />
            <span className="truncate font-medium text-foreground">{o.label}</span>
            <span className="ml-1 truncate font-mono text-[11px] text-muted-foreground">{o.note}</span>
          </span>
        )} />
      <p className="mt-2 text-[12px] text-muted-foreground">Status dot per environment: prod in green, staging in amber, dev in info blue.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_LISTBOX = `// Custom Listbox — button + popover; render decides how each option is drawn
function Listbox({ value, onChange, options, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const sel = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={\`flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background pl-3 pr-2.5
          text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/25 \${
          open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border hover:border-muted-foreground/40'}\`}>
        <span className="flex items-center gap-2 truncate">{sel ? render(sel) : <span className="text-muted-foreground">Select…</span>}</span>
        <ChevronIcon className={\`text-muted-foreground transition-transform \${open ? 'rotate-180' : ''}\`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute inset-x-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-md
                                      border border-border bg-popover p-1 shadow-lg">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={on}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={\`flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px]
                  cursor-pointer \${on ? 'bg-primary/12' : 'hover:bg-secondary/70'}\`}>
                <span className="flex items-center gap-2">{render(o)}</span>
                {on && <CheckIcon className="text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}`;

const CODE_NATIVE = `// Native: appearance-none + brand chevron positioned on top
<div className="relative">
  <select className="h-9 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-9
                     text-[13px] shadow-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25">
    <optgroup label="Compute-optimized"><option>c7.large</option></optgroup>
  </select>
  <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
</div>`;

const CODE_RENDER = `// Same Listbox, different renders → avatar+secondary · status dot
render={(o) => (
  <span className="flex items-center gap-2.5">
    <Avatar initials={o.init} />
    <span className="flex flex-col leading-tight">
      <span className="font-medium text-foreground">{o.name}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{o.email}</span>
    </span>
  </span>
)}

render={(o) => (
  <span className="flex items-center gap-2.5">
    <span className={\`size-2 rounded-full \${o.tone}\`} />  {/* bg-primary · bg-warning · bg-info */}
    <span className="font-medium text-foreground">{o.label}</span>
  </span>
)}`;

/* ── section ─────────────────────────────────────────────────────────────── */
function SelectMenusSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Select menus" status="done"
        intro="Two paths: the brand native select (fast, accessible, with the token chevron) and a reusable custom Listbox when each option needs more than text. The same component, changing only the render function, works for regions, assigning an operator with avatar and email, or picking an environment with a status dot. Green check on the active option and close on outside click." />

      <Variant title="Native"
        desc="The system <select> with appearance-none and the brand chevron. Supports groups, disabled options and a placeholder. The most robust choice for simple lists."
        code={CODE_NATIVE}>
        <NativeSelects />
      </Variant>

      <Variant title="Custom · basic"
        desc="The brand Listbox: a button that opens a popover on bg-popover, green check on the selected option, a disabled row and close on outside click or Escape."
        code={CODE_LISTBOX}>
        <CustomBasic />
      </Variant>

      <Variant title="With avatar and secondary"
        desc="The same Listbox with a render that draws avatar + name + email. For assigning an operator, picking a policy reviewer or transferring ownership."
        code={CODE_RENDER}>
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
          <WithAvatar />
          <WithAvatarRich />
        </div>
      </Variant>

      <Variant title="With status"
        desc="Render with a color dot per environment and a secondary counter. Green prod, amber staging, info-blue dev — the same semantic scale as the rest of the library."
        code={CODE_RENDER}>
        <WithStatus />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['select-menus'] = SelectMenusSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
