/* ============================================================================
   Gntik UI · dropdowns.jsx — menus ("Elements" group).
   Row actions (icons · shortcuts · danger zone), grouped menu with a
   header and labels, single selection with check, and multi-selection that
   stays open. Brand popover; closes on outside click or Esc. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-10">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── Menu primitives ─────────────────────────────────────────────────────── */
function Dropdown({ width = 208, align = 'left', children, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block text-left">
      {render({ open, toggle: () => setOpen(o => !o) })}
      {open && (
        <div className={"absolute top-[calc(100%+8px)] z-50 rounded-[10px] border border-border bg-popover p-1.5 shadow-md " + (align === 'right' ? 'right-0' : 'left-0')} style={{ minWidth: width }}>
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
const MItem = ({ icon, danger, shortcut, children, onClick }) => (
  <button type="button" onClick={onClick}
    className={"flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] transition-colors " + (danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-secondary/70')}>
    {icon && <Icon name={icon} size={15} className={danger ? '' : 'text-muted-foreground'} />}
    <span className="flex-1">{children}</span>
    {shortcut && <span className="font-mono text-[10.5px] text-muted-foreground/70">{shortcut}</span>}
  </button>
);
const MLabel = ({ children }) => <div className="px-2.5 pt-2 pb-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">{children}</div>;
const MSep = () => <div className="-mx-1.5 my-1.5 h-px bg-border" />;

/* ── 1 · ROW ACTIONS (shortcuts + danger) ────────────────────────────────── */
function RowActions() {
  const [msg, setMsg] = useState('');
  const flash = (t, close) => { setMsg(t); close(); setTimeout(() => setMsg(''), 1400); };
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={208} render={({ open, toggle }) => (
        <button onClick={toggle} aria-label="Service actions" aria-expanded={open}
          className={"grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary/60 hover:text-foreground " + (open ? 'bg-secondary/60 text-foreground' : '')}>
          <Icon name="dot3" size={18} />
        </button>
      )}>
        {({ close }) => (
          <React.Fragment>
            <MItem icon="eye" shortcut="⌘L" onClick={() => flash('Opening logs…', close)}>View logs</MItem>
            <MItem icon="refresh" shortcut="⌘R" onClick={() => flash('Restarted', close)}>Restart</MItem>
            <MItem icon="copy" shortcut="⌘D" onClick={() => flash('Duplicated', close)}>Duplicate</MItem>
            <MSep />
            <MItem icon="pause" onClick={() => flash('Paused', close)}>Pause</MItem>
            <MSep />
            <MItem icon="trash" danger shortcut="⌫" onClick={() => flash('Deleted', close)}>Delete service</MItem>
          </React.Fragment>
        )}
      </Dropdown>
      <span className="h-4 font-mono text-[11px] text-muted-foreground/80">{msg || 'row actions · icons, shortcuts and danger'}</span>
    </div>
  );
}

/* ── 2 · GROUPED with header ─────────────────────────────────────────────── */
function Grouped() {
  return (
    <Dropdown width={240} render={({ open, toggle }) => (
      <button onClick={toggle} aria-expanded={open}
        className="flex items-center gap-2.5 h-11 pl-1.5 pr-3 rounded-[10px] border border-border bg-card shadow-sm transition-colors hover:bg-secondary/50">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">MR</span>
        <span className="flex flex-col items-start leading-tight"><span className="text-[13px] font-semibold text-foreground">Marta Ríos</span><span className="font-mono text-[10px] text-muted-foreground">operator</span></span>
        <Icon name="chevron" size={14} className={"ml-1 text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
      </button>
    )}>
      {({ close }) => (
        <React.Fragment>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-[12px] font-bold text-accent-foreground">MR</span>
            <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-foreground">Marta Ríos</div><div className="truncate font-mono text-[10.5px] text-muted-foreground">marta@acme.co</div></div>
          </div>
          <MSep />
          <MLabel>Account</MLabel>
          <MItem icon="user" onClick={close}>Profile</MItem>
          <MItem icon="settings" onClick={close}>Preferences</MItem>
          <MLabel>Workspace</MLabel>
          <MItem icon="fleet" onClick={close}>Switch workspace</MItem>
          <MItem icon="shield" onClick={close}>Policies</MItem>
          <MSep />
          <MItem icon="logout" danger onClick={close}>Sign out</MItem>
        </React.Fragment>
      )}
    </Dropdown>
  );
}

/* ── 3 · SINGLE SELECTION (check) ────────────────────────────────────────── */
const REGIONS = ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'];
function SingleSelect() {
  const [region, setRegion] = useState('eu-west-1');
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={200} render={({ open, toggle }) => (
        <button onClick={toggle} aria-expanded={open}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60">
          <Icon name="net" size={15} className="text-muted-foreground" />
          <span className="font-mono text-[12.5px]">{region}</span>
          <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
      )}>
        {({ close }) => (
          <React.Fragment>
            <MLabel>Region</MLabel>
            {REGIONS.map(r => (
              <button key={r} onClick={() => { setRegion(r); close(); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
                <span className="flex-1 font-mono text-[12.5px] text-foreground">{r}</span>
                {region === r && <Icon name="check" size={15} className="text-primary" />}
              </button>
            ))}
          </React.Fragment>
        )}
      </Dropdown>
      <span className="font-mono text-[11px] text-muted-foreground/80">single selection — closes and updates the trigger</span>
    </div>
  );
}

/* ── 4 · MULTI-SELECTION (stays open) ────────────────────────────────────── */
const COLS = [['state', 'Status'], ['runs', 'Requests'], ['cost', 'Cost'], ['uptime', 'Uptime'], ['last', 'Last']];
function MultiSelect() {
  const [on, setOn] = useState({ state: true, runs: true, cost: true, uptime: false, last: true });
  const count = Object.values(on).filter(Boolean).length;
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={210} render={({ open, toggle }) => (
        <button onClick={toggle} aria-expanded={open}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60">
          <Icon name="layout" size={15} className="text-muted-foreground" />Columns
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 font-mono text-[10px] font-semibold text-muted-foreground">{count}</span>
          <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
      )}>
        <MLabel>Visible columns</MLabel>
        {COLS.map(([id, label]) => (
          <button key={id} onClick={() => setOn(o => ({ ...o, [id]: !o[id] }))}
            className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
            <span className={"grid size-[18px] place-items-center rounded-[5px] border transition-colors " + (on[id] ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent')}><Icon name="check" size={12} stroke={2.6} /></span>
            <span className="flex-1 text-[13px] text-foreground">{label}</span>
          </button>
        ))}
      </Dropdown>
      <span className="font-mono text-[11px] text-muted-foreground/80">multi-selection — the menu stays open</span>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_DD = `// Dropdown — closes on outside click / Esc with useClickOutside
function Dropdown({ width = 208, align = "left", render, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block text-left">
      {render({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div style={{ minWidth: width }}
          className={"absolute top-[calc(100%+8px)] z-50 rounded-[10px] border border-border bg-popover p-1.5 shadow-md " +
            (align === "right" ? "right-0" : "left-0")}>
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

const MItem = ({ icon: Glyph, danger, shortcut, children, onClick }) => (
  <button onClick={onClick}
    className={"flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] transition-colors " +
      (danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-secondary/70")}>
    {Glyph && <Glyph className={danger ? "" : "text-muted-foreground"} />}
    <span className="flex-1">{children}</span>
    {shortcut && <span className="font-mono text-[10.5px] text-muted-foreground/70">{shortcut}</span>}
  </button>
);`;

const CODE_MULTI = `// Item with check — multi-selection that does NOT close the menu on press
<button onClick={() => setOn((o) => ({ ...o, [id]: !o[id] }))}
  className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] hover:bg-secondary/70">
  <span className={"grid size-[18px] place-items-center rounded-[5px] border " +
    (on[id] ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}>
    <CheckIcon />
  </span>
  <span className="flex-1 text-[13px] text-foreground">{label}</span>
</button>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function DropdownsSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Dropdowns" status="done"
        intro="Menus hanging from a trigger: row actions with icons, shortcuts and a danger zone; a grouped menu with a user header and labels; single selection with a check that updates the trigger; and column multi-selection that stays open on press. Brand popover, closing on outside click or Esc." />

      <Variant title="Row actions"
        desc="A row's “…” menu: icons on the left, mono shortcuts on the right, separators and a destructive item at the end. Press an action and you will see the echo below."
        code={CODE_DD}>
        <RowActions />
      </Variant>

      <Variant title="Grouped with header"
        desc="A header with the user, sections under mono labels and separators; sign-out in red. The trigger shows the avatar and the chevron rotates on open.">
        <Grouped />
      </Variant>

      <Variant title="Single selection"
        desc="A menu-style select: the active value carries a check and, when choosing another, the menu closes and the trigger updates.">
        <SingleSelect />
      </Variant>

      <Variant title="Multi-selection"
        desc="Checkboxes to toggle columns; the menu stays open while you check, and the trigger counter shows how many are visible."
        code={CODE_MULTI}>
        <MultiSelect />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['dropdowns'] = DropdownsSection;
})();
