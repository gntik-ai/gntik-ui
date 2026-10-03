/* ============================================================================
   Gntik UI · drawers.jsx — side panels ("Overlays" group).
   Scrim + panel sliding in from one side, contained in the preview (absolute).
   Three patterns: service detail (right, read-only), edit configuration
   (right, form) and navigation (left, sheet). Fixed header, scrolling body
   and footer with actions. Closes via scrim / ✕ / Esc. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, StatusTag, useState, useEffect } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-5 sm:p-6">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── hook: mounts + animates enter/exit ──────────────────────────────────── */
function useReveal(open, ms = 300) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let raf1, raf2, t;
    if (open) { setMounted(true); raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(true)); }); }
    else { setShown(false); t = setTimeout(() => setMounted(false), ms); }
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t); };
  }, [open]);
  return [mounted, shown];
}

/* ── drawer shell: scrim + side panel, contained (absolute) ──────────────── */
function Drawer({ open, onClose, side = 'right', width = 396, labelledBy, children }) {
  const [mounted, shown] = useReveal(open);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  const sideCls = side === 'right' ? 'right-0 border-l' : 'left-0 border-r';
  const hidden = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  return (
    <div className="absolute inset-0 z-50">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/70 backdrop-blur-[3px] transition-opacity duration-300 " + (shown ? 'opacity-100' : 'opacity-0')} />
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
        className={"absolute top-0 bottom-0 flex max-w-[88%] flex-col border-border bg-popover shadow-lg transition-transform duration-300 ease-out " +
          sideCls + ' ' + (shown ? 'translate-x-0' : hidden)} style={{ width }}>
        {children}
      </div>
    </div>
  );
}

/* ── local primitives ────────────────────────────────────────────────────── */
const BTN = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'border border-border bg-card text-foreground hover:bg-secondary/60',
  ghost: 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
};
const Btn = ({ variant = 'secondary', className = '', children, ...p }) => (
  <button {...p} className={"inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors " + BTN[variant] + ' ' + className}>{children}</button>
);
const IconClose = ({ onClick }) => (
  <button onClick={onClick} aria-label="Close"
    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
    <Icon name="x" size={16} stroke={2.2} />
  </button>
);
const Trigger = ({ children, onClick, hint }) => (
  <div className="absolute inset-0 grid place-content-center gap-3 text-center">
    <div><Btn variant="secondary" onClick={onClick}>{children}</Btn></div>
    {hint && <p className="h-4 text-[12px] text-muted-foreground">{hint}</p>}
  </div>
);
const fieldCls = "block w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";
const Input = (p) => <input {...p} className={fieldCls + " h-9 " + (p.className || '')} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={fieldCls + " h-9 appearance-none pr-9 cursor-pointer"}>{children}</select>
    <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);
const Field = ({ label, children }) => (
  <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-foreground">{label}</span>{children}</label>
);
const Switch = ({ on, onChange }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onChange}
    className={"relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors " + (on ? 'bg-primary' : 'bg-secondary')}>
    <span className={"pointer-events-none ml-[2px] size-[18px] rounded-full bg-background shadow-sm transition-transform " + (on ? 'translate-x-[18px]' : 'translate-x-0')} />
  </button>
);

/* ── 1 · SERVICE DETAIL (right · read-only) ──────────────────────────────── */
const META = [['Region', 'eu-west-1', true], ['Runtime', 'node-24', true], ['Owner', 'Marta Ríos', false], ['Created', 'May 12, 2026', false]];
const ACT = [
  { ic: 'check', tone: 'text-primary', t: 'Deploy complete', s: '8 min ago · v4.5' },
  { ic: 'bolt', tone: 'text-info', t: '1.2k requests processed', s: 'last hour' },
  { ic: 'alert', tone: 'text-warning', t: 'Cost/request +18%', s: '2 h ago' },
];
function DetailDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-[480px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint="Opens the detail panel">
        <Icon name="bot" size={16} />View service details
      </Trigger>
      <Drawer open={open} onClose={() => setOpen(false)} side="right" width={404} labelledBy="det-t">
        {/* header */}
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon name="bot" size={20} /></span>
          <div className="min-w-0 flex-1">
            <h3 id="det-t" className="truncate text-[15px] font-semibold tracking-tight text-foreground">billing-api</h3>
            <div className="mt-1 flex items-center gap-2"><StatusTag status="done" /><span className="font-mono text-[11px] text-muted-foreground">id_a3f9</span></div>
          </div>
          <IconClose onClick={() => setOpen(false)} />
        </div>
        {/* scrolling body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-3 gap-2.5">
            {[['Uptime', '99.9%'], ['Requests / day', '4.8k'], ['Cost / day', '$182']].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-card px-3 py-2.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">{v}</div>
              </div>
            ))}
          </div>
          <dl className="mt-5 divide-y divide-border rounded-lg border border-border">
            {META.map(([k, v, mono]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
                <dt className="text-[12.5px] text-muted-foreground">{k}</dt>
                <dd className={"text-[12.5px] text-foreground " + (mono ? 'font-mono' : 'font-medium')}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recent activity</div>
          <ul className="space-y-1">
            {ACT.map((a, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/40">
                <span className={"grid size-7 shrink-0 place-items-center rounded-lg bg-foreground/5 " + a.tone}><Icon name={a.ic} size={14} stroke={2} /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-medium text-foreground">{a.t}</div><div className="font-mono text-[10.5px] text-muted-foreground">{a.s}</div></div>
              </li>
            ))}
          </ul>
        </div>
        {/* footer */}
        <div className="flex items-center gap-2.5 border-t border-border px-5 py-4">
          <Btn variant="secondary" className="flex-1" onClick={() => setOpen(false)}><Icon name="pause" size={15} />Pause</Btn>
          <Btn variant="primary" className="flex-1" onClick={() => setOpen(false)}><Icon name="settings" size={15} />Edit</Btn>
        </div>
      </Drawer>
    </div>
  );
}

/* ── 2 · EDIT CONFIGURATION (right · form) ───────────────────────────────── */
function EditDrawer() {
  const [open, setOpen] = useState(false);
  const [retry, setRetry] = useState(true);
  const [eco, setEco] = useState('');
  const save = (e) => { e.preventDefault(); setOpen(false); setEco('Configuration saved'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[480px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-primary">{eco}</span> : 'Opens the edit form'}>
        <Icon name="settings" size={16} />Edit configuration
      </Trigger>
      <Drawer open={open} onClose={() => setOpen(false)} side="right" width={420} labelledBy="edit-t">
        <form onSubmit={save} className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div><h3 id="edit-t" className="text-[15px] font-semibold tracking-tight text-foreground">Edit service</h3><p className="mt-0.5 text-[12px] text-muted-foreground">billing-api · eu-west-1</p></div>
            <IconClose onClick={() => setOpen(false)} />
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Name"><Input defaultValue="billing-api" /></Field>
            <Field label="Region"><Select defaultValue="eu-west-1"><option>eu-west-1</option><option>us-east-1</option><option>ap-south-1</option></Select></Field>
            <Field label="Runtime"><Select defaultValue="node-24"><option>node-24</option><option>python-3.13</option><option>go-1.24</option></Select></Field>
            <Field label="Cost limit / request">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12.5px] text-muted-foreground">$</span>
                <Input defaultValue="0.40" className="pl-7 font-mono" />
              </div>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3">
              <div className="pr-4"><div className="text-[12.5px] font-medium text-foreground">Automatic retries</div><div className="mt-0.5 text-[11.5px] leading-4 text-muted-foreground" style={{ textWrap: 'pretty' }}>Retries 3× with backoff before falling back.</div></div>
              <Switch on={retry} onChange={() => setRetry(v => !v)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 border-t border-border px-5 py-4">
            <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn variant="primary" type="submit"><Icon name="check" size={15} />Save changes</Btn>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

/* ── 3 · NAVIGATION (left · sheet) ───────────────────────────────────────── */
const NAV = [['home', 'Overview'], ['net', 'Deployments'], ['coin', 'Costs'], ['shield', 'Policies'], ['list', 'Logs'], ['cog', 'Settings']];
function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Deployments');
  return (
    <div className="relative h-[480px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={<>Active section: <span className="font-mono text-foreground">{active}</span></>}>
        <Icon name="menu" size={16} />Open menu
      </Trigger>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" width={284} labelledBy="nav-t">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4">
          <h3 id="nav-t" className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-foreground"><Icon name="fleet" size={18} className="text-primary" />Workspace</h3>
          <IconClose onClick={() => setOpen(false)} />
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {NAV.map(([ic, label]) => {
            const on = label === active;
            return (
              <button key={label} onClick={() => { setActive(label); setOpen(false); }}
                className={"relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] transition-colors " + (on ? 'bg-accent font-semibold text-accent-foreground' : 'font-medium text-muted-foreground hover:bg-accent/45 hover:text-foreground')}>
                {on && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />}
                <Icon name={ic} size={17} className="shrink-0" />{label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">MR</span>
          <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-medium text-foreground">Marta Ríos</div><div className="font-mono text-[10.5px] text-muted-foreground">operator</div></div>
          <Icon name="logout" size={16} className="text-muted-foreground" />
        </div>
      </Drawer>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SHELL = `// Drawer — scrim + side panel sliding in with translate-x; closes via scrim/✕/Esc
function Drawer({ open, onClose, side = "right", width = 396, children }) {
  const [mounted, shown] = useReveal(open, 300);     // mounts + animates in/out
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  const sideCls = side === "right" ? "right-0 border-l" : "left-0 border-r";
  const hidden  = side === "right" ? "translate-x-full" : "-translate-x-full";
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/70 backdrop-blur-[3px] transition-opacity duration-300 " +
          (shown ? "opacity-100" : "opacity-0")} />
      <div role="dialog" aria-modal="true" style={{ width }}
        className={"absolute top-0 bottom-0 flex flex-col border-border bg-popover shadow-lg " +
          "transition-transform duration-300 ease-out " + sideCls + " " +
          (shown ? "translate-x-0" : hidden)}>
        {children}   {/* fixed header · body with overflow-y-auto · fixed footer */}
      </div>
    </div>
  );
}`;

const CODE_LAYOUT = `// Inner structure: fixed header and footer, scrollable body
<div className="flex h-full flex-col">
  <header className="flex items-center justify-between border-b border-border px-5 py-4">…</header>
  <div className="flex-1 overflow-y-auto px-5 py-5">… content …</div>
  <footer className="flex justify-end gap-2.5 border-t border-border px-5 py-4">
    <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary/60">Cancel</button>
    <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
  </footer>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function DrawersSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Drawers" status="done"
        intro="The panel that slides in from an edge to view or edit a resource without losing the page context. The same shell for three uses: read-only detail (right), edit form (right) and sheet navigation (left). Fixed header and footer, scrolling body; it slides in with translate-x and closes on outside click, the ✕ or Esc. In the catalog it is absolute inside the preview; in production, fixed inset-0." />

      <Variant title="Detail (read-only)"
        desc="The inspection panel: header with avatar, name and status; body with metrics, key-value pairs and recent activity; footer with the resource actions. Slides in from the right."
        code={CODE_SHELL}>
        <DetailDrawer />
      </Variant>

      <Variant title="Edit (form)"
        desc="The same panel in edit mode: brand fields (input, selects, $ prefix, switch) in a scrollable body and a footer with Cancel + Save. Save and you will see the echo under the trigger."
        code={CODE_LAYOUT}>
        <EditDrawer />
      </Variant>

      <Variant title="Navigation (sheet)"
        desc="The same shell from the left as a product menu: the app nav with the active item highlighted and the account at the bottom. Choosing a section closes the panel.">
        <NavDrawer />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['drawers'] = DrawersSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
