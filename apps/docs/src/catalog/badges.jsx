/* ============================================================================
   Gntik UI · badges.jsx — badges & pills ("Elements" group).
   Status pills (semantic tones), tones and shapes (soft/solid/
   outline · square/pill), count badges on nav and icons, and removable
   tags with the categorical colours. All mono, all from tokens.
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

/* ── Brand status pill ───────────────────────────────────────────────────── */
const PILL_TONE = {
  primary:     'bg-primary/14 text-primary',
  muted:       'bg-muted-foreground/16 text-muted-foreground',
  warning:     'bg-warning/16 text-warning',
  info:        'bg-info/15 text-info',
  destructive: 'bg-destructive/15 text-destructive',
};
const StatusPill = ({ tone = 'primary', children }) => (
  <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + PILL_TONE[tone]}>
    <span className="size-1.5 rounded-full bg-current" />{children}
  </span>
);

/* ── 1 · STATUS PILLS ────────────────────────────────────────────────────── */
function StatusPills() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <StatusPill tone="primary">Running</StatusPill>
      <StatusPill tone="muted">Paused</StatusPill>
      <StatusPill tone="warning">Degraded</StatusPill>
      <StatusPill tone="destructive">Failed</StatusPill>
      <StatusPill tone="info">Queued</StatusPill>
    </div>
  );
}

/* ── 2 · TONES AND SHAPES ────────────────────────────────────────────────── */
function TonesShapes() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary">soft</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary text-primary-foreground">solid</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold border border-primary/45 text-primary">outline</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold border border-border text-muted-foreground">neutral</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center h-[24px] px-2.5 rounded-full bg-primary/14 text-primary text-[11.5px] font-semibold">pill</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-md bg-primary/14 text-primary text-[11.5px] font-semibold"><Icon name="check" size={12} stroke={2.6} />verified</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-md bg-warning/16 text-warning text-[11.5px] font-semibold"><Icon name="alert" size={12} />97% budget</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] pl-1.5 pr-2.5 rounded-full bg-secondary text-secondary-foreground text-[11.5px] font-semibold"><span className="size-1.5 rounded-full bg-primary" />live</span>
      </div>
    </div>
  );
}

/* ── 3 · COUNT BADGES ────────────────────────────────────────────────────── */
function CountBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
      <div className="inline-flex items-center gap-2.5 h-9 px-3 rounded-lg bg-secondary/60 text-[13px] font-medium text-foreground">
        <Icon name="bell" size={16} className="text-muted-foreground" />Alerts
        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">5</span>
      </div>
      <button className="relative inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm" aria-label="Inbox · 12 unread">
        <Icon name="inbox" size={17} />
        <span className="absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground ring-2 ring-card">12</span>
      </button>
      <button className="relative inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm" aria-label="New notifications">
        <Icon name="bell" size={17} />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
      </button>
      <span className="inline-flex items-center h-[20px] px-2 rounded-md bg-primary/14 text-primary font-mono text-[9.5px] font-bold tracking-[0.1em] uppercase">New</span>
      <div className="inline-flex items-center gap-2 pb-2 border-b-2 border-primary text-[13px] font-semibold text-foreground">
        Jobs<span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary/14 px-1 font-mono text-[10px] font-bold text-primary">128</span>
      </div>
    </div>
  );
}

/* ── 4 · REMOVABLE TAGS ──────────────────────────────────────────────────── */
const CAT_DOT = { rose: 'bg-category-rose', violet: 'bg-category-violet', amber: 'bg-category-amber', cyan: 'bg-category-cyan' };
const TAGS0 = [
  { label: 'production', cat: 'rose' }, { label: 'eu-west-1', cat: 'cyan' },
  { label: 'node-24', cat: 'violet' }, { label: 'pii-redaction', cat: 'amber' },
];
function Tags() {
  const [tags, setTags] = useState(TAGS0);
  const remove = (l) => setTags(t => t.filter(x => x.label !== l));
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex min-h-[26px] flex-wrap items-center justify-center gap-2">
        {tags.map(t => (
          <span key={t.label} className="inline-flex items-center gap-1.5 h-[26px] pl-2.5 pr-1.5 rounded-md border border-border bg-card text-[12px] font-medium text-foreground">
            <span className={"size-2 rounded-full " + CAT_DOT[t.cat]} />{t.label}
            <button onClick={() => remove(t.label)} aria-label={'Remove ' + t.label} className="grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={11} stroke={2.4} /></button>
          </span>
        ))}
        {tags.length === 0 && <button onClick={() => setTags(TAGS0)} className="font-mono text-[11px] text-primary hover:underline">restore tags</button>}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">press the ✕ to remove — the dot uses the categorical colours</span>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_PILL = `// Status pill — soft semantic tone + dot that inherits the colour (bg-current)
const TONE = {
  primary:     "bg-primary/14 text-primary",
  muted:       "bg-muted-foreground/16 text-muted-foreground",
  warning:     "bg-warning/16 text-warning",
  info:        "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
};
const StatusPill = ({ tone = "primary", children }) => (
  <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + TONE[tone]}>
    <span className="size-1.5 rounded-full bg-current" />{children}
  </span>
);`;

const CODE_COUNT = `// Count badge on an icon — ring in the surface colour
<button className="relative size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
  <InboxIcon />
  <span className="absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full
                   bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground ring-2 ring-card">12</span>
</button>`;

const CODE_TAG = `// Removable tag — categorical dot + ✕ button
<span className="inline-flex items-center gap-1.5 h-[26px] pl-2.5 pr-1.5 rounded-md border border-border bg-card text-[12px] font-medium">
  <span className="size-2 rounded-full bg-category-violet" />node-24
  <button onClick={() => remove(tag)} aria-label="Remove"
    className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"><XIcon /></button>
</span>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function BadgesSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Badges & pills" status="done"
        intro="Compact labels for status and metadata: status pills with their semantic tones, soft / solid / outline styles in square or pill shape, count badges on nav and icons, and removable tags with the categorical colours. All text in mono and all colour from tokens." />

      <Variant title="Status pills"
        desc="A service's status at a glance: soft tone + a dot that inherits the colour via bg-current. Green for healthy, amber for degraded, red for failed — primary never competes with severity."
        code={CODE_PILL}>
        <StatusPills />
      </Variant>

      <Variant title="Tones and shapes"
        desc="Four styles (soft, solid, outline, neutral) and two shapes (square rounded-md or pill rounded-full), with an optional dot or icon. Soft is for everyday use; solid is reserved for occasional emphasis.">
        <TonesShapes />
      </Variant>

      <Variant title="Count badges"
        desc="Numbers on nav items, an icon corner with a ring in the background colour, a dot indicator without a number, a “New” label and a counter on the active tab."
        code={CODE_COUNT}>
        <CountBadges />
      </Variant>

      <Variant title="Removable tags"
        desc="Metadata chips with a categorical dot and a ✕ button. Press the ✕ to remove one; once empty, a link appears to restore them."
        code={CODE_TAG}>
        <Tags />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['badges'] = BadgesSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
