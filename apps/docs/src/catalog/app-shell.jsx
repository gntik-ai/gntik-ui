/* ============================================================================
   Gntik UI · app-shell.jsx — the shared chrome (sidebar + topbar + header).
   Interactive React version of the approved block (blocks/Shell.html):
   collapsible groups · dropdowns (theme / notifications / profile) · table.
   ============================================================================ */
(function () {
const { Icon, Wordmark, SectionHead, ScaleFrame, CodeBlock, useState, useRef, useClickOutside } = window;

const NAV = [
  ['Workspace', [['home', 'Home'], ['chat', 'Messages'], ['store', 'Marketplace']]],
  ['Build', [['bot', 'Services'], ['book', 'Docs'], ['net', 'Deployments', true], ['flow', 'Workflows'], ['flow', 'Workflow Studio'], ['flask', 'Testing']]],
  ['Insights', [['line', 'Analytics'], ['coin', 'Costs']]],
  ['Governance', [['shield', 'Policies'], ['finger', 'Trust'], ['finger', 'Trust Workbench']]],
  ['Operations', [['activity', 'Operator']]],
  ['System', [['cog', 'Admin'], ['settings', 'Settings']]],
];
const ROWS = [
  ['support-triage', 'ok', '1,284', '$4.21 / $6.00', '99.9%', '2m'],
  ['invoice-ocr', 'ok', '842', '$1.94 / $3.00', '99.7%', '5m'],
  ['contract-summarize', 'warn', '311', '$1.46 / $1.50', '98.2%', '1m'],
  ['nightly-recon', 'ok', '96', '$0.62 / $2.00', '100%', '3h'],
  ['lead-enrich', 'ok', '58', '$0.18 / $1.00', '99.4%', '12m'],
];
const THEMES = [['', 'Light'], ['dark', 'Dark'], ['high_contrast', 'High contrast']];
const WORKSPACES = [
  ['AC', 'Acme Industries', 'production · eu-west-1', true],
  ['AC', 'Acme Industries', 'staging · eu-west-1'],
  ['NB', 'Northbeam Labs', 'production · us-east-1'],
  ['VG', 'Vega Robotics', 'production · eu-central-1'],
];

function Menu({ children, width = 188, align = 'right' }) {
  return (
    <div className={"absolute top-[calc(100%+8px)] " + (align === 'right' ? 'right-0' : 'left-0') + " bg-popover border border-border rounded-[10px] shadow-md p-1.5 z-50"} style={{ minWidth: width }}>
      {children}
    </div>);
}
const MItem = ({ children, danger, onClick }) => (
  <div onClick={onClick} className={"flex items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-[13px] cursor-pointer hover:bg-secondary/70 " + (danger ? 'text-destructive' : 'text-foreground')}>{children}</div>
);
const MLabel = ({ children }) => <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground px-2.5 pt-1.5 pb-1.5">{children}</div>;
const MSep = () => <div className="h-px bg-border my-1.5" />;

function AppShellDemo() {
  const [collapsed, setCollapsed] = useState({});
  const [menu, setMenu] = useState(null);
  const [wsOpen, setWsOpen] = useState(false);
  const rightRef = useRef(null);
  const wsRef = useRef(null);
  useClickOutside(rightRef, () => setMenu(null), menu !== null);
  useClickOutside(wsRef, () => setWsOpen(false), wsOpen);
  const curTheme = (typeof document !== 'undefined' && document.documentElement.className) || '';
  const toggle = (g) => setCollapsed(c => ({ ...c, [g]: !c[g] }));
  const pick = (k) => setMenu(m => m === k ? null : k);
  const setTheme = (t) => { window.__setTheme ? window.__setTheme(t) : (document.documentElement.className = t); setMenu(null); };

  return (
    <div className="h-[764px] flex overflow-hidden rounded-xl border border-border bg-background font-sans text-foreground">

      {/* ── SIDEBAR ── */}
      <aside className="w-[258px] shrink-0 flex flex-col bg-chrome border-r border-border/60">
        <div className="px-4 pt-[18px] pb-3.5"><Wordmark s={26} fs={17} /></div>
        <nav className="flex-1 overflow-y-auto px-3 pb-3.5 pt-1 flex flex-col gap-3.5">
          {NAV.map(([group, items]) => {
            const off = collapsed[group];
            return (
              <div key={group}>
                <div onClick={() => toggle(group)} className="flex items-center justify-between px-2.5 py-1 mb-1 font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/75 cursor-pointer select-none rounded-md hover:bg-accent/40 hover:text-muted-foreground">
                  <span>{group}</span>
                  <Icon name="chevron" size={12} className={"opacity-60 transition-transform " + (off ? '-rotate-90' : '')} />
                </div>
                {!off && <div className="flex flex-col gap-0.5">
                  {items.map(([ic, label, active], i) => (
                    <a key={i} className={"relative flex items-center gap-2.5 h-[34px] px-2.5 rounded-lg text-[13px] cursor-pointer " + (active ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground font-medium hover:bg-accent/55 hover:text-foreground')}>
                      {active && <span className="absolute left-[-12px] top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
                      <Icon name={ic} size={16} />{label}
                    </a>
                  ))}
                </div>}
              </div>
            );
          })}
        </nav>
        <div className="m-2.5 p-2.5 rounded-[10px] bg-card border border-border">
          <div className="flex items-center gap-2"><span className="w-[7px] h-[7px] rounded-full bg-primary" /><span className="font-sans font-semibold text-[11.5px]">Control plane</span></div>
          <div className="font-mono text-[9.5px] text-muted-foreground mt-1">Operational · 99.98%</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 flex items-center gap-3.5 px-5 bg-chrome border-b border-border/60">
          {/* ── Workspace switcher (two-line layout) ── */}
          <div ref={wsRef} className="relative shrink-0">
            <button onClick={() => setWsOpen(o => !o)} className="flex items-center gap-2.5 h-11 pl-1.5 pr-2.5 rounded-[10px] border border-border bg-card hover:bg-secondary/50 transition-colors">
              <span className="w-[30px] h-[30px] rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-[11px] shrink-0">AC</span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[13px] font-semibold text-foreground">Acme Industries</span>
                <span className="font-mono text-[10px] text-muted-foreground mt-px">production · eu-west-1</span>
              </span>
              <Icon name="chevron" size={14} className={"text-muted-foreground ml-1 transition-transform " + (wsOpen ? 'rotate-180' : '')} />
            </button>
            {wsOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 bg-popover border border-border rounded-[10px] shadow-md p-1.5 z-50" style={{ minWidth: 252 }}>
                <MLabel>Switch workspace</MLabel>
                {WORKSPACES.map(([ab, nm, sub, act], i) => (
                  <div key={i} onClick={() => setWsOpen(false)} className="flex items-center gap-2.5 h-[44px] px-2 rounded-[7px] cursor-pointer hover:bg-secondary/70">
                    <span className={"w-[30px] h-[30px] rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 " + (act ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground')}>{ab}</span>
                    <span className="flex flex-col leading-tight min-w-0">
                      <span className="text-[12.5px] font-medium text-foreground truncate">{nm}</span>
                      <span className="font-mono text-[9.5px] text-muted-foreground truncate">{sub}</span>
                    </span>
                    {act && <Icon name="check" size={15} className="ml-auto text-primary shrink-0" />}
                  </div>
                ))}
                <MSep />
                <MItem onClick={() => setWsOpen(false)}><Icon name="plus" size={15} />New workspace</MItem>
              </div>
            )}
          </div>

          {/* ── Tenant (mono) + breadcrumb, grouped together ── */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-[12.5px] text-foreground/90">acme-industries</span>
            <Icon name="chevronRight" size={14} className="text-muted-foreground/40 shrink-0" />
            <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <span>Operation</span><span className="opacity-50">/</span><span className="text-foreground font-medium">Deployments</span>
            </div>
          </div>

          <div className="flex-1" />

          <div ref={rightRef} className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-muted-foreground"><span className="w-[7px] h-[7px] rounded-full bg-primary" style={{ boxShadow: '0 0 0 3px hsl(var(--primary)/.18)' }} />LIVE</div>
            <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-card text-muted-foreground cursor-pointer">
              <span className="font-mono text-[10.5px] font-semibold">⌘K</span>
            </div>

            {/* theme */}
            <div className="relative">
              <button onClick={() => pick('theme')} className="w-[34px] h-[34px] rounded-lg border border-border bg-card text-muted-foreground flex items-center justify-center hover:text-foreground"><Icon name="moon" size={16} /></button>
              {menu === 'theme' && <Menu width={170}><MLabel>Theme</MLabel>
                {THEMES.map(([v, l]) => <MItem key={v} onClick={() => setTheme(v)}>{l}{curTheme === v && <Icon name="check" size={15} className="ml-auto text-primary" />}</MItem>)}
              </Menu>}
            </div>

            {/* notifications */}
            <div className="relative">
              <button onClick={() => pick('notif')} className="relative w-[34px] h-[34px] rounded-lg border border-border bg-card text-muted-foreground flex items-center justify-center hover:text-foreground">
                <span className="absolute top-[-3px] right-[-3px] w-2 h-2 rounded-full bg-destructive border-2 border-chrome" /><Icon name="bell" size={16} />
              </button>
              {menu === 'notif' && <Menu width={288}><MLabel>Notifications</MLabel>
                {[['var(--warning)', <span><b>contract-summarize</b> reached 97% of daily budget</span>, '2m ago · throttled to 1 req/min'],
                  ['var(--primary)', <span>New policy <b>pii-redaction</b> activated</span>, '18m ago · by marta@acme.co'],
                  ['var(--info)', <span>Service <b>lead-enrich</b> went idle</span>, '1h ago']].map(([c, t, s], i) => (
                  <div key={i} className="flex gap-2.5 px-2.5 py-2 rounded-[7px] cursor-pointer hover:bg-secondary/60">
                    <span className="w-[7px] h-[7px] rounded-full mt-1.5 shrink-0" style={{ background: `hsl(${c})` }} />
                    <div><div className="text-[12.5px] leading-snug">{t}</div><div className="font-mono text-[10px] text-muted-foreground mt-0.5">{s}</div></div>
                  </div>
                ))}
                <MSep /><MItem onClick={() => setMenu(null)}><span className="mx-auto text-primary font-semibold">View all</span></MItem>
              </Menu>}
            </div>

            {/* user */}
            <div className="relative">
              <button onClick={() => pick('user')} className="w-[34px] h-[34px] rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-[12px]">MR</button>
              {menu === 'user' && <Menu width={210}>
                <div className="flex items-center gap-2.5 px-2.5 py-2"><span className="w-[34px] h-[34px] rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-[12px]">MR</span><div><div className="text-[13px] font-semibold">Marta Ríos</div><div className="font-mono text-[10.5px] text-muted-foreground">marta@acme.co</div></div></div>
                <MSep /><MItem onClick={() => setMenu(null)}><Icon name="user" size={15} />Profile</MItem><MItem onClick={() => setMenu(null)}><Icon name="settings" size={15} />Settings</MItem>
                <MSep /><MItem danger onClick={() => setMenu(null)}><Icon name="logout" size={15} />Sign out</MItem>
              </Menu>}
            </div>
          </div>
        </header>

        {/* page header */}
        <div className="flex items-end justify-between px-[26px] pt-[22px] pb-4">
          <div><h1 className="text-2xl font-bold tracking-tight">Deployments</h1><div className="text-[13px] text-muted-foreground mt-1">12 services · 3 namespaces · eu-west-1</div></div>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold"><Icon name="sliders" size={15} />Filters</button>
            <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold"><Icon name="plus" size={15} />New deployment</button>
          </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-[26px] pb-[26px]">
          <div className="border border-border rounded-[10px] bg-card overflow-hidden">
            <div className="grid grid-cols-[1.6fr_0.8fr_0.6fr_1fr_0.7fr_0.6fr] items-center px-5 py-3 bg-secondary/40 border-b border-border">
              {['service', 'state', 'requests', 'spend / budget', 'uptime', 'last'].map(h => <span key={h} className="font-mono text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">{h}</span>)}
            </div>
            {ROWS.map((r, i) => (
              <div key={i} className="grid grid-cols-[1.6fr_0.8fr_0.6fr_1fr_0.7fr_0.6fr] items-center px-5 py-3 text-[13.5px] border-b border-border/50 last:border-0">
                <span className="font-semibold">{r[0]}</span>
                <span><span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + (r[1] === 'ok' ? 'bg-primary/14 text-primary' : 'bg-warning/16 text-warning')}><span className={"w-1.5 h-1.5 rounded-full " + (r[1] === 'ok' ? 'bg-primary' : 'bg-warning')} />{r[1].toUpperCase()}</span></span>
                <span className="font-mono text-[12px]">{r[2]}</span>
                <span className="font-mono text-[12px]">{r[3]}</span>
                <span className="font-mono text-[12px] text-muted-foreground">{r[4]}</span>
                <span className="font-mono text-[12px] text-muted-foreground">{r[5]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>);
}

const CODE = `// AppShell.tsx — sidebar + topbar + page header (gntik-ui)
// Icons via lucide-react · classes = tokens from tokens/brand.css
import { Home, Bot, Network, GitBranch, Bell, Moon, Plus, SlidersHorizontal, ChevronDown } from "lucide-react";

const NAV = [
  ["Workspace", [["Home", Home], ["Messages", Chat], ["Marketplace", Store]]],
  ["Build", [["Services", Bot], ["Deployments", Network, true], ["Workflows", GitBranch]]],
  // …Insights · Governance · Operations · System
];

export function AppShell({ children }) {
  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans">
      <aside className="w-[258px] shrink-0 flex flex-col bg-chrome border-r border-border/60">
        <div className="px-4 py-4"><Wordmark /></div>
        <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-3.5">
          {NAV.map(([group, items]) => (
            <CollapsibleGroup key={group} label={group}>
              {items.map(([label, Ico, active]) => (
                <a key={label} className={\`relative flex items-center gap-2.5 h-[34px] px-2.5 rounded-lg text-[13px]
                  \${active ? "bg-accent text-accent-foreground font-semibold"
                           : "text-muted-foreground font-medium hover:bg-accent/55 hover:text-foreground"}\`}>
                  {active && <span className="absolute -left-3 inset-y-1.5 w-[3px] rounded-r bg-primary" />}
                  <Ico className="size-4" />{label}
                </a>
              ))}
            </CollapsibleGroup>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 flex items-center gap-3.5 px-5 bg-chrome border-b border-border/60">
          {/* Two-line switcher · tenant (mono) · attached breadcrumb */}
          <WorkspaceSwitcher />            {/* avatar · name · env·region · ▾ */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-[12.5px] text-foreground/90">acme-industries</span>
            <ChevronRight className="size-3.5 text-muted-foreground/40" />
            <Breadcrumb>Operation / Deployments</Breadcrumb>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <LiveDot /> <CmdKButton />
            <ThemeMenu /> <NotificationsMenu /> <UserMenu />
          </div>
        </header>
        <PageHeader title="Deployments" subtitle="12 services · 3 namespaces · eu-west-1"
          actions={<><Button variant="outline"><SlidersHorizontal className="size-4" />Filters</Button>
                     <Button><Plus className="size-4" />New deployment</Button></>} />
        <main className="flex-1 overflow-y-auto px-[26px] pb-[26px]">{children}</main>
      </div>
    </div>
  );
}`;

function AppShellSection() {
  return (
    <div>
      <SectionHead kicker="App shell" title="App shell" status="done"
        intro="The shared chrome behind every screen: sidebar with collapsible groups, topbar (workspace · tenant · ⌘K · profile) and page header. Fix it once and every screen inherits it. Interactive: collapse groups and open the menus." />
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6 overflow-hidden">
        <ScaleFrame width={1340}><AppShellDemo /></ScaleFrame>
      </div>
      <CodeBlock code={CODE} lang="tsx" />
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['app-shell'] = AppShellSection;
window.AppShellDemo = AppShellDemo;
})();
