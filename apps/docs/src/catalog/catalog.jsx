/* ============================================================================
   Gntik UI · catalog.jsx — catalog frame.
   Sidebar (nav from REGISTRY with status) + topbar (theme switch) + router
   (hash + localStorage). Exposes window.__goto and window.__setTheme.
   Pending sections show a placeholder with their planned scope.
   ============================================================================ */
const { Icon, LogoMark, StatusTag, REGISTRY, regFlat, regFind, regCounts, useState, useEffect, useRef } = window;

const DOT = { done: 'bg-primary', wip: 'bg-warning', todo: 'bg-muted-foreground/40' };
const THEMES = [['', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['high_contrast', 'HC', 'contrast']];

function ThemeSwitch({ theme, setTheme }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
      {THEMES.map(([val, label, icon]) => {
        const on = theme === val;
        return (
          <button key={label} onClick={() => setTheme(val)} title={label}
            className={"flex items-center gap-1.5 h-7 px-2.5 rounded-[5px] font-sans text-[12.5px] font-medium transition-colors " +
              (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <Icon name={icon} size={14} /><span className="hidden xl:inline">{label}</span>
          </button>);
      })}
    </div>);
}

function Pending({ item }) {
  const siblings = REGISTRY.find(g => g.items.some(i => i.id === item.id));
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">{siblings?.group}</div>
        <StatusTag status={item.status} />
      </div>
      <h1 className="font-sans font-bold text-[2rem] leading-tight tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>{item.label}</h1>
      <p className="font-sans text-[15px] text-muted-foreground mt-3 max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>{item.blurb}</p>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-card/40 px-8 py-14 flex flex-col items-center text-center">
        <span className="w-14 h-14 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-4"><Icon name={item.icon} size={24} /></span>
        <div className="font-sans font-semibold text-[15px] text-foreground">Coming soon</div>
        <p className="font-sans text-[13.5px] text-muted-foreground mt-1.5 max-w-sm" style={{ textWrap: 'pretty' }}>
          This component lands in one of the next batches. Let us know if you want it prioritised.
        </p>
      </div>

      {siblings && (
        <div className="mt-10">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-3">Rest of the group · {siblings.group}</div>
          <div className="flex flex-wrap gap-2">
            {siblings.items.map(s => (
              <button key={s.id} onClick={() => window.__goto(s.id)}
                className={"flex items-center gap-2 h-9 px-3 rounded-lg border text-[13px] transition-colors " + (s.id === item.id ? 'border-primary/50 bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground')}>
                <span className={"w-1.5 h-1.5 rounded-full " + DOT[s.status]} />{s.label}
              </button>
            ))}
          </div>
        </div>)}
    </div>);
}

function CatalogShell() {
  const flat = regFlat();
  const ids = flat.map(i => i.id);
  const initial = (location.hash || '').replace('#', '') || localStorage.getItem('gntik-section') || 'overview';
  const [active, setActive] = useState(ids.includes(initial) ? initial : 'overview');
  const [theme, setTheme] = useState(localStorage.getItem('gntik-theme') ?? 'dark');
  const mainRef = useRef(null);
  const c = regCounts();

  useEffect(() => { document.documentElement.className = theme; localStorage.setItem('gntik-theme', theme); }, [theme]);
  useEffect(() => {
    localStorage.setItem('gntik-section', active);
    if (location.hash.replace('#', '') !== active) history.replaceState(null, '', '#' + active);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [active]);
  useEffect(() => {
    window.__goto = (id) => { if (ids.includes(id)) setActive(id); };
    window.__setTheme = (t) => setTheme(t);
    const onHash = () => { const h = location.hash.replace('#', ''); if (ids.includes(h)) setActive(h); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const Section = window.SECTIONS[active];
  const item = regFind(active);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-[270px] shrink-0 flex flex-col bg-chrome border-r border-border/60">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border/60">
          <LogoMark s={28} />
          <div className="leading-none"><div className="font-sans font-bold text-[15px] tracking-tight">Gntik UI</div><div className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted-foreground mt-1">Component library</div></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4">
          {REGISTRY.map(grp => (
            <div key={grp.group}>
              <div className="px-2.5 mb-1.5 font-mono text-[9.5px] tracking-[0.15em] uppercase text-muted-foreground/70">{grp.group}</div>
              <div className="flex flex-col gap-0.5">
                {grp.items.map(it => {
                  const on = it.id === active;
                  return (
                    <button key={it.id} onClick={() => setActive(it.id)}
                      className={"relative flex items-center gap-2.5 h-[33px] px-2.5 rounded-lg text-[13px] text-left transition-colors " +
                        (on ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-accent/45 font-medium')}>
                      {on && <span className="absolute left-[-12px] top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
                      <Icon name={it.icon} size={16} className="shrink-0" /><span className="truncate flex-1">{it.label}</span>
                      <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + DOT[it.status]} />
                    </button>);
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="m-2.5 p-3 rounded-[10px] bg-card border border-border">
          <div className="flex items-center justify-between mb-2"><span className="font-sans font-semibold text-[12px]">Progress</span><span className="font-mono text-[10.5px] text-muted-foreground">{c.done}/{c.total}</span></div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(c.done / c.total) * 100}%` }} /></div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">{item?.group}</span>
            <Icon name="chevronRight" size={13} className="text-muted-foreground/60" />
            <span className="font-sans font-semibold text-[14px] text-foreground truncate">{item?.label}</span>
          </div>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[1120px] mx-auto px-6 sm:px-10 py-12">
            {Section ? <Section /> : item ? <Pending item={item} /> : <div className="text-muted-foreground">Section not found.</div>}
          </div>
        </main>
      </div>
    </div>);
}

window.CatalogShell = CatalogShell;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
