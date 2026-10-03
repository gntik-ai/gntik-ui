/* ============================================================================
   Gntik UI · containers.jsx — content widths and page padding ("Layout" group).
   The invisible skeleton: the max-width scale, the centred reading container,
   the page's responsive gutters and the full-bleed pattern with constrained
   content. It paints no new UI, it organises space.
   Variants: width scale · centred · gutters · constrained full-bleed.
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
    <div className="preview-surface rounded-lg border border-border p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── measure bar — represents a max-w with its mono label ────────────────── */
const WIDTHS = [
  { cls: 'max-w-sm', px: '24rem', use: 'modal / aside' },
  { cls: 'max-w-md', px: '28rem', use: 'form' },
  { cls: 'max-w-2xl', px: '42rem', use: 'reading / detail' },
  { cls: 'max-w-4xl', px: '56rem', use: 'page content' },
  { cls: 'max-w-7xl', px: '80rem', use: 'shell / dashboard' },
];

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SCALE = `// Max widths — always with mx-auto to centre the block
<div className="mx-auto max-w-2xl">{/* reading / resource detail */}</div>
<div className="mx-auto max-w-7xl">{/* the full dashboard shell */}</div>`;

const CODE_CENTER = `// Centred reading container — a narrow column on the page
<main className="px-6 py-10">
  <div className="mx-auto max-w-2xl space-y-6">
    <h1 className="text-[22px] font-bold tracking-tight text-foreground">Edit service</h1>
    {/* the form never stretches beyond ~42rem */}
  </div>
</main>`;

const CODE_GUTTER = `// Responsive gutters — side padding grows with the viewport
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* content breathes on wide screens and hugs the edges on mobile */}
</div>`;

const CODE_BLEED = `// Full-bleed with constrained content — full-width band,
// content centred inside. The header bleeds, the body does not.
<header className="border-b border-border bg-card">
  <div className="mx-auto max-w-7xl px-6 py-4">{/* title + actions */}</div>
</header>
<main className="mx-auto max-w-7xl px-6 py-8">{/* content */}</main>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ContainersSection() {
  return (
    <div>
      <SectionHead kicker="Layout" title="Containers" status="done"
        intro="The invisible skeleton of every screen: the max-width scale that keeps lines of text from running too long, the centred container for reading and forms, gutters that grow with the viewport, and the full-bleed pattern where a band spans the full width but its content stays constrained. It paints no components — it organises the space they live in." />

      {/* 1 · WIDTH SCALE */}
      <Variant title="Width scale" desc="The max widths the template uses, from modal to full shell. Each block is centred with mx-auto; the bar shows its relative width and what it is used for." code={CODE_SCALE}>
        <div className="space-y-3.5">
          {WIDTHS.map((w) => (
            <div key={w.cls} className="flex items-center gap-4">
              <code className="w-24 shrink-0 font-mono text-[11.5px] text-foreground">{w.cls}</code>
              <div className="relative h-8 flex-1 rounded-md bg-secondary/60 overflow-hidden">
                <div className="h-full rounded-md bg-primary/14 border border-primary/30" style={{ width: `calc(${w.px} / 80rem * 100%)` }} />
                <span className="absolute inset-y-0 left-3 flex items-center font-mono text-[10.5px] text-primary">{w.px}</span>
              </div>
              <span className="hidden w-32 shrink-0 text-right text-[11.5px] text-muted-foreground sm:block">{w.use}</span>
            </div>
          ))}
        </div>
      </Variant>

      {/* 2 · CENTRED */}
      <Variant title="Centred container" desc="A narrow column (max-w-2xl) centred across the page width: the pattern for resource details, reading or a form, where stretching would be illegible." code={CODE_CENTER}>
        <div className="rounded-lg bg-secondary/40 px-4 py-6 [background-image:repeating-linear-gradient(135deg,hsl(var(--border)/0.35)_0_1px,transparent_1px_12px)]">
          <div className="mx-auto max-w-[440px] rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary">max-w-2xl · mx-auto</div>
            <h3 className="mt-2 text-[15px] font-semibold text-foreground">Edit service</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>The column stays legible as the page grows: content never exceeds ~42rem and the rest becomes margin.</p>
            <div className="mt-4 space-y-2">
              <div className="h-9 rounded-md border border-border bg-background/60" />
              <div className="h-9 rounded-md border border-border bg-background/60" />
            </div>
          </div>
        </div>
      </Variant>

      {/* 3 · GUTTERS */}
      <Variant title="Responsive gutters" desc="The container's side padding grows per breakpoint (px-4 → sm:px-6 → lg:px-8): content breathes on wide screens and hugs the edges on mobile. The striped areas are the gutters." code={CODE_GUTTER}>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-stretch">
            <div className="w-8 shrink-0 [background-image:repeating-linear-gradient(135deg,hsl(var(--primary)/0.18)_0_1px,transparent_1px_8px)]" />
            <div className="flex-1 py-6">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] text-muted-foreground">px-4 · sm:px-6 · lg:px-8</div>
                <span className="inline-flex h-[22px] items-center gap-1.5 rounded-md bg-primary/14 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary"><Icon name="layout" size={12} />content</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg border border-border bg-secondary/50" />)}
              </div>
            </div>
            <div className="w-8 shrink-0 [background-image:repeating-linear-gradient(135deg,hsl(var(--primary)/0.18)_0_1px,transparent_1px_8px)]" />
          </div>
        </div>
      </Variant>

      {/* 4 · FULL-BLEED */}
      <Variant title="Full-bleed with constrained content" desc="A band — header or footer — spans the full width with its own background and border, but its content is centred on the same max-w as the body. The separator bleeds edge to edge while the content stays aligned." code={CODE_BLEED}>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* full-bleed band */}
          <div className="border-b border-border bg-secondary/40">
            <div className="mx-auto flex max-w-[520px] items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="fleet" size={15} /></span>
                <span className="text-[13.5px] font-semibold text-foreground">Deployments</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">full-bleed band</span>
            </div>
          </div>
          {/* body constrained to the same width */}
          <div className="mx-auto max-w-[520px] px-5 py-6">
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>The header background reaches both edges, but its title lines up with this paragraph because both share <code className="font-mono text-[12px] text-foreground">max-w</code> and <code className="font-mono text-[12px] text-foreground">px</code>.</p>
            <div className="mt-4 h-20 rounded-lg border border-border bg-secondary/40" />
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['containers'] = ContainersSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
