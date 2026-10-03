/* ============================================================================
   Gntik UI · list-containers.jsx — the chrome that wraps a list.
   Same row (icon + name + meta + chevron) mounted in four containers:
   flush, in a card, as separate cards and in a card with header and footer.
   What's shown here is the wrapper, not the row. Neutral fixtures · tokens.
   Variants: flush · in card · separate cards · with header and footer.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

/* ── variant wrapper ─────────────────────────────────────────────────────── */
const Variant = ({ title, desc, code, surface = false, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    {surface
      ? <div className="preview-surface rounded-lg border border-border p-8">{children}</div>
      : <div className="rounded-lg border border-border bg-card p-3">{children}</div>}
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── data: the same row in every container ───────────────────────────────── */
const SPACES = [
  { name: 'production', icon: 'box', meta: '12 services · 1.2M runs' },
  { name: 'staging', icon: 'flask', meta: '6 services · 88k runs' },
  { name: 'eu-residency', icon: 'shield', meta: '8 services · 640k runs' },
  { name: 'sandbox', icon: 'bot', meta: '4 services · 12k runs' },
];

/* ── the reusable row (content is constant; the container changes) ── */
const RowInner = ({ s }) => (
  <>
    <span className="w-9 h-9 rounded-lg bg-primary/14 text-primary inline-flex items-center justify-center shrink-0"><Icon name={s.icon} size={17} /></span>
    <div className="min-w-0 flex-1">
      <div className="text-[13.5px] font-semibold text-foreground truncate">{s.name}</div>
      <div className="font-mono text-[11.5px] text-muted-foreground truncate">{s.meta}</div>
    </div>
    <Icon name="chevronRight" size={16} className="shrink-0 text-muted-foreground/50" />
  </>
);

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_FLUSH = `// Flush — divided ul, no border or background: takes the parent's width
<ul role="list" className="divide-y divide-border">
  {items.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 py-3.5 hover:opacity-80">
        <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
      </a>
    </li>
  ))}
</ul>`;

const CODE_CARD = `// In card — the list inside a bordered, rounded container; rows edge to edge
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <ul role="list" className="divide-y divide-border">
    {items.map((s) => (
      <li key={s.name}>
        <a className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40">
          <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
        </a>
      </li>
    ))}
  </ul>
</div>`;

const CODE_SEP = `// Separate cards — each row is its own card, separated by a gap
<ul role="list" className="flex flex-col gap-2.5">
  {items.map((s) => (
    <li key={s.name}>
      <a className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm hover:border-primary/40 hover:bg-accent/30">
        <Icon name={s.icon} /> <div>{s.name}</div> <ChevronRight />
      </a>
    </li>
  ))}
</ul>`;

const CODE_HEADFOOT = `// With header and footer — card with title + count on top and action below
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
    <h3 className="text-[13px] font-semibold text-foreground">Namespaces</h3>
    <span className="font-mono text-[11px] text-muted-foreground">4</span>
  </div>
  <ul role="list" className="divide-y divide-border">
    {items.map((s) => (
      <li key={s.name}><a className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40">{/* row */}</a></li>
    ))}
  </ul>
  <div className="border-t border-border px-4 py-2.5">
    <a className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">View all <span aria-hidden>→</span></a>
  </div>
</div>`;

function ListContainersSection() {
  return (
    <div>
      <SectionHead kicker="Lists" title="List containers" status="done"
        intro="The same row — icon, name, meta and chevron — mounted in four wrappers. What changes here is not the row content but its container: flush to take the full width, in a card when the list needs a frame, as separate cards to give each row weight, or with header and footer when it's a panel with a title and an action." />

      <Variant title="Flush" desc="Divided list with no border or background of its own: inherits the width of the parent container. The lightest option, for use inside a page or an already framed drawer." code={CODE_FLUSH}>
        <ul role="list" className="divide-y divide-border px-1">
          {SPACES.map((s) => (
            <li key={s.name}>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 py-3.5 hover:opacity-75 transition-opacity"><RowInner s={s} /></a>
            </li>
          ))}
        </ul>
      </Variant>

      <Variant title="In card" desc="The same list inside a bordered, rounded card; rows reach the edges and highlight on hover. The default container for a standalone list." surface code={CODE_CARD}>
        <div className="mx-auto max-w-[460px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <ul role="list" className="divide-y divide-border">
            {SPACES.map((s) => (
              <li key={s.name}>
                <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors"><RowInner s={s} /></a>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      <Variant title="Separate cards" desc="Each row is its own card with a flat shadow, separated by a gap. Gives each item weight and independence — useful when the row is actionable on its own." surface code={CODE_SEP}>
        <ul role="list" className="mx-auto max-w-[460px] flex flex-col gap-2.5">
          {SPACES.map((s) => (
            <li key={s.name}>
              <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm hover:border-primary/40 hover:bg-accent/30 transition-colors"><RowInner s={s} /></a>
            </li>
          ))}
        </ul>
      </Variant>

      <Variant title="With header and footer" desc="The card grows into a panel: a header with title and count, the list in the middle and a footer with a view-all action. The container for a dashboard module." surface code={CODE_HEADFOOT}>
        <div className="mx-auto max-w-[460px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-sans text-[13px] font-semibold text-foreground">Namespaces</h3>
            <span className="font-mono text-[11px] text-muted-foreground">{SPACES.length}</span>
          </div>
          <ul role="list" className="divide-y divide-border">
            {SPACES.map((s) => (
              <li key={s.name}>
                <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"><RowInner s={s} /></a>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-4 py-2.5">
            <a href="#" onClick={e => e.preventDefault()} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">View all <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['list-containers'] = ListContainersSection;
})();
