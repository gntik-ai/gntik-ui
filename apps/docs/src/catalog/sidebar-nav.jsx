/* ============================================================================
   Gntik UI · sidebar-nav.jsx — product sidebar ("Navigation" group).
   The full app sidebar, able to collapse to an icon rail. Different from
   vertical-nav (in-content page nav) and from app-shell (which shows it
   mounted). Here it lives on its own, with a live toggle.
   Brand chrome; active item with accent bar. Neutral fixtures, tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, Wordmark, MusematicMark, useState } = window;

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

const NAV = [
  ['Operations', [['home', 'Home'], ['bot', 'Services', 24], ['net', 'Deployments'], ['coin', 'Costs']]],
  ['Control', [['activity', 'Runs', '1.2k'], ['shield', 'Policies', 3], ['list', 'Logs']]],
];

function SidebarItem({ icon, label, count, on, collapsed, onClick }) {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      className={"relative flex items-center h-9 rounded-lg text-[13px] transition-colors " +
        (collapsed ? 'w-9 justify-center mx-auto ' : 'w-full gap-2.5 px-2.5 ') +
        (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:bg-accent/45 hover:text-foreground')}>
      {on && <span className={"absolute top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary " + (collapsed ? 'left-0' : '-left-2.5')} />}
      <Icon name={icon} size={17} className="shrink-0" />
      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
      {!collapsed && count != null && (
        <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/16 text-primary' : 'bg-secondary text-muted-foreground')}>{count}</span>
      )}
    </button>
  );
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('Deployments');
  const [shut, setShut] = useState({});
  const toggleGroup = (g) => setShut(s => ({ ...s, [g]: !s[g] }));
  return (
    <div className="flex justify-center">
      <div className="flex flex-col rounded-xl border border-border bg-chrome shadow-sm overflow-hidden"
        style={{ width: collapsed ? 68 : 248, height: 432, transition: 'width .22s cubic-bezier(.4,0,.2,1)' }}>
        {/* header */}
        <div className={"flex items-center h-14 shrink-0 border-b border-border/60 " + (collapsed ? 'justify-center px-0' : 'px-3 gap-2')}>
          {collapsed
            ? <span className="text-primary"><MusematicMark s={22} /></span>
            : <div className="flex-1 min-w-0"><Wordmark s={24} fs={16} /></div>}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} aria-label="Collapse" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
              <Icon name="chevronLeft" size={16} />
            </button>
          )}
        </div>
        {/* nav */}
        <nav className={"flex-1 overflow-y-auto py-3 flex flex-col gap-4 " + (collapsed ? 'px-3' : 'px-3')}>
          {NAV.map(([group, items]) => {
            const off = !collapsed && shut[group];
            return (
            <div key={group} className="flex flex-col gap-0.5">
              {collapsed
                ? <div className="mx-auto mb-1 h-px w-5 bg-border/70" />
                : <button onClick={() => toggleGroup(group)} className="group flex items-center justify-between px-2.5 py-1 mb-0.5 rounded-md select-none hover:bg-accent/40 transition-colors">
                    <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/70 group-hover:text-muted-foreground">{group}</span>
                    <Icon name="chevron" size={12} className={"text-muted-foreground/60 transition-transform " + (off ? '-rotate-90' : '')} />
                  </button>}
              {!off && items.map(([ic, l, n]) => (
                <SidebarItem key={l} icon={ic} label={l} count={n} on={active === l} collapsed={collapsed} onClick={() => setActive(l)} />
              ))}
            </div>
          );})}
        </nav>
        {/* footer */}
        <div className={"shrink-0 border-t border-border/60 py-2.5 " + (collapsed ? 'px-3' : 'px-3')}>
          {collapsed ? (
            <button onClick={() => setCollapsed(false)} aria-label="Expand" className="grid size-9 mx-auto place-items-center rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
              <Icon name="chevronRight" size={16} />
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 h-10 px-2.5 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-[7px] shrink-0 rounded-full bg-primary" />
                <span className="text-[12px] font-semibold text-foreground truncate">Control plane</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">99.98%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CODE = `// Collapsible sidebar — icon rail (animated width) + collapsible groups
const [collapsed, setCollapsed] = useState(false);   // rail vs. expanded
const [shut, setShut] = useState({});                // collapsed groups

<aside className="flex flex-col border-r border-border bg-chrome"
  style={{ width: collapsed ? 68 : 248, transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>
  <Header collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
  <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
    {groups.map((g) => {
      const off = !collapsed && shut[g.name];
      return (
      <div key={g.name} className="flex flex-col gap-0.5">
        {/* group header = button with a chevron that rotates on collapse */}
        {!collapsed && (
          <button onClick={() => setShut(s => ({ ...s, [g.name]: !s[g.name] }))}
            className="group flex items-center justify-between px-2.5 py-1 rounded-md hover:bg-accent/40">
            <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/70">{g.name}</span>
            <ChevronDown className={"size-3 text-muted-foreground/60 transition-transform " + (off ? "-rotate-90" : "")} />
          </button>
        )}
        {!off && g.items.map((it) => (
          <button key={it.id} onClick={() => setActive(it.id)} title={collapsed ? it.label : undefined}
            className={"relative flex items-center h-9 rounded-lg text-[13px] transition-colors " +
              (collapsed ? "w-9 justify-center mx-auto " : "w-full gap-2.5 px-2.5 ") +
              (active === it.id ? "bg-accent text-accent-foreground font-semibold"
                                : "text-muted-foreground font-medium hover:bg-accent/45 hover:text-foreground")}>
            {active === it.id && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-primary" />}
            <it.Icon className="size-[17px] shrink-0" />
            {!collapsed && <span className="flex-1 text-left truncate">{it.label}</span>}
          </button>
        ))}
      </div>
    );})}
  </nav>
</aside>`;

function SidebarNavSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Sidebar navigation" status="done"
        intro="The product sidebar, with two kinds of collapse: to an icon rail (reclaims width) and per group (click the header to fold its items, with a rotating chevron — the same pattern as the app shell). Same chrome and brand green; the active item keeps the accent bar on the left and, in rail mode, each item shows its label as a tooltip." />

      <Variant title="Rail + collapsible groups"
        desc="Click the header chevron to collapse to 68px; group headers fold their items (rotating chevron), just like in the app shell."
        code={CODE}>
        <Sidebar />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['sidebar-nav'] = SidebarNavSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
