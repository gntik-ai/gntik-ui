/* ============================================================================
   Gntik UI · progress-bars.jsx — progress ("Navigation" group).
   Linear bar with label, steps (wizard) with live progress, circular SVG
   ring, and segmented bar (quota usage). Fill in brand green; track in
   bg-secondary. Neutral fixtures, all tokens.
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

/* ── 1 · LINEAR BAR ──────────────────────────────────────────────────────── */
function Linear() {
  const rows = [
    ['Indexing documents', 72, 'primary'],
    ['Migrating policies', 100, 'success'],
    ['Rebuilding cache', 34, 'primary'],
  ];
  const fill = { primary: 'bg-primary', success: 'bg-success' };
  const txt = { primary: 'text-foreground', success: 'text-success' };
  return (
    <div className="flex flex-col gap-5 max-w-md">
      {rows.map(([label, v, tone]) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-medium text-foreground">{label}</span>
            <span className={"font-mono text-[11.5px] font-semibold " + txt[tone]}>{v}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className={"h-full rounded-full " + fill[tone]} style={{ width: v + '%', transition: 'width .4s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 2 · STEPS (wizard) ──────────────────────────────────────────────────── */
const STEPS = ['Connect', 'Permissions', 'Policies', 'Review'];
function Steps() {
  const [cur, setCur] = useState(1); // current step index (0-based)
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < cur, active = i === cur;
          return (
            <React.Fragment key={s}>
              <button onClick={() => setCur(i)} className="flex flex-col items-center gap-2 shrink-0 group">
                <span className={"grid size-8 place-items-center rounded-full text-[12px] font-bold transition-colors " +
                  (done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/14 text-primary ring-2 ring-primary' : 'bg-secondary text-muted-foreground ring-1 ring-border group-hover:text-foreground')}>
                  {done ? <Icon name="check" size={16} /> : i + 1}
                </span>
                <span className={"text-[12px] font-medium whitespace-nowrap " + (active ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-6 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: i < cur ? '100%' : '0%', transition: 'width .4s ease' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-7">
        <button onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-[12.5px] font-medium text-foreground transition-colors hover:border-ring/50 disabled:opacity-40 disabled:pointer-events-none">
          <Icon name="chevronLeft" size={14} />Back
        </button>
        <button onClick={() => setCur(c => Math.min(STEPS.length - 1, c + 1))} disabled={cur === STEPS.length - 1}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12.5px] font-semibold transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none">
          Next<Icon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── 3 · CIRCULAR (SVG) ──────────────────────────────────────────────────── */
function Ring({ value, size = 96, label, sub }) {
  const stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-secondary" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-primary"
            strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .5s ease' }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-[18px] font-bold text-foreground tabular-nums">{value}<span className="text-[11px] text-muted-foreground">%</span></span>
        </div>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[12.5px] font-medium text-foreground">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
function Circular() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      <Ring value={68} label="Budget" sub="$3.4k / $5k" />
      <Ring value={92} label="SLA met" sub="last 30 d" />
      <Ring value={24} label="GPU quota" sub="vCPU-h" />
    </div>
  );
}

/* ── 4 · SEGMENTED ───────────────────────────────────────────────────────── */
function Segmented() {
  const used = 7, total = 10;
  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] font-medium text-foreground">Seats</span>
        <span className="font-mono text-[11.5px] text-muted-foreground"><span className="text-foreground font-semibold">{used}</span> / {total}</span>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={"h-2.5 flex-1 rounded-sm " + (i < used ? 'bg-primary' : 'bg-secondary')} />
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-muted-foreground"><span className="font-mono text-foreground">{total - used}</span> seats left on the current plan.</p>
    </div>
  );
}

const CODE_LINEAR = `// Linear bar — bg-secondary track, bg-primary fill (success when complete)
<div>
  <div className="flex items-center justify-between mb-1.5">
    <span className="text-[12.5px] font-medium text-foreground">{label}</span>
    <span className="font-mono text-[11.5px] font-semibold text-foreground">{value}%</span>
  </div>
  <div className="h-2 rounded-full bg-secondary overflow-hidden">
    <div className="h-full rounded-full bg-primary" style={{ width: value + "%", transition: "width .4s ease" }} />
  </div>
</div>`;

const CODE_RING = `// Ring — two SVG circles; progress uses strokeDasharray/offset
const stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
<svg width={size} height={size} className="-rotate-90">
  <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="stroke-secondary" />
  <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-primary"
    strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset .5s ease" }} />
</svg>`;

function ProgressBarsSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Progress bars" status="done"
        intro="Progress indicators for long tasks, wizards and quota usage. Linear bar with label and percentage, steps for a wizard with live progress, a circular SVG ring, and a segmented bar for seats or credits. The fill is always brand green; success green only on completion." />

      <Variant title="Linear"
        desc="The base indicator: track on bg-secondary and fill in primary. At 100% it switches to success green."
        code={CODE_LINEAR}>
        <Linear />
      </Variant>

      <Variant title="Steps"
        desc="For multi-step wizards: completed steps get a check, the current one a ring. Use Back/Next or click a step.">
        <Steps />
      </Variant>

      <Variant title="Circular"
        desc="SVG ring with the percentage in the center — for compact KPIs in a metric card."
        code={CODE_RING}>
        <Circular />
      </Variant>

      <Variant title="Segmented"
        desc="Discrete segments to count consumed units: seats, credits or licenses.">
        <Segmented />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['progress-bars'] = ProgressBarsSection;
})();
