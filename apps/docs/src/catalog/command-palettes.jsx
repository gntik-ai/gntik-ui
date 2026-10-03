/* ============================================================================
   Gntik UI · command-palettes.jsx — ⌘K command palette ("Navigation" group).
   Fuzzy search with grouped results (Actions · Go to · Recent),
   keyboard navigation (↑↓ ↵ esc) and shortcuts. ⌘K opens it while the section
   is mounted. Contained in the preview (absolute overlay, not fixed). Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef } = window;

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

const GROUPS = [
  ['Actions', [
    { icon: 'bot', label: 'New deployment', hint: 'D' },
    { icon: 'pause', label: 'Pause deployments', hint: 'P' },
    { icon: 'flow', label: 'New workflow', hint: 'W' },
    { icon: 'download', label: 'Export costs (CSV)' },
  ]],
  ['Go to', [
    { icon: 'net', label: 'Deployments' },
    { icon: 'coin', label: 'Costs' },
    { icon: 'shield', label: 'Policies' },
    { icon: 'list', label: 'Logs' },
    { icon: 'cog', label: 'Settings' },
  ]],
  ['Recent', [
    { icon: 'bot', label: 'support-triage', mono: true },
    { icon: 'bot', label: 'invoice-ocr', mono: true },
  ]],
];

function Palette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [last, setLast] = useState(null);
  const inputRef = useRef(null);

  // ⌘K / Ctrl+K opens it while this section is mounted
  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);

  const needle = q.trim().toLowerCase();
  const groups = GROUPS
    .map(([name, items]) => [name, items.filter(it => it.label.toLowerCase().includes(needle))])
    .filter(([, items]) => items.length);
  const flat = groups.flatMap(([, items]) => items);
  const selClamped = Math.min(sel, Math.max(0, flat.length - 1));

  const run = it => { if (!it) return; setLast(it.label); setOpen(false); };

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(flat.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(flat[selClamped]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  };

  let idx = -1; // continuous global index across groups
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      {/* trigger */}
      <div className="absolute inset-0 grid place-content-center gap-3 text-center">
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2.5 h-10 pl-3.5 pr-2.5 rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-ring/50">
          <Icon name="search" size={16} /><span className="text-[13px]">Search or run a command</span>
          <span className="font-mono text-[10.5px] font-semibold rounded border border-border px-1.5 py-0.5 leading-none">⌘K</span>
        </button>
        <p className="text-[12px] text-muted-foreground">
          {last ? <>Last action: <span className="font-mono text-foreground">{last}</span></> : <>Press <span className="font-mono text-foreground">⌘K</span> or the button to open</>}
        </p>
      </div>

      {/* overlay */}
      {open && (
        <div className="absolute inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-12 w-[min(92%,520px)] rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* input */}
            <div className="flex items-center gap-2.5 h-13 px-4 border-b border-border" style={{ height: 52 }}>
              <Icon name="search" size={17} className="text-muted-foreground shrink-0" />
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown}
                placeholder="Search services, actions, settings…"
                className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/70" />
              <kbd className="font-mono text-[10px] font-semibold rounded border border-border px-1.5 py-0.5 text-muted-foreground leading-none">esc</kbd>
            </div>
            {/* results */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                  No results for “<span className="text-foreground">{q}</span>”
                </div>
              ) : groups.map(([name, items]) => (
                <div key={name} className="px-2 pb-1.5">
                  <div className="px-2.5 pt-2 pb-1 font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/70">{name}</div>
                  {items.map(it => {
                    idx++;
                    const on = idx === selClamped;
                    return (
                      <button key={it.label} onMouseMove={(myIdx => () => setSel(myIdx))(idx)} onClick={() => run(it)}
                        className={"flex w-full items-center gap-3 h-9 px-2.5 rounded-lg text-left transition-colors " + (on ? 'bg-accent text-accent-foreground' : 'text-foreground')}>
                        <Icon name={it.icon} size={16} className={on ? 'text-primary' : 'text-muted-foreground'} />
                        <span className={"flex-1 text-[13px] truncate " + (it.mono ? 'font-mono text-[12.5px]' : '')}>{it.label}</span>
                        {it.hint && <kbd className="font-mono text-[10px] font-semibold rounded border border-border px-1.5 py-0.5 text-muted-foreground leading-none">{it.hint}</kbd>}
                        {on && !it.hint && <Icon name="arrow" size={14} className="text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* footer */}
            <div className="flex items-center gap-4 h-9 px-4 border-t border-border text-muted-foreground">
              <span className="flex items-center gap-1.5 text-[11px]"><kbd className="font-mono text-[10px] rounded border border-border px-1 leading-tight">↑↓</kbd>navigate</span>
              <span className="flex items-center gap-1.5 text-[11px]"><kbd className="font-mono text-[10px] rounded border border-border px-1 leading-tight">↵</kbd>select</span>
              <span className="flex items-center gap-1.5 text-[11px]"><kbd className="font-mono text-[10px] rounded border border-border px-1 leading-tight">esc</kbd>close</span>
              <span className="flex-1" />
              <span className="font-mono text-[10.5px]">{flat.length} result{flat.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CODE = `// ⌘K palette — filters groups, keyboard navigation, runs with ↵
const [open, setOpen] = useState(false), [q, setQ] = useState(""), [sel, setSel] = useState(0);

useEffect(() => {                       // ⌘K / Ctrl+K to open
  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

const groups = GROUPS
  .map(([name, items]) => [name, items.filter((it) => it.label.toLowerCase().includes(q.trim().toLowerCase()))])
  .filter(([, items]) => items.length);
const flat = groups.flatMap(([, items]) => items);

function onKeyDown(e) {                  // ↑↓ move selection, ↵ runs, esc closes
  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
  else if (e.key === "Enter")  { e.preventDefault(); run(flat[sel]); }
  else if (e.key === "Escape") { setOpen(false); }
}

// overlay: bg-background/70 backdrop-blur · panel bg-popover · active item on bg-accent`;

function CommandPalettesSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Command palettes" status="done"
        intro="The ⌘K palette: search and run any action without touching the mouse. Grouped results (Actions · Go to · Recent), live filtering and full keyboard navigation — ↑↓ to move, ↵ to run, esc to close. The active item sits on bg-accent with the icon in brand green." />

      <Variant title="⌘K with search and shortcuts"
        desc="Press ⌘K (or Ctrl+K), or the button, to open. Type to filter the groups, move with the arrows and run with Enter; the mouse highlights too. The last action is recorded under the trigger."
        code={CODE}>
        <Palette />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['command-palettes'] = CommandPalettesSection;
})();
