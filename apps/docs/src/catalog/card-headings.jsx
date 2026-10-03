/* ============================================================================
   Gntik UI · card-headings.jsx — the header of a card or panel.
   Lives INSIDE the card chrome: title + description or meta + actions,
   separated from the body by a divider. It is not a content divider like the
   section heading, nor does it carry the green label of the page heading.
   Variants: simple · with action · with menu (…) · with tabs.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── header buttons ──────────────────────────────────────────────────────── */
const CardBtn = ({ children }) => (
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const CardLink = ({ children }) => (
  <button className="shrink-0 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">{children}</button>
);

/* ── status pill (mono · green) ──────────────────────────────────────────── */
const RunningPill = () => (
  <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary shrink-0">
    <span className="w-1.5 h-1.5 rounded-full bg-current" />Running
  </span>
);

/* ── card actions menu (…) — interactive ─────────────────────────────────── */
function CardMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const item = "flex items-center w-full text-left px-3 h-9 text-[13px] text-foreground hover:bg-secondary/70 transition-colors";
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen(o => !o)} aria-label="Actions"
        className={"h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card hover:text-foreground hover:bg-secondary/60 transition-colors " + (open ? 'text-foreground bg-secondary/60' : 'text-muted-foreground')}>
        <Icon name="dot3" size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-[38px] z-20 w-44 rounded-lg border border-border bg-popover shadow-lg py-1">
          <button className={item}>Pause</button>
          <button className={item}>Configure</button>
          <button className={item}>Duplicate</button>
          <div className="my-1 h-px bg-border" />
          <button className="flex items-center w-full text-left px-3 h-9 text-[13px] text-destructive hover:bg-destructive/10 transition-colors">Delete service</button>
        </div>
      )}
    </div>
  );
}

/* ── tabs inside the card header — interactive ───────────────────────────── */
function CardTabs() {
  const tabs = ['Overview', 'Cost', 'Logs', 'Trace'];
  const [active, setActive] = useState('Overview');
  return (
    <nav className="flex items-center gap-5">
      {tabs.map(t => {
        const on = active === t;
        return (
          <button key={t} onClick={() => setActive(t)}
            className={"h-9 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        );
      })}
    </nav>
  );
}

/* ── card body · neutral placeholder (not part of the component) ─────────── */
const CardBody = () => (
  <div className="px-5 py-5 space-y-2.5" aria-hidden="true">
    <div className="h-2.5 rounded bg-muted-foreground/10 w-[82%]" />
    <div className="h-2.5 rounded bg-muted-foreground/10 w-full" />
    <div className="h-2.5 rounded bg-muted-foreground/10 w-[58%]" />
  </div>
);

/* ── wrapper: name + description + card floating on the surface ─────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-8 flex justify-center">
      <div className="w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    </div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── snippets to paste ───────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — card header: title + description, divider, body
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="px-5 py-4 border-b border-border">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Budget</h3>
    <p className="mt-0.5 text-[13px] text-muted-foreground">Spend caps applied per service.</p>
  </div>
  <div className="px-5 py-5">{/* card body */}</div>
</div>`;

const CODE_ACTION = `// With action — title + description on the left, action on the right
<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
  <div className="min-w-0">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Policies</h3>
    <p className="mt-0.5 text-[13px] text-muted-foreground">Guardrails applied to every request.</p>
  </div>
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold hover:bg-secondary/60">
    Add policy
  </button>
</div>`;

const CODE_MENU = `// With menu — resource: title + status + meta + menu (…)
<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
  <div className="min-w-0">
    <div className="flex items-center gap-2.5">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate">support-triage</h3>
      <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />Running
      </span>
    </div>
    <p className="mt-1 font-mono text-[12px] text-muted-foreground">service · eu-west-1 · 1,284 requests today</p>
  </div>
  <Menu>{/* Pause · Configure · Duplicate · Delete */}</Menu>
</div>`;

const CODE_TABS = `// With tabs — title + text action and tabs inside the header
<div className="px-5 pt-4 border-b border-border">
  <div className="flex items-center justify-between gap-4 mb-3">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Costs</h3>
    <button className="text-[13px] font-semibold text-primary">Export</button>
  </div>
  <nav className="flex items-center gap-5">
    {["Overview", "Cost", "Logs", "Trace"].map((t, i) => (
      <button key={t} className={"h-9 -mb-px border-b-2 text-[13px] font-medium " +
        (i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
        {t}
      </button>
    ))}
  </nav>
</div>`;

function CardHeadingsSection() {
  return (
    <div>
      <SectionHead kicker="Headings" title="Card headings" status="done"
        intro="The header of a card or panel: it lives inside the card chrome and separates the title from the body with a divider. Unlike the section heading it does not divide page content, and unlike the page heading it carries no green label and does not repeat the screen name. Title + description or meta + actions; the menu and tabs are interactive." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Title and description with a divider separating it from the body. The default card header." code={CODE_SIMPLE}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Budget</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Spend caps applied per service.</p>
        </div>
        <CardBody />
      </Variant>

      {/* 2 · With action */}
      <Variant title="With action" desc="Title and description on the left; a card action on the right." code={CODE_ACTION}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Policies</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Guardrails applied to every request.</p>
          </div>
          <CardBtn>Add policy</CardBtn>
        </div>
        <CardBody />
      </Variant>

      {/* 3 · With menu */}
      <Variant title="With menu" desc="Resource header: title with status, a meta line and an actions menu (…). The menu opens and closes." code={CODE_MENU}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate">support-triage</h3>
              <RunningPill />
            </div>
            <p className="mt-1 font-mono text-[12px] text-muted-foreground">service · eu-west-1 · 1,284 requests today</p>
          </div>
          <CardMenu />
        </div>
        <CardBody />
      </Variant>

      {/* 4 · With tabs */}
      <Variant title="With tabs" desc="Title with a text action and a row of tabs inside the header itself. The tabs switch state." code={CODE_TABS}>
        <div className="px-5 pt-4 border-b border-border">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Costs</h3>
            <CardLink>Export</CardLink>
          </div>
          <CardTabs />
        </div>
        <CardBody />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['card-headings'] = CardHeadingsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
