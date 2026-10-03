/* ============================================================================
   Gntik UI · spinners.jsx — loading indicators ("Feedback" group).
   For short, indeterminate waits where a skeleton doesn't fit: three dots in
   a wave, circular ring (SVG arc + border variant) and a brand loader with
   the preset's glyph. Active segment always in brand green; color comes from
   text-* (currentColor) and size from width/height. Neutral fixtures, all
   tokens, no hardcoded colors (except the brand glyph).
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, MusematicMark, Wordmark, useState, useRef, useEffect } = window;

/* module-specific keyframes (the rest use Tailwind's animate-spin) */
const SPINNER_KEYFRAMES =
  '@keyframes museDot{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}' +
  '@keyframes museBreathe{0%,100%{opacity:.35;transform:scale(.88)}50%{opacity:1;transform:scale(1)}}';

const Variant = ({ title, desc, code, surface = 'dots', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-6 sm:p-8"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);
const Spec = ({ children }) => <span className="mt-3 block text-center font-mono text-[10.5px] text-muted-foreground/70">{children}</span>;
const Cell = ({ label, children }) => (
  <div className="flex flex-col items-center">
    <div className="flex h-12 items-center justify-center">{children}</div>
    <Spec>{label}</Spec>
  </div>
);

/* ── 1 · CIRCULAR (SVG arc) ──────────────────────────────────────────────── */
function Ring({ size = 24, stroke, tone = 'primary' }) {
  const sw = stroke || Math.max(2, Math.round(size * 0.11));
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const cls = tone === 'muted' ? 'text-muted-foreground' : tone === 'current' ? '' : 'text-primary';
  return (
    <svg width={size} height={size} role="status" aria-label="Loading" className={"animate-spin " + cls} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeOpacity="0.22" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * 0.72} />
    </svg>
  );
}
/* border variant — a single element (same as the Monaco loader) */
const RingBorder = ({ size = 28, stroke = 3 }) => (
  <span role="status" aria-label="Loading" className="inline-block rounded-full border-border border-t-primary animate-spin"
    style={{ width: size, height: size, borderWidth: stroke, borderStyle: 'solid' }} />
);
function CircularRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-9 gap-y-4">
      <Cell label="16">  <Ring size={16} /></Cell>
      <Cell label="22">  <Ring size={22} /></Cell>
      <Cell label="28">  <Ring size={28} /></Cell>
      <Cell label="44">  <Ring size={44} /></Cell>
      <Cell label="neutral"><Ring size={28} tone="muted" /></Cell>
      <Cell label="borders"> <RingBorder size={28} /></Cell>
    </div>
  );
}

/* ── 2 · THREE DOTS (wave) ───────────────────────────────────────────────── */
function Dots({ dot = 7, gap = 5, tone = 'primary' }) {
  const color = tone === 'muted' ? 'bg-muted-foreground' : tone === 'current' ? 'bg-current' : 'bg-primary';
  return (
    <span role="status" aria-label="Loading" className="inline-flex items-center" style={{ gap }}>
      {[0, 1, 2].map(i => (
        <span key={i} className={"rounded-full " + color}
          style={{ width: dot, height: dot, animation: 'museDot 1.05s ease-in-out infinite', animationDelay: (i - 2) * 0.16 + 's' }} />
      ))}
    </span>
  );
}
function DotsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
      <Cell label="sm"><Dots dot={6} gap={4} /></Cell>
      <Cell label="md"><Dots dot={9} gap={6} /></Cell>
      <Cell label="lg"><Dots dot={13} gap={8} /></Cell>
      <Cell label="neutral"><Dots dot={9} gap={6} tone="muted" /></Cell>
      <Cell label="in button">
        <button disabled className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground opacity-90">
          <Dots dot={5} gap={3.5} tone="current" />Saving…
        </button>
      </Cell>
    </div>
  );
}

/* ── 3 · BRAND (preset glyph) ───────────────────────────────────────────────── */
function BrandSpin({ size = 64 }) {
  const stroke = Math.max(2, Math.round(size * 0.05));
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const inner = Math.round(size * 0.46);
  return (
    <span role="status" aria-label="Loading" className="relative inline-grid place-items-center text-primary" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="animate-spin absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeOpacity="0.18" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * 0.72} />
      </svg>
      <MusematicMark s={inner} />
    </span>
  );
}
const BrandBreathe = ({ size = 44 }) => (
  <span role="status" aria-label="Loading" className="inline-block text-primary" style={{ animation: 'museBreathe 1.5s ease-in-out infinite' }}>
    <MusematicMark s={size} />
  </span>
);
function BrandRow() {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-x-9 gap-y-6">
      <Cell label="mark + ring"><div className="flex h-16 items-center"><BrandSpin size={60} /></div></Cell>
      <Cell label="breathing"><div className="flex h-16 items-center"><BrandBreathe size={42} /></div></Cell>
      {/* boot splash — product startup screen */}
      <div className="flex flex-col items-center">
        <div className="flex h-16 items-center">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-chrome px-10 py-7 shadow-sm">
            <Wordmark s={30} fs={20} />
            <div className="flex items-center gap-2.5">
              <Ring size={15} tone="muted" />
              <span className="font-mono text-[11.5px] text-muted-foreground">Starting up…</span>
            </div>
          </div>
        </div>
        <Spec>boot splash</Spec>
      </div>
    </div>
  );
}

/* ── 4 · IN CONTEXT (real swap, interactive) ─────────────────────────────── */
const AGENTS = [
  { name: 'support-triage', runs: '1.2k runs' },
  { name: 'invoice-parser', runs: '840 runs' },
  { name: 'lead-router', runs: '305 runs' },
];
function ContextDemo() {
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  const start = () => { clearTimeout(timer.current); setLoading(true); timer.current = setTimeout(() => setLoading(false), 1700); };
  useEffect(() => { start(); return () => clearTimeout(timer.current); }, []);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 text-muted-foreground">
          <Ring size={15} tone="current" />
          <span className="font-mono text-[12px]">{loading ? 'Syncing services…' : 'Services synced'}</span>
        </div>
        <button onClick={start} disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70 disabled:opacity-50">
          <Icon name="refresh" size={13} className={(loading ? 'animate-spin ' : '') + 'text-muted-foreground'} />Reload
        </button>
      </div>
      <div className="relative h-[152px] overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <BrandSpin size={50} />
            <span className="font-mono text-[11px] text-muted-foreground">Loading services…</span>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {AGENTS.map(a => (
              <li key={a.name} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid size-7 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="bot" size={15} /></span>
                <span className="flex-1 text-[13px] font-medium text-foreground">{a.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{a.runs}</span>
                <span className="size-1.5 rounded-full bg-primary" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_RING = `// Circular — track at 0.22 opacity + round-cap arc, animate-spin.
// Color comes from text-* (currentColor); size from width/height.
function Spinner({ size = 24, className = "text-primary" }) {
  const sw = Math.max(2, Math.round(size * 0.11));
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} role="status" className={"animate-spin " + className}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeOpacity="0.22" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * 0.72} />
    </svg>
  );
}

// Border variant — a single element, no SVG:
<span className="inline-block size-7 rounded-full border-[3px] border-border border-t-primary animate-spin" />`;

const CODE_DOTS = `/* keyframes — add once to your global CSS */
@keyframes museDot { 0%,80%,100% { transform: scale(.5); opacity:.3 } 40% { transform: scale(1); opacity:1 } }

// Three dots — the negative delay starts the wave mid-cycle.
function Dots({ dot = 7, gap = 5, className = "bg-primary" }) {
  return (
    <span className="inline-flex items-center" style={{ gap }} role="status">
      {[0, 1, 2].map((i) => (
        <span key={i} className={"rounded-full " + className}
          style={{ width: dot, height: dot, animation: "museDot 1.05s ease-in-out infinite",
                   animationDelay: (i - 2) * 0.16 + "s" }} />
      ))}
    </span>
  );
}

// In a button: inherits the color with bg-current on brand green.
<button disabled className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-primary-foreground">
  <Dots dot={5} gap={3.5} className="bg-current" /> Saving…
</button>`;

const CODE_BRAND = `/* keyframes — logo breathing */
@keyframes museBreathe { 0%,100% { opacity:.35; transform:scale(.88) } 50% { opacity:1; transform:scale(1) } }

// A · static mark + ring spinning around it (MusematicMark inherits text-primary)
<span className="relative inline-grid size-16 place-items-center text-primary">
  <svg width={64} height={64} className="absolute inset-0 animate-spin">
    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.18" />
    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * 0.72} />
  </svg>
  <MusematicMark s={30} />
</span>

// B · brand breathing
<span className="inline-block text-primary" style={{ animation: "museBreathe 1.5s ease-in-out infinite" }}>
  <MusematicMark s={44} />
</span>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function SpinnersSection() {
  return (
    <div>
      <style>{SPINNER_KEYFRAMES}</style>
      <SectionHead kicker="Feedback" title="Spinners" status="done"
        intro="The indicator for short, indeterminate waits — a request in flight, a save, a startup — where progress is unknown and mirroring the layout with a skeleton doesn't fit. Three forms: wave dots for inline use, a circular ring for general use and a brand loader for startup screens. The active segment is always brand green; color is inherited from text-* and size is set with width/height. Rule: if you are about to show structured content, prefer a skeleton; the spinner is for brief waits or content with no predictable shape." />

      <Variant title="Circular"
        desc="The general-purpose spinner: a faint track (currentColor at 22%) with a spinning round-cap arc. As SVG it scales crisply to any size; the border variant does the same with a single element. Inherits its color from text-* — brand green by default, neutral for secondary use."
        code={CODE_RING}>
        <CircularRow />
      </Variant>

      <Variant title="Three dots"
        desc="Three dots pulsing in a wave — the negative delay starts mid-cycle, so there's no initial “jump”. Lightweight and fits inline: inside a button while saving, next to a status label or in an input."
        code={CODE_DOTS}>
        <DotsRow />
      </Variant>

      <Variant title="Brand"
        desc="The brand loader for product startup: the preset's glyph standing still with a ring spinning around it, or breathing in opacity. Combined with the wordmark on bg-chrome it makes the boot screen."
        code={CODE_BRAND}>
        <BrandRow />
      </Variant>

      <Variant title="In context" surface="card"
        desc="The real swap: while the response is on its way, the panel shows the centered brand loader; once resolved, it swaps to the list of services without moving the frame. Click “Reload” to see it again.">
        <ContextDemo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['spinners'] = SpinnersSection;
})();
