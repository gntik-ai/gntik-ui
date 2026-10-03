/* ============================================================================
   Gntik UI · vertical-nav.jsx — in-page side navigation ("Navigation" group).
   The nav that lives inside the content (settings, resource detail): simple
   with icons, with expandable sub-sections, and with counters. Active item
   with an accent bar on the left, like the shell sidebar. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 flex justify-center">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const Row = ({ icon, label, on, count, onClick }) => (
  <button onClick={onClick}
    className={"relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] text-left transition-colors " +
      (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground')}>
    {on && <span className="absolute left-[-12px] top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
    {icon && <Icon name={icon} size={16} className="shrink-0" />}
    <span className="flex-1 truncate">{label}</span>
    {count != null && <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/16 text-primary' : 'bg-secondary text-muted-foreground')}>{count}</span>}
  </button>
);

/* ── 1 · SIMPLE with icons ───────────────────────────────────────────────── */
const SIMPLE = [['settings', 'General'], ['user', 'Profile'], ['shield', 'Security'], ['bell', 'Notifications'], ['coin', 'Billing'], ['net', 'Integrations']];
function Simple() {
  const [active, setActive] = useState('General');
  return (
    <nav className="w-60 flex flex-col gap-0.5">
      {SIMPLE.map(([ic, l]) => <Row key={l} icon={ic} label={l} on={active === l} onClick={() => setActive(l)} />)}
    </nav>
  );
}

/* ── 2 · WITH SUB-SECTIONS (accordion) ───────────────────────────────────── */
const GROUPS = [
  ['Workspace', 'fleet', [['General', 'settings'], ['Members', 'users'], ['Billing', 'coin']]],
  ['Services', 'bot', [['Defaults', 'cog'], ['Policies', 'shield'], ['Secrets', 'lock']]],
  ['Advanced', 'sliders', [['API keys', 'code'], ['Webhooks', 'net']]],
];
function Nested() {
  const [open, setOpen] = useState({ Workspace: true, Services: true });
  const [active, setActive] = useState('Members');
  const toggle = g => setOpen(o => ({ ...o, [g]: !o[g] }));
  return (
    <nav className="w-64 flex flex-col gap-1.5">
      {GROUPS.map(([g, ic, items]) => {
        const expanded = !!open[g];
        return (
          <div key={g}>
            <button onClick={() => toggle(g)}
              className="flex w-full items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold text-foreground transition-colors hover:bg-accent/40">
              <Icon name={ic} size={16} className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-left">{g}</span>
              <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (expanded ? '' : '-rotate-90')} />
            </button>
            {expanded && (
              <div className="mt-0.5 ml-[18px] pl-3 border-l border-border flex flex-col gap-0.5">
                {items.map(([l]) => {
                  const on = active === l;
                  return (
                    <button key={l} onClick={() => setActive(l)}
                      className={"h-8 px-2.5 rounded-md text-[12.5px] text-left transition-colors " + (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:text-foreground hover:bg-accent/40')}>{l}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ── 3 · WITH COUNTERS ───────────────────────────────────────────────────── */
const COUNTS = [['inbox', 'All', 248], ['activity', 'Active', 9], ['pause', 'Paused', 3], ['alert', 'With issues', 2], ['clock', 'Scheduled', 5]];
function Counters() {
  const [active, setActive] = useState('All');
  return (
    <nav className="w-60 flex flex-col gap-0.5">
      <div className="px-2.5 pb-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/70">Deployments</div>
      {COUNTS.map(([ic, l, n]) => <Row key={l} icon={ic} label={l} count={n} on={active === l} onClick={() => setActive(l)} />)}
    </nav>
  );
}

const CODE_SIMPLE = `// Vertical nav — accent bar on the left of the active item
<nav className="w-60 flex flex-col gap-0.5">
  {items.map(({ id, label, Icon, count }) => {
    const on = active === id;
    return (
      <button key={id} onClick={() => setActive(id)}
        className={"relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] text-left transition-colors " +
          (on ? "bg-accent text-accent-foreground font-semibold"
              : "text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground")}>
        {on && <span className="absolute -left-3 inset-y-1.5 w-[3px] rounded-r bg-primary" />}
        <Icon className="size-4" />
        <span className="flex-1 truncate">{label}</span>
        {count != null && (
          <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " +
            (on ? "bg-primary/16 text-primary" : "bg-secondary text-muted-foreground")}>{count}</span>
        )}
      </button>
    );
  })}
</nav>`;

const CODE_NESTED = `// Sub-sections — collapsible group with children on a vertical guide
<button onClick={() => toggle(g)} className="flex w-full items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold hover:bg-accent/40">
  <Icon className="size-4 text-muted-foreground" /><span className="flex-1 text-left">{g}</span>
  <ChevronDown className={"size-3.5 text-muted-foreground transition-transform " + (open ? "" : "-rotate-90")} />
</button>
{open && (
  <div className="mt-0.5 ml-[18px] pl-3 border-l border-border flex flex-col gap-0.5">
    {children.map((c) => <SubItem key={c} active={active === c} … />)}
  </div>
)}`;

function VerticalNavSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Vertical navigation" status="done"
        intro="The navigation that lives inside the content —settings, list filters, resource detail—, not the app chrome. Simple with icons, with expandable sub-sections, and with counters. The active item carries the accent bar on the left, just like the sidebar." />

      <Variant title="Simple with icons"
        desc="The nav of a settings page: icon, label and accent bar on the active item. Click to switch sections."
        code={CODE_SIMPLE}>
        <Simple />
      </Variant>

      <Variant title="With sub-sections"
        desc="Collapsible groups with their children on a vertical guide. Open and close the groups; the active child is highlighted."
        code={CODE_NESTED}>
        <Nested />
      </Variant>

      <Variant title="With counters"
        desc="Deployment filters with the count on the right in mono; the active counter takes the brand green.">
        <Counters />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['vertical-nav'] = VerticalNavSection;
})();
