/* ============================================================================
   Gntik UI · dividers.jsx — separators ("Elements" group).
   The simple rule (default · subtle · thick), with a label (centred · aligned
   · in a pill), with a central icon or a right-hand action, and vertical rules
   for metadata and stat blocks. Border tokens only, no hardcoded colour.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

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

/* ── 1 · SIMPLE ──────────────────────────────────────────────────────────── */
function SimpleDividers() {
  const Row = ({ label, children }) => (
    <div><p className="mb-3 text-[12px] text-muted-foreground">{label}</p>{children}</div>
  );
  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <Row label="Default"><div className="h-px w-full bg-border" /></Row>
      <Row label="Subtle — bg-border/50"><div className="h-px w-full bg-border/50" /></Row>
      <Row label="Thick"><div className="h-0.5 w-full rounded-full bg-border" /></Row>
    </div>
  );
}

/* ── 2 · WITH LABEL ──────────────────────────────────────────────────────── */
function LabelDividers() {
  return (
    <div className="mx-auto w-full max-w-md space-y-9">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[12.5px] text-muted-foreground">Today's jobs</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">This week</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="inline-flex h-[22px] items-center rounded-full bg-secondary px-2.5 font-mono text-[10.5px] font-semibold text-muted-foreground">yesterday</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/* ── 3 · WITH ICON / WITH ACTION ─────────────────────────────────────────── */
function ActionDividers() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto w-full max-w-md space-y-9">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground"><Icon name="bolt" size={14} /></span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex items-center gap-4">
        <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Members</span>
        <div className="h-px flex-1 bg-border" />
        <button className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:text-primary/80"><Icon name="plus" size={14} />Invite</button>
      </div>

      <div>
        <ul className="space-y-2 text-[13px] text-foreground">
          <li>support-triage</li>
          <li>billing-api</li>
          {open && (<React.Fragment><li>data-enricher</li><li>lead-router</li><li>fraud-scan</li></React.Fragment>)}
        </ul>
        <button onClick={() => setOpen(o => !o)} className="group mt-3 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            <Icon name={open ? 'chevronUp' : 'chevron'} size={14} />{open ? 'Show less' : 'Show 3 more'}
          </span>
          <div className="h-px flex-1 bg-border" />
        </button>
      </div>
    </div>
  );
}

/* ── 4 · VERTICAL ────────────────────────────────────────────────────────── */
function VerticalDividers() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-9">
      <div className="flex items-center justify-center gap-3 text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">12 services</span>
        <div className="h-3.5 w-px bg-border" />
        <span>eu-west-1</span>
        <div className="h-3.5 w-px bg-border" />
        <span className="font-mono text-[12px]">v2.3.0</span>
      </div>
      <div className="flex items-stretch gap-5">
        {[['9', 'active'], ['3', 'paused'], ['$2.1k', 'spend/day']].map(([n, label], i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-px self-stretch bg-border" />}
            <div className="flex-1 text-center">
              <div className="font-mono text-[22px] font-semibold text-foreground">{n}</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">{label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_LABEL = `// Divider with label — two flexible rules on either side of the text
<div className="flex items-center gap-3">
  <div className="h-px flex-1 bg-border" />
  <span className="text-[12.5px] text-muted-foreground">Today's jobs</span>
  <div className="h-px flex-1 bg-border" />
</div>`;

const CODE_ACTION = `// With action — label on the left, flexible rule, button on the right
<div className="flex items-center gap-4">
  <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Members</span>
  <div className="h-px flex-1 bg-border" />
  <button className="shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80">
    <PlusIcon /> Invite
  </button>
</div>`;

const CODE_VERTICAL = `// Vertical — a w-px that stretches with self-stretch between blocks
<div className="flex items-stretch gap-5">
  <div className="flex-1 text-center">…</div>
  <div className="w-px self-stretch bg-border" />
  <div className="flex-1 text-center">…</div>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function DividersSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Dividers" status="done"
        intro="Separators that give content rhythm: the simple rule in three weights, with a label (centred, aligned or in a pill), with a central icon, with a right-hand action (and a divider that expands the list), and vertical rules for metadata and stat blocks. They only use the border token." />

      <Variant title="Simple"
        desc="The horizontal rule in three weights: default, subtle (border/50) for low-contrast separations, and thick to close a block.">
        <SimpleDividers />
      </Variant>

      <Variant title="With label"
        desc="Text between two rules that fill the space: centred, left-aligned as a mono kicker, or wrapped in a pill."
        code={CODE_LABEL}>
        <LabelDividers />
      </Variant>

      <Variant title="With icon and action"
        desc="A central icon as a section mark, a header with a right-hand action, and a clickable divider that expands the list. Press “Show 3 more”."
        code={CODE_ACTION}>
        <ActionDividers />
      </Variant>

      <Variant title="Vertical"
        desc="Thin vertical rules to separate metadata in a row, and dividers that stretch with self-stretch between stat blocks."
        code={CODE_VERTICAL}>
        <VerticalDividers />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['dividers'] = DividersSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
