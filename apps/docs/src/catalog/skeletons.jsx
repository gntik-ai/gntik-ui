/* ============================================================================
   Gntik UI · skeletons.jsx — skeleton / loading states ("Feedback" group).
   Loading placeholders that preserve layout: animate-pulse blocks on
   bg-muted. Primitive (lines, circle, rect), list, table and a real
   loading → loaded swap. Neutral fixtures. Tokens, no hardcoded colors.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useEffect } = window;

const Variant = ({ title, desc, code, surface = 'card', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-5 sm:p-7"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── primitive ───────────────────────────────────────────────────────────── */
const Sk = ({ className = '', style }) => <div style={style} className={"animate-pulse rounded-md bg-muted " + className} />;

/* ── 1 · BASE BLOCKS ─────────────────────────────────────────────────────── */
const SpecimenLabel = ({ children }) => <span className="mt-3 block font-mono text-[10.5px] text-muted-foreground/70">{children}</span>;
function Blocks() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
      <div>
        <div className="space-y-2">
          <Sk className="h-3 w-full" /><Sk className="h-3 w-full" /><Sk className="h-3 w-2/3" />
        </div>
        <SpecimenLabel>text · lines</SpecimenLabel>
      </div>
      <div>
        <Sk className="size-11 rounded-full" />
        <SpecimenLabel>avatar · circle</SpecimenLabel>
      </div>
      <div>
        <Sk className="aspect-[4/3] w-full rounded-lg" />
        <SpecimenLabel>media · rect</SpecimenLabel>
      </div>
      <div>
        <div className="flex flex-col gap-2">
          <Sk className="h-8 w-24 rounded-md" /><Sk className="h-5 w-16 rounded-full" />
        </div>
        <SpecimenLabel>button · pill</SpecimenLabel>
      </div>
    </div>
  );
}

/* ── 2 · LIST (stacked) ─────────────────────────────────────────────────── */
function ListSkeleton() {
  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Sk className="h-3.5 w-28" /><Sk className="h-7 w-20 rounded-md" />
      </div>
      <ul className="divide-y divide-border">
        {[68, 60, 72, 56].map((w, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Sk className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-3 rounded" style={{ width: w + '%' }} />
              <Sk className="h-2.5 w-2/5 rounded" />
            </div>
            <Sk className="h-5 w-14 shrink-0 rounded-full" />
            <Sk className="size-7 shrink-0 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 3 · TABLE ───────────────────────────────────────────────────────────── */
function TableSkeleton() {
  const COLS = ['38%', '20%', '16%', '14%', '12%'];
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-4 border-b border-border bg-secondary/40 px-4 py-2.5">
        {COLS.map((w, i) => <Sk key={i} className="h-2.5 rounded" style={{ width: i === 0 ? '22%' : '54px' }} />)}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5" style={{ width: COLS[0] }}>
              <Sk className="size-7 shrink-0 rounded-md" />
              <Sk className="h-3 flex-1 rounded" style={{ maxWidth: 150 - r * 12 }} />
            </div>
            <Sk className="h-3 rounded" style={{ width: COLS[1] }} />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-3 rounded" style={{ width: COLS[3] }} />
            <Sk className="ml-auto h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 4 · LOADING → LOADED (real swap) ─────────────────────────────────────── */
const STATS = [
  { label: 'Runs · 24h', value: '18,402', delta: '+12%', up: true },
  { label: 'Cost · 24h', value: '$1,284', delta: '−4%', up: false },
  { label: 'Latency p95', value: '842 ms', delta: '+38 ms', up: false },
  { label: 'Active services', value: '27', delta: '+3', up: true },
];
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Sk className="h-2.5 w-20 rounded" />
      <Sk className="mt-3.5 h-7 w-24 rounded" />
      <Sk className="mt-3 h-2.5 w-14 rounded" />
    </div>
  );
}
function StatCard({ s }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{s.label}</div>
      <div className="mt-2 font-sans text-[26px] font-bold leading-none tracking-tight text-foreground tabular-nums">{s.value}</div>
      <div className={"mt-2.5 inline-flex items-center gap-1 font-mono text-[11.5px] " + (s.up ? 'text-primary' : 'text-muted-foreground')}>
        <Icon name={s.up ? 'chart' : 'activity'} size={12} />{s.delta}
      </div>
    </div>
  );
}
function LoadSwap() {
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reload = () => { clearTimeout(timer.current); setLoading(true); timer.current = setTimeout(() => setLoading(false), 1600); };
  useEffect(() => { timer.current = setTimeout(() => setLoading(false), 1400); return () => clearTimeout(timer.current); }, []);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
          <span className={"size-1.5 rounded-full " + (loading ? 'animate-pulse bg-warning' : 'bg-primary')} />
          {loading ? 'Loading metrics…' : 'Updated a moment ago'}
        </div>
        <button onClick={reload} disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70 disabled:opacity-50">
          <Icon name="refresh" size={13} className={loading ? 'animate-spin text-muted-foreground' : 'text-muted-foreground'} />Reload
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? STATS.map((_, i) => <StatCardSkeleton key={i} />)
          : STATS.map(s => <StatCard key={s.label} s={s} />)}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SK = `// Primitive — a single pulsing block; compose the rest with sizes
const Skeleton = ({ className = "" }) =>
  <div className={"animate-pulse rounded-md bg-muted " + className} />;

// text lines
<div className="space-y-2">
  <Skeleton className="h-3 w-full" />
  <Skeleton className="h-3 w-full" />
  <Skeleton className="h-3 w-2/3" />
</div>
<Skeleton className="size-11 rounded-full" />   {/* avatar */}
<Skeleton className="aspect-[4/3] w-full rounded-lg" />  {/* media */}`;

const CODE_LIST = `// List — mirrors the real row: avatar + two lines + meta + action
<li className="flex items-center gap-3 px-4 py-3.5">
  <Skeleton className="size-9 shrink-0 rounded-full" />
  <div className="min-w-0 flex-1 space-y-2">
    <Skeleton className="h-3 w-2/3 rounded" />
    <Skeleton className="h-2.5 w-2/5 rounded" />
  </div>
  <Skeleton className="h-5 w-14 rounded-full" />
  <Skeleton className="size-7 rounded-md" />
</li>`;

const CODE_TABLE = `// Table — faint header + rows; the name width shrinks per row
<div className="flex items-center gap-4 px-4 py-3.5">
  <div className="flex min-w-0 items-center gap-2.5" style={{ width: "38%" }}>
    <Skeleton className="size-7 shrink-0 rounded-md" />
    <Skeleton className="h-3 flex-1 rounded" style={{ maxWidth: 150 - row * 12 }} />
  </div>
  <Skeleton className="h-3 rounded" style={{ width: "20%" }} />
  <Skeleton className="h-5 w-16 rounded-full" />
  <Skeleton className="h-3 rounded" style={{ width: "14%" }} />
  <Skeleton className="ml-auto h-3 w-10 rounded" />
</div>`;

const CODE_SWAP = `// Real swap — same grid, swaps placeholder for content
{loading
  ? STATS.map((_, i) => <StatCardSkeleton key={i} />)
  : STATS.map((s) => <StatCard key={s.label} s={s} />)}

// trigger the load
const reload = () => {
  setLoading(true);
  setTimeout(() => setLoading(false), 1600);
};`;

/* ── section ─────────────────────────────────────────────────────────────── */
function SkeletonsSection() {
  return (
    <div>
      <SectionHead kicker="Feedback" title="Skeletons" status="done"
        intro="While data is on its way, instead of a centered spinner or a layout jump, the skeleton of the content is drawn: animate-pulse blocks on bg-muted that take exactly the space of what is loading. The rule is to mirror the real shape — same heights, same widths, same grid — so the switch to content is imperceptible. A single primitive (Skeleton) composes every case." />

      <Variant title="Base blocks" surface="dots"
        desc="The primitive and its shapes: text lines of decreasing width, a circle for avatars, an aspect-ratio rectangle for media and pills for buttons/tags. It's all the same <Skeleton> with a different size and radius."
        code={CODE_SK}>
        <Blocks />
      </Variant>

      <Variant title="List"
        desc="The skeleton of a stacked list: each row mirrors the avatar, two text lines (varied widths so it doesn't look like a pattern), its status badge and the action button."
        code={CODE_LIST}>
        <ListSkeleton />
      </Variant>

      <Variant title="Table"
        desc="For dense tables: a faint header and rows with the resource icon, its name of decreasing width, a text column, the status pill and the right-aligned metric."
        code={CODE_TABLE}>
        <TableSkeleton />
      </Variant>

      <Variant title="Loading → loaded"
        desc="The real case: the same grid of stat cards is drawn as a skeleton and, once resolved, swaps to the values without moving anything. Click “Reload” to see it again."
        code={CODE_SWAP}>
        <LoadSwap />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['skeletons'] = SkeletonsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
