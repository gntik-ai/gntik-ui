/* ============================================================================
   Gntik UI · tooltips.jsx — tooltips ("Overlays" group).
   The ephemeral hint shown on hover or keyboard focus.
   Canonical: inverted solid (bg-foreground) for short labels; a "rich"
   variant on bg-popover for multi-line content. Positions on all 4 sides,
   arrow, open delay and focus support. Neutral fixtures.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef } = window;

const Variant = ({ title, desc, code, surface = 'dots', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-5 sm:p-7"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── Solid tooltip (canonical) ───────────────────────────────────────────── */
const WRAP = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
};
const ARROW = {
  top:    'left-1/2 top-full -translate-x-1/2 -mt-1',
  bottom: 'left-1/2 bottom-full -translate-x-1/2 -mb-1',
  left:   'top-1/2 left-full -translate-y-1/2 -ml-1',
  right:  'top-1/2 right-full -translate-y-1/2 -mr-1',
};

function useHoverIntent(delay = 130) {
  const [open, setOpen] = useState(false);
  const t = useRef(null);
  const show = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(t.current); setOpen(false); };
  return [open, { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide }];
}

function Tooltip({ label, kbd, side = 'top', delay = 130, children }) {
  const [open, bind] = useHoverIntent(delay);
  return (
    <span className="relative inline-flex" {...bind}>
      {children}
      <span role="tooltip"
        className={"pointer-events-none absolute z-30 flex items-center whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[12px] font-medium text-background shadow-md transition-all duration-150 " +
          WRAP[side] + (open ? ' opacity-100 scale-100' : ' opacity-0 scale-95')}>
        {label}
        {kbd && <span className="ml-1.5 rounded bg-background/20 px-1 py-[1px] font-mono text-[10px] tracking-wide text-background/80">{kbd}</span>}
        <span className={"absolute size-2 rotate-45 rounded-[1px] bg-foreground " + ARROW[side]} />
      </span>
    </span>
  );
}

/* ── Rich tooltip (card on bg-popover) ──────────────────────────────────── */
function RichTooltip({ side = 'top', width = 256, delay = 130, children, render }) {
  const [open, bind] = useHoverIntent(delay);
  return (
    <span className="relative inline-flex" {...bind}>
      {children}
      <span role="tooltip" style={{ width }}
        className={"pointer-events-none absolute z-30 rounded-lg border border-border bg-popover p-3 text-left shadow-lg transition-all duration-150 " +
          WRAP[side] + (open ? ' opacity-100 scale-100' : ' opacity-0 scale-95')}>
        {render}
        <span className={"absolute size-2 rotate-45 rounded-[1px] border-b border-r border-border bg-popover " + ARROW[side]} />
      </span>
    </span>
  );
}

/* reused triggers */
const Chip = ({ children }) => (
  <span className="inline-flex h-9 cursor-default items-center rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm">{children}</span>
);
const IconBtn = ({ name, danger }) => (
  <button type="button"
    className={"grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground " +
      (danger ? 'hover:border-destructive/40 hover:text-destructive' : 'hover:border-primary/40')}>
    <Icon name={name} size={16} />
  </button>
);

/* ── 1 · POSITIONS ───────────────────────────────────────────────────────── */
function Positions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      <Tooltip side="top" label="Above"><Chip>Top</Chip></Tooltip>
      <Tooltip side="right" label="To the right"><Chip>Right</Chip></Tooltip>
      <Tooltip side="bottom" label="Below"><Chip>Bottom</Chip></Tooltip>
      <Tooltip side="left" label="To the left"><Chip>Left</Chip></Tooltip>
    </div>
  );
}

/* ── 2 · ICON TOOLBAR ───────────────────────────────────────────────────── */
function IconToolbar() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-sm">
        <Tooltip label="Search" kbd="⌘K"><IconBtn name="search" /></Tooltip>
        <Tooltip label="Pause service"><IconBtn name="pause" /></Tooltip>
        <Tooltip label="Retry run"><IconBtn name="refresh" /></Tooltip>
        <Tooltip label="Download logs"><IconBtn name="download" /></Tooltip>
        <span className="mx-0.5 h-5 w-px bg-border" />
        <Tooltip label="Configure"><IconBtn name="settings" /></Tooltip>
        <Tooltip label="Delete"><IconBtn name="trash" danger /></Tooltip>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground/80">every icon button carries its label · hover or use Tab</p>
    </div>
  );
}

/* ── 3 · RICH TOOLTIP ───────────────────────────────────────────────────── */
function RichDemo() {
  const richContent = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] font-semibold tracking-tight text-foreground">Cost per 1k requests</span>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Weighted average of compute + egress for the service in the selected window, before volume discounts.
      </p>
      <div className="mt-2 flex items-center gap-1.5 border-t border-border/70 pt-2 font-mono text-[11px] text-muted-foreground">
        <Icon name="refresh" size={12} />Recalculated every hour
      </div>
    </>
  );
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="flex items-end gap-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Cost / 1k req</span>
            <RichTooltip render={richContent}>
              <button type="button" aria-label="More information" className="grid size-[18px] place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Icon name="info" size={14} />
              </button>
            </RichTooltip>
          </div>
          <div className="mt-1 font-sans text-[28px] font-bold tracking-tight text-foreground tabular-nums">$0.0184</div>
        </div>
        <div className="opacity-90">
          <RichTooltip side="right" width={232} render={(
            <>
              <div className="text-[12.5px] font-semibold tracking-tight text-foreground">support-triage</div>
              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">Node 24 runtime · 14 active policies · eu-west region.</p>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-primary"><span className="size-1.5 rounded-full bg-primary" />Operational</div>
            </>
          )}>
            <span className="inline-flex cursor-default items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />support-triage
            </span>
          </RichTooltip>
        </div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground/80">the ⓘ and the chip open a card with title, description and meta</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_TT = `// Solid tooltip — hover + focus, open delay, arrow
function Tooltip({ label, side = "top", delay = 130, children }) {
  const [open, setOpen] = useState(false);
  const t = useRef(null);
  const show = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(t.current); setOpen(false); };
  const wrap = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];
  return (
    <span className="relative inline-flex"
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <span role="tooltip"
        className={"pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 " +
          "text-[12px] font-medium text-background shadow-md transition-all duration-150 " + wrap +
          (open ? " opacity-100 scale-100" : " opacity-0 scale-95")}>
        {label}
      </span>
    </span>
  );
}`;

const CODE_TOOL = `// Icon button with label + shortcut
<Tooltip label="Search" kbd="⌘K">
  <button className="grid size-9 place-items-center rounded-md border border-border bg-card
                     text-muted-foreground shadow-sm hover:text-foreground hover:border-primary/40">
    <SearchIcon />
  </button>
</Tooltip>`;

const CODE_RICH = `// Rich tooltip — card on bg-popover for multiple lines
<RichTooltip render={
  <>
    <div className="text-[12.5px] font-semibold text-foreground">Cost per 1k requests</div>
    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
      Weighted average of compute + egress for the service in the selected window.
    </p>
    <div className="mt-2 flex items-center gap-1.5 border-t border-border/70 pt-2
                    font-mono text-[11px] text-muted-foreground">
      <RefreshIcon /> Recalculated every hour
    </div>
  </>
}>
  <button aria-label="More information"
    className="grid size-[18px] place-items-center rounded-full text-muted-foreground
               hover:bg-secondary hover:text-foreground"><InfoIcon /></button>
</RichTooltip>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function TooltipsSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Tooltips" status="done"
        intro="The ephemeral hint: a short label that appears on hover or keyboard focus, without stealing focus or taking up layout. The canonical one is inverted solid (bg-foreground) for names and shortcuts; when something needs a multi-line explanation, the rich variant uses a card on bg-popover. Both open with a short delay, have an arrow and respond to Tab too — not just the mouse." />

      <Variant title="Positions"
        desc="The same tooltip placed above, to the right, below or to the left of the trigger. Opens after a ~130 ms delay with a subtle scale animation; the arrow always points at the element."
        code={CODE_TT}>
        <Positions />
      </Variant>

      <Variant title="Icon toolbar"
        desc="The most common use: an icon button doesn't explain itself, so each one carries its label. The first also adds a keyboard shortcut in a chip. Hover or navigate with Tab to see them."
        code={CODE_TOOL}>
        <IconToolbar />
      </Variant>

      <Variant title="Rich tooltip" surface="card"
        desc="When a label isn't enough: a card on bg-popover with title, description and a meta line. Ideal for explaining a metric behind an ⓘ or giving context about a resource on hover."
        code={CODE_RICH}>
        <RichDemo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tooltips'] = TooltipsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
