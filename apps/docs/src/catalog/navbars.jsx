/* ============================================================================
   Gntik UI · navbars.jsx — top bars ("Navigation" group).
   Product bar (horizontal nav + ⌘K + profile), search-centered bar, and a
   bar with an overflow menu ("More ▾") when there are many links.
   Brand chrome; the active link is bg-accent. Neutral fixtures, tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, Wordmark, useState, useRef, useClickOutside } = window;

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

const NavLink = ({ icon, label, on, onClick }) => (
  <button onClick={onClick}
    className={"inline-flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] transition-colors " +
      (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:text-foreground hover:bg-accent/45')}>
    {icon && <Icon name={icon} size={16} />}{label}
  </button>
);

const CmdK = () => (
  <button className="hidden sm:inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground">
    <Icon name="search" size={15} /><span className="text-[12.5px]">Search</span>
    <span className="font-mono text-[10.5px] font-semibold rounded border border-border px-1.5 py-0.5 leading-none">⌘K</span>
  </button>
);
const BellBtn = () => (
  <button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground">
    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" /><Icon name="bell" size={17} />
  </button>
);
const Avatar = () => <button aria-label="Profile" className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground text-[11.5px] font-bold">MR</button>;

/* ── 1 · PRODUCT BAR ────────────────────────────────────────────────────── */
const PRIMARY = [['home', 'Home'], ['bot', 'Services'], ['net', 'Deployments'], ['coin', 'Costs'], ['shield', 'Policies']];
function ProductBar() {
  const [active, setActive] = useState('Deployments');
  return (
    <div className="w-full rounded-xl border border-border bg-chrome shadow-sm">
      <div className="flex items-center gap-1 h-15 px-3" style={{ height: 60 }}>
        <div className="px-2 shrink-0"><Wordmark s={24} fs={16} /></div>
        <div className="mx-2 h-6 w-px bg-border/70 shrink-0" />
        <nav className="flex items-center gap-0.5 min-w-0 overflow-hidden">
          {PRIMARY.map(([ic, l]) => <NavLink key={l} icon={ic} label={l} on={active === l} onClick={() => setActive(l)} />)}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2 shrink-0"><CmdK /><BellBtn /><Avatar /></div>
      </div>
    </div>
  );
}

/* ── 2 · SEARCH-CENTERED ────────────────────────────────────────────────── */
function SearchBar() {
  const [q, setQ] = useState('');
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-4 h-15 px-4" style={{ height: 60 }}>
        <div className="shrink-0"><Wordmark s={24} fs={16} /></div>
        <label className="flex items-center gap-2.5 flex-1 min-w-0 h-10 px-3.5 rounded-lg border border-border bg-background/60 text-muted-foreground focus-within:border-ring/70 transition-colors">
          <Icon name="search" size={16} className="shrink-0" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services, runs, policies…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground/70" />
          {q
            ? <button onClick={() => setQ('')} className="grid place-items-center size-5 rounded text-muted-foreground hover:text-foreground"><Icon name="x" size={14} /></button>
            : <span className="font-mono text-[10.5px] font-semibold rounded border border-border px-1.5 py-0.5 leading-none">⌘K</span>}
        </label>
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold transition-colors hover:bg-primary/90"><Icon name="plus" size={15} />New deployment</button>
          <Avatar />
        </div>
      </div>
    </div>
  );
}

/* ── 3 · WITH OVERFLOW MENU ─────────────────────────────────────────────── */
const ALL = [['home', 'Home'], ['bot', 'Services'], ['net', 'Deployments'], ['coin', 'Costs'], ['shield', 'Policies'], ['line', 'Analytics'], ['flow', 'Workflows'], ['cog', 'Admin']];
function OverflowBar() {
  const VISIBLE = 4;
  const head = ALL.slice(0, VISIBLE), extra = ALL.slice(VISIBLE);
  const [active, setActive] = useState('Deployments');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const inExtra = extra.some(([, l]) => l === active);
  return (
    <div className="w-full rounded-xl border border-border bg-chrome shadow-sm">
      <div className="flex items-center gap-1 px-3" style={{ height: 60 }}>
        <div className="px-2 shrink-0"><Wordmark s={24} fs={16} /></div>
        <div className="mx-2 h-6 w-px bg-border/70 shrink-0" />
        <nav className="flex items-center gap-0.5">
          {head.map(([ic, l]) => <NavLink key={l} icon={ic} label={l} on={active === l} onClick={() => setActive(l)} />)}
          <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)} aria-expanded={open}
              className={"inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] transition-colors " + (inExtra ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:text-foreground hover:bg-accent/45')}>
              More<Icon name="chevron" size={14} className={"transition-transform " + (open ? 'rotate-180' : '')} />
            </button>
            {open && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-52 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
                {extra.map(([ic, l]) => (
                  <button key={l} onClick={() => { setActive(l); setOpen(false); }}
                    className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-secondary/70">
                    <Icon name={ic} size={15} className="text-muted-foreground" /><span className="flex-1">{l}</span>
                    {active === l && <Icon name="check" size={15} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2 shrink-0"><BellBtn /><Avatar /></div>
      </div>
    </div>
  );
}

/* ── 4 · MEGA MENU (panels on hover) ─────────────────────────────────────── */
const FEATURE = [
  ['Introduction', 'What the platform is and how it fits into your stack.'],
  ['Services', 'Create, version and deploy services from a template.'],
  ['Workflows', 'Orchestrate several services in a flow with steps and branches.'],
];
const RESOURCES = [
  ['net', 'Deployments', 'Everything you have deployed, its status and usage in one place.'],
  ['coin', 'Costs', 'Spend per service, budgets and alerts as they near the limit.'],
  ['shield', 'Policies', 'Governance rules: PII redaction, spend caps, allowlists.'],
  ['line', 'Analytics', 'Volume, p95 latency and usage trends by period.'],
  ['book', 'Knowledge', 'The sources and docs your team relies on.'],
  ['flask', 'Evaluation', 'Test sets and scorecards to validate every change before it ships.'],
];
const STATUS = [['inbox', 'Backlog'], ['clock', 'In progress'], ['check', 'Done']];
const MENUS = [
  { key: 'platform', label: 'Platform' },
  { key: 'resources', label: 'Resources' },
  { key: 'docs', label: 'Docs', href: '#' },
  { key: 'status', label: 'Status' },
];

const Trigger = ({ label, open, hasMenu, ...rest }) => (
  <button {...rest}
    className={"inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium transition-colors " +
      (open ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/45')}>
    {label}{hasMenu && <Icon name="chevron" size={14} className={"transition-transform " + (open ? 'rotate-180' : '')} />}
  </button>
);

function MegaBar() {
  const [open, setOpen] = useState(null);
  const closeT = useRef(null);
  const enter = (k) => { clearTimeout(closeT.current); setOpen(k); };
  const leave = () => { closeT.current = setTimeout(() => setOpen(null), 110); };

  const Panel = ({ k, w, children }) => open === k && (
    <div onMouseEnter={() => enter(k)} onMouseLeave={leave}
      className="absolute left-0 top-[calc(100%+10px)] z-50 rounded-xl border border-border bg-popover p-2.5 shadow-md"
      style={{ width: w, animation: 'mmIn .14s ease-out' }}>
      {children}
    </div>
  );
  const Row = ({ icon, title, desc, on }) => (
    <a className={"flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors hover:bg-secondary/70 " + (on ? 'bg-secondary/70' : '')}>
      {icon && <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon name={icon} size={16} /></span>}
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        {desc && <span className="block text-[12px] text-muted-foreground leading-snug mt-0.5">{desc}</span>}
      </span>
    </a>
  );

  return (
    <div className="w-full rounded-xl border border-border bg-chrome shadow-sm">
      <style>{`@keyframes mmIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
      <div className="flex items-center gap-1 px-3" style={{ height: 60 }}>
        <div className="px-2 shrink-0"><Wordmark s={24} fs={16} /></div>
        <div className="mx-2 h-6 w-px bg-border/70 shrink-0" />
        <nav className="flex items-center gap-0.5">
          {MENUS.map(m => (
            <div key={m.key} className="relative" onMouseEnter={() => m.href ? null : enter(m.key)} onMouseLeave={m.href ? null : leave}>
              <Trigger label={m.label} hasMenu={!m.href} open={open === m.key}
                onClick={() => m.href ? null : setOpen(o => o === m.key ? null : m.key)} />

              {m.key === 'platform' && (
                <Panel k="platform" w={520}>
                  <div className="grid gap-2.5" style={{ gridTemplateColumns: '.9fr 1.1fr' }}>
                    <a className="flex flex-col justify-end rounded-lg bg-primary p-5 text-primary-foreground cursor-pointer no-underline">
                      <Wordmark s={26} fs={17} />
                      <p className="text-[12.5px] leading-snug mt-3 text-primary-foreground/90">The platform to deploy, govern and observe your services.</p>
                    </a>
                    <div className="flex flex-col gap-0.5">
                      {FEATURE.map(([t, d]) => <Row key={t} title={t} desc={d} />)}
                    </div>
                  </div>
                </Panel>
              )}

              {m.key === 'resources' && (
                <Panel k="resources" w={600}>
                  <div className="grid grid-cols-2 gap-1">
                    {RESOURCES.map(([ic, t, d]) => <Row key={t} icon={ic} title={t} desc={d} />)}
                  </div>
                </Panel>
              )}

              {m.key === 'status' && (
                <Panel k="status" w={220}>
                  <div className="flex flex-col gap-0.5">
                    {STATUS.map(([ic, t]) => (
                      <a key={t} className="flex items-center gap-2.5 rounded-lg px-2.5 h-[38px] text-[13px] text-foreground cursor-pointer transition-colors hover:bg-secondary/70">
                        <Icon name={ic} size={16} className="text-muted-foreground" />{t}
                      </a>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2 shrink-0"><CmdK /><Avatar /></div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_BAR = `// Product navbar — chrome + horizontal nav + ⌘K + profile
<header className="flex items-center gap-1 h-[60px] px-3 rounded-xl border border-border bg-chrome shadow-sm">
  <Wordmark />
  <span className="mx-2 h-6 w-px bg-border/70" />
  <nav className="flex items-center gap-0.5">
    {nav.map(({ id, label, Icon }) => (
      <button key={id} onClick={() => setActive(id)}
        className={"inline-flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] transition-colors " +
          (active === id ? "bg-accent text-accent-foreground font-semibold"
                         : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/45")}>
        <Icon className="size-4" />{label}
      </button>
    ))}
  </nav>
  <div className="flex-1" />
  <CmdKButton /> <NotificationsButton /> <Avatar />
</header>`;

const CODE_OVERFLOW = `// Overflow — links that don't fit fold into a "More ▾" menu
const VISIBLE = 4;
const head = links.slice(0, VISIBLE), extra = links.slice(VISIBLE);
// … head as buttons; extra inside a Dropdown that closes on outside click (useClickOutside)`;

const CODE_MEGA = `// Mega menu — triggers that open a panel on hover (delayed close)
const [open, setOpen] = useState(null);
const closeT = useRef(null);
const enter = k => { clearTimeout(closeT.current); setOpen(k); };
const leave = () => { closeT.current = setTimeout(() => setOpen(null), 110); };

<nav className="flex items-center gap-0.5">
  {menus.map(m => (
    <div key={m.key} className="relative"
      onMouseEnter={() => enter(m.key)} onMouseLeave={leave}>
      <button className={\`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium
        \${open === m.key ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/45"}\`}>
        {m.label}<ChevronDown className={\`size-3.5 \${open === m.key ? "rotate-180" : ""}\`} />
      </button>
      {open === m.key && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 rounded-xl border border-border
                        bg-popover p-2.5 shadow-md" style={{ width: m.width }}>
          {/* featured card (bg-primary) · link grid · icon list */}
        </div>
      )}
    </div>
  ))}
</nav>`;

function NavbarsSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Navbars" status="done"
        intro="Top bars for horizontal navigation layouts: the product bar with its nav, ⌘K and profile; the bar centered on a search field with a CTA; and the bar that folds extra links into a “More” menu. Brand chrome with the active link in bg-accent." />

      <Variant title="Product bar"
        desc="Wordmark, horizontal navigation with active state, and the right-hand cluster (⌘K, notifications, profile). Click a link to change the active one."
        code={CODE_BAR}>
        <ProductBar />
      </Variant>

      <Variant title="Search-centered"
        desc="When search is the main action: an input that takes the center with its ⌘K shortcut, and the primary action on the right. Type to see the clear button.">
        <SearchBar />
      </Variant>

      <Variant title="Mega menu (panels on hover)"
        desc="For rich navigation: each section opens a panel on hover — a featured card, a grid of resources with descriptions, or an icon list. “Docs” is a plain link with no panel. Hover over it."
        code={CODE_MEGA}>
        <MegaBar />
      </Variant>

      <Variant title="With overflow menu"
        desc="For many sections: the first links stay visible and the rest fold into “More ▾”. If the active link lives inside the menu, the trigger is highlighted."
        code={CODE_OVERFLOW}>
        <OverflowBar />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['navbars'] = NavbarsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
