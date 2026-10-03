/* ============================================================================
   Gntik UI · breadcrumbs.jsx — breadcrumbs ("Navigation" group).
   With chevron (root as a home icon), truncated (the middle collapses into "…"
   which expands the hidden segments), and with a dropdown on the current segment
   to jump between siblings. Sober separators, last segment not linked. Tokens.
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

const Crumb = ({ children, current, onClick }) => (
  current
    ? <span className="text-[13px] font-semibold text-foreground" aria-current="page">{children}</span>
    : <button onClick={onClick} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">{children}</button>
);
const Chev = () => <Icon name="chevronRight" size={14} className="text-muted-foreground/40 shrink-0" />;
const Slash = () => <span className="text-muted-foreground/40 select-none">/</span>;

/* ── 1 · WITH CHEVRON + HOME ─────────────────────────────────────────────── */
function WithChevron() {
  const trail = ['Operation', 'Deployments', 'support-triage'];
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <button aria-label="Home" className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"><Icon name="home" size={15} /></button>
      <Chev />
      {trail.map((t, i) => (
        <React.Fragment key={t}>
          <Crumb current={i === trail.length - 1}>{i === trail.length - 1 ? <span className="font-mono">{t}</span> : t}</Crumb>
          {i < trail.length - 1 && <Chev />}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ── 2 · TRUNCATED (collapsed middle) ────────────────────────────────────── */
function Truncated() {
  const full = ['Operation', 'Deployments', 'eu-west-1', 'namespaces', 'support-triage'];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const first = full[0], last = full[full.length - 1], hidden = full.slice(1, -1);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <Crumb>{first}</Crumb>
      <Slash />
      <div ref={ref} className="relative">
        <button onClick={() => setOpen(o => !o)} aria-label="Show hidden segments" aria-expanded={open}
          className={"grid h-7 px-1.5 place-items-center rounded-md transition-colors " + (open ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}>
          <Icon name="dot3" size={16} />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-48 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            {hidden.map(h => (
              <button key={h} onClick={() => setOpen(false)} className="flex w-full items-center gap-2 h-[32px] px-2.5 rounded-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-secondary/70">
                <Icon name="chevronRight" size={13} className="text-muted-foreground/50" />{h}
              </button>
            ))}
          </div>
        )}
      </div>
      <Slash />
      <Crumb current><span className="font-mono">{last}</span></Crumb>
    </nav>
  );
}

/* ── 3 · WITH DROPDOWN ON THE CURRENT SEGMENT ────────────────────────────── */
const SIBLINGS = ['support-triage', 'invoice-ocr', 'contract-summarize', 'nightly-recon'];
function WithDropdown() {
  const [current, setCurrent] = useState('support-triage');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
      <Crumb>Operation</Crumb><Chev />
      <Crumb>Deployments</Crumb><Chev />
      <div ref={ref} className="relative">
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          className="inline-flex items-center gap-1.5 h-7 px-2 -mx-1 rounded-md font-mono text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary/60">
          {current}<Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-56 rounded-[10px] border border-border bg-popover p-1.5 shadow-md">
            <div className="px-2.5 pt-1.5 pb-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">Switch service</div>
            {SIBLINGS.map(s => (
              <button key={s} onClick={() => { setCurrent(s); setOpen(false); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
                <Icon name="bot" size={15} className="text-muted-foreground" />
                <span className="flex-1 font-mono text-[12.5px] text-foreground">{s}</span>
                {current === s && <Icon name="check" size={15} className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

const CODE_CHEVRON = `// Breadcrumb with chevron — last segment not linked (aria-current)
<nav aria-label="Breadcrumb" className="flex items-center gap-2.5">
  <a className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"><Home className="size-4" /></a>
  <ChevronRight className="size-3.5 text-muted-foreground/40" />
  {trail.map((t, i) => {
    const last = i === trail.length - 1;
    return (
      <React.Fragment key={t}>
        {last
          ? <span aria-current="page" className="text-[13px] font-semibold text-foreground">{t}</span>
          : <a className="text-[13px] text-muted-foreground hover:text-foreground">{t}</a>}
        {!last && <ChevronRight className="size-3.5 text-muted-foreground/40" />}
      </React.Fragment>
    );
  })}
</nav>`;

const CODE_TRUNC = `// Truncated — the middle folds into "…" and a dropdown shows what is hidden
const first = full[0], last = full.at(-1), hidden = full.slice(1, -1);
// first  /  [ … ]  /  last     ← the "…" button opens the middle segments`;

function BreadcrumbsSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Breadcrumbs" status="done"
        intro="Breadcrumbs to locate the user within the hierarchy. With chevron and the root as an icon; truncated, where the middle collapses into “…” and a dropdown shows the hidden segments; and with a dropdown on the current segment to jump between siblings without going back. The last segment is never a link." />

      <Variant title="With chevron"
        desc="The base pattern: root as a home icon, chevron separators and the current resource in mono, not linked (aria-current)."
        code={CODE_CHEVRON}>
        <WithChevron />
      </Variant>

      <Variant title="Truncated"
        desc="When the path is long, the middle segments fold into a “…”. Press it to expand them; slash separator."
        code={CODE_TRUNC}>
        <Truncated />
      </Variant>

      <Variant title="With dropdown"
        desc="The current segment is a picker: open the menu to jump to a sibling service without going back. The trigger updates on selection.">
        <WithDropdown />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['breadcrumbs'] = BreadcrumbsSection;
})();
