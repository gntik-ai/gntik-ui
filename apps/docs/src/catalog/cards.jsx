/* ============================================================================
   Gntik UI · cards.jsx — the card as a content surface ("Layout" group).
   The base container wrapping almost the whole catalog: simple, with header,
   with footer, with full-bleed (divided) sections, on a grey well, and with media.
   This shows the surface (border, radius, padding, flat shadow), not its
   content. Tokens only, no hardcoded colour.
   Variants: simple · with header · with footer · sectioned · in well · with media.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

/* ── variant wrapper ─────────────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── image placeholder — subtle stripes + mono label ─────────────────────── */
const Media = ({ label = 'image 16:9', ratio = '16 / 9' }) => (
  <div className="relative w-full overflow-hidden bg-secondary" style={{ aspectRatio: ratio }}>
    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(135deg, hsl(var(--border) / 0.5) 0 1px, transparent 1px 11px)' }} />
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
    </div>
  </div>
);

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — border + radius + padding + flat shadow. The base surface.
<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
  <h3 className="text-[14px] font-semibold text-foreground">support-triage</h3>
  <p className="mt-1 text-[13px] text-muted-foreground">
    Classifies incoming tickets and routes them to the right team.
  </p>
</div>`;

const CODE_HEADER = `// With header — title + action on top, separated from the body by a border
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
    <h3 className="text-[14px] font-semibold text-foreground">Retry policy</h3>
    <button className="text-muted-foreground hover:text-foreground"><DotsIcon /></button>
  </div>
  <div className="px-5 py-4 text-[13px] text-muted-foreground">{/* body */}</div>
</div>`;

const CODE_FOOTER = `// With footer — primary action at the bottom, on a subtle well
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <div className="px-5 py-4">{/* body */}</div>
  <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3">
    <button className="...secondary">Dismiss</button>
    <button className="...primary">Approve</button>
  </div>
</div>`;

const CODE_SECTIONED = `// Sectioned — several full-bleed rows divided by a border; no outer padding
<div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
  {rows.map((r) => (
    <div key={r.k} className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[13px] text-muted-foreground">{r.k}</span>
      <span className="font-mono text-[12.5px] text-foreground">{r.v}</span>
    </div>
  ))}
</div>`;

const CODE_WELL = `// In well — lower-hierarchy card: secondary background, no shadow
<div className="rounded-xl border border-border bg-secondary/50 p-5">
  <p className="text-[13px] text-muted-foreground">
    This region does not accept new deployments until the quota is reviewed.
  </p>
</div>`;

const CODE_MEDIA = `// With media — full-bleed image on top, content below
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
  <div className="p-5">
    <h3 className="text-[14px] font-semibold text-foreground">Runbook · incidents</h3>
    <p className="mt-1 text-[13px] text-muted-foreground">{/* … */}</p>
  </div>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function CardsSection() {
  return (
    <div>
      <SectionHead kicker="Layout" title="Cards" status="done"
        intro="The card is the surface almost the whole catalog is built on: a 1px border, the token radius, generous padding and a flat brand-tinted shadow — never glow or gradient. This shows the surface itself: simple, with header, with an actions footer, full-bleed sectioned, in a well to lower hierarchy, and with media. The content is secondary." />

      {/* 1 · SIMPLE */}
      <Variant title="Simple" desc="Border, radius, padding and flat shadow. The base unit — a service, a note, a summary — when it needs neither header nor actions." code={CODE_SIMPLE}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/14 text-primary shrink-0"><Icon name="bot" size={18} /></span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-foreground truncate">support-triage</h3>
              <p className="font-mono text-[11px] text-muted-foreground">service · v2.3.0</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Classifies incoming tickets and routes them to the right team. 1.2M requests in the last 30 days.</p>
        </div>
      </Variant>

      {/* 2 · WITH HEADER */}
      <Variant title="With header" desc="A header with title and action, separated from the body by a border. The pattern for a dashboard panel or a settings block." code={CODE_HEADER}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h3 className="text-[14px] font-semibold text-foreground">Retry policy</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="dot3" size={18} /></button>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Up to 3 retries with exponential backoff; from the fourth failure the job is marked as <span className="text-foreground font-medium">failed</span> and the on-call owner is notified.</p>
          </div>
        </div>
      </Variant>

      {/* 3 · WITH FOOTER */}
      <Variant title="With actions footer" desc="The body on top and an action bar at the bottom on a subtle well. For cards that ask for a decision — approve, dismiss, confirm." code={CODE_FOOTER}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="text-[14px] font-semibold text-foreground">Raise the spend limit</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>The <span className="font-mono text-[12px] text-foreground">production</span> namespace reached 92% of its daily cap. Raise it from $2k to $3k?</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3">
            <button className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground hover:bg-accent/50 transition-colors">Dismiss</button>
            <button className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Raise</button>
          </div>
        </div>
      </Variant>

      {/* 4 · SECTIONED */}
      <Variant title="Sectioned" desc="Full-bleed rows divided by a border, no outer padding. For resource details: key-value pairs or sub-blocks stacked inside a single frame." code={CODE_SECTIONED}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
          {[['namespace', 'production'], ['region', 'eu-west-1'], ['runtime', 'node-24'], ['spend/day', '$1.84k'], ['status', 'active']].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[13px] text-muted-foreground">{k}</span>
              <span className="font-mono text-[12.5px] text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </Variant>

      {/* 5 · IN WELL */}
      <Variant title="In well" desc="Secondary background and no shadow: a lower-hierarchy card for inline notes, context or soft notices inside another surface." code={CODE_WELL}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-secondary/50 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-7 place-items-center rounded-md bg-muted-foreground/15 text-muted-foreground shrink-0 mt-0.5"><Icon name="info" size={15} /></span>
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>The <span className="font-mono text-[12px] text-foreground">eu-residency</span> region does not accept new deployments until its assigned compute quota is reviewed.</p>
          </div>
        </div>
      </Variant>

      {/* 6 · WITH MEDIA */}
      <Variant title="With media" desc="A full-bleed image in the header and the content below. For catalog or documentation entries where visuals matter — overflow-hidden clips the media to the radius." code={CODE_MEDIA}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Media label="cover 16:9" />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-[20px] items-center rounded-md bg-primary/14 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">runbook</span>
              <span className="font-mono text-[11px] text-muted-foreground">updated today</span>
            </div>
            <h3 className="mt-2 text-[14px] font-semibold text-foreground">Incident response</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Steps to contain a misbehaving service and roll back its active policy.</p>
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['cards'] = CardsSection;
})();
