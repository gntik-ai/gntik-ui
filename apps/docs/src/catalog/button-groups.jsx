/* ============================================================================
   Gntik UI · button-groups.jsx — grouped buttons ("Elements" group).
   Segmented with counters (status filter), joined buttons (view switch +
   zoom stepper), split button with attached menu, and icon bar.
   Shared borders, rounding only on the ends. Tokens only.
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

/* ── 1 · SEGMENTED with counters ─────────────────────────────────────────── */
const FLEET_FILTERS = [['all', 'All', 12], ['active', 'Active', 9], ['paused', 'Paused', 3]];
function Segmented() {
  const [sel, setSel] = useState('all');
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card shadow-sm">
        {FLEET_FILTERS.map(([id, label, n]) => {
          const on = sel === id;
          return (
            <button key={id} onClick={() => setSel(id)}
              className={"inline-flex items-center gap-2 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors " +
                (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {label}<span className={"font-mono text-[10.5px] " + (on ? 'text-foreground/70' : 'text-muted-foreground/70')}>{n}</span>
            </button>
          );
        })}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">status filter · segmented container</span>
    </div>
  );
}

/* ── 2 · JOINED BUTTONS + stepper ────────────────────────────────────────── */
const VIEWS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month']];
function Joined() {
  const [view, setView] = useState('week');
  const [zoom, setZoom] = useState(100);
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {VIEWS.map(([id, label]) => {
          const on = view === id;
          return <button key={id} onClick={() => setView(id)}
            className={"h-9 px-4 text-[13px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground')}>{label}</button>;
        })}
      </div>
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        <button onClick={() => setZoom(z => Math.max(50, z - 10))} aria-label="Zoom out" className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name="minus" size={16} /></button>
        <span className="grid h-9 w-16 place-items-center font-mono text-[12.5px] font-medium text-foreground">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 10))} aria-label="Zoom in" className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name="plus" size={16} /></button>
      </div>
    </div>
  );
}

/* ── 3 · SPLIT BUTTON ────────────────────────────────────────────────────── */
const DEPLOY_OPTS = [['bolt', 'Deploy now'], ['clock', 'Schedule deploy'], ['copy', 'Duplicate config'], ['code', 'Deploy from YAML']];
function SplitButton() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('Deploy now');
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={ref} className="relative inline-flex">
        <button className="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-3 rounded-l-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm transition-colors hover:bg-primary/90"><Icon name="bolt" size={15} />{label}</button>
        <button onClick={() => setOpen(o => !o)} aria-label="More deploy options" aria-expanded={open}
          className="grid size-9 place-items-center rounded-r-lg border-l border-primary-foreground/25 bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Icon name="chevron" size={15} className={"transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            {DEPLOY_OPTS.map(([ic, l]) => (
              <button key={l} onClick={() => { setLabel(l); setOpen(false); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-secondary/70"><Icon name={ic} size={15} className="text-muted-foreground" />{l}</button>
            ))}
          </div>
        )}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">main action + attached menu</span>
    </div>
  );
}

/* ── 4 · ICON GROUP (toolbar) ────────────────────────────────────────────── */
const VIEW_ICONS = [['list', 'list', 'List'], ['grid', 'grid', 'Grid'], ['layout', 'board', 'Board']];
function IconGroup() {
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {VIEW_ICONS.map(([ic, id, label]) => {
          const on = view === id;
          return <button key={id} onClick={() => setView(id)} aria-label={label} title={label}
            className={"grid size-9 place-items-center transition-colors " + (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground')}><Icon name={ic} size={16} /></button>;
        })}
      </div>
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
        {[['refresh', 'Refresh'], ['pause', 'Pause'], ['download', 'Export'], ['dot3', 'More']].map(([ic, label]) => (
          <button key={ic} aria-label={label} title={label} className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"><Icon name={ic} size={16} /></button>
        ))}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SEG = `// Segmented — container; the active one sits on bg-secondary with a shadow
<div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card shadow-sm">
  {filters.map((f) => (
    <button key={f.id} onClick={() => setSel(f.id)}
      className={"inline-flex items-center gap-2 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors " +
        (sel === f.id ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {f.label}<span className="font-mono text-[10.5px] opacity-70">{f.n}</span>
    </button>
  ))}
</div>`;

const CODE_JOINED = `// Joined buttons — shared border with divide-x; rounding on the container
<div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border">
  {views.map((v) => (
    <button key={v.id} onClick={() => setView(v.id)}
      className={"h-9 px-4 text-[13px] font-medium transition-colors " +
        (view === v.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}>
      {v.label}
    </button>
  ))}
</div>`;

const CODE_SPLIT = `// Split button — action + attached chevron that opens the menu
<div ref={ref} className="relative inline-flex">
  <button className="h-9 pl-3.5 pr-3 rounded-l-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm hover:bg-primary/90">
    Deploy now
  </button>
  <button onClick={() => setOpen(o => !o)} aria-label="More options"
    className="grid size-9 place-items-center rounded-r-lg border-l border-primary-foreground/25 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
    <ChevronIcon />
  </button>
  {open && <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">…</div>}
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ButtonGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Button groups" status="done"
        intro="Grouped buttons for related actions: the segmented container for filtering a list, joined buttons to switch views or adjust zoom, the split button with its attached menu, and the icon bar. Shared borders with divide-x and rounded corners only on the ends." />

      <Variant title="Segmented with counters"
        desc="Single selection inside a container; the active option moves to bg-secondary with a shadow. A mono counter accompanies each option."
        code={CODE_SEG}>
        <Segmented />
      </Variant>

      <Variant title="Joined buttons"
        desc="The classic group: a single border, divide-x separators and rounding only on the first and last button. Works as a view toggle and as a stepper."
        code={CODE_JOINED}>
        <Joined />
      </Variant>

      <Variant title="Split button"
        desc="A main action with an attached chevron that opens alternatives. Press the chevron to change the action; it closes on outside click or Esc."
        code={CODE_SPLIT}>
        <SplitButton />
      </Variant>

      <Variant title="Icon group"
        desc="Icon-only bar for views and toolbar actions. The active one is highlighted; the rest are standalone actions. Every button has an aria-label.">
        <IconGroup />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['button-groups'] = ButtonGroupsSection;
})();
