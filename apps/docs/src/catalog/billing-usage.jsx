/* ============================================================================
   Gntik UI · billing-usage.jsx — "Billing & usage" subcategory (Data group).
   How to present usage and cost clearly: the current plan, quota meters,
   the next invoice breakdown, spend against budget, cost composition and
   invoice history. Brand green = healthy; amber near the cap, red on
   overage — severity is never confused with the brand. All tokens.
   Variants: current plan · usage meters · invoice summary ·
   spend vs budget · cost breakdown · history.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── wrapper: name + description + preview (card) + code ────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── compact segmented (toggle) ──────────────────────────────────────────── */
function Seg({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={"h-6 px-2.5 rounded-[5px] font-mono text-[11px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {o.label}
          </button>);
      })}
    </div>);
}

/* ── action buttons ──────────────────────────────────────────────────────── */
const GhostBtn = ({ children }) => (
  <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const PrimaryBtn = ({ children }) => (
  <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors">{children}</button>
);

/* ── quota meter · tone by % (green → amber → red on overage) ────────────── */
function Meter({ label, pct, used, total, unit, note }) {
  const tone = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
  const fill = { ok: 'bg-primary', warn: 'bg-warning', over: 'bg-destructive' }[tone];
  const txt = { ok: 'text-foreground', warn: 'text-warning', over: 'text-destructive' }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums whitespace-nowrap">
          <span className={"font-semibold " + txt}>{used}</span> / {total} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={"h-full rounded-full " + fill} style={{ width: Math.min(pct, 100) + '%', transition: 'width .4s ease' }} />
      </div>
      {note && <p className="mt-1.5 font-mono text-[11px] text-destructive">{note}</p>}
    </div>
  );
}

/* ── interactive download link (per row) ─────────────────────────────────── */
function DownloadLink({ size = 15, label = 'PDF' }) {
  const [done, setDone] = useState(false);
  const go = (e) => { e.preventDefault(); setDone(true); setTimeout(() => setDone(false), 1500); };
  return (
    <a href="#" onClick={go} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
      <Icon name={done ? 'check' : 'download'} size={size} />{done ? 'Downloaded' : label}
    </a>);
}

/* ════════════════════════════════════════════════════════════════════════
   DATA (sample workspace billing)
   ════════════════════════════════════════════════════════════════════════ */

/* meters: current cycle vs projected to end of cycle */
const USAGE = {
  current: [
    { label: 'Requests', pct: 83, used: '412,800', total: '500,000', unit: 'requests' },
    { label: 'Tokens', pct: 65, used: '78.4M', total: '120M', unit: 'tokens' },
    { label: 'Storage', pct: 71, used: '14.2', total: '20', unit: 'GB' },
    { label: 'Seats', pct: 76, used: '38', total: '50', unit: 'seats' },
  ],
  projected: [
    { label: 'Requests', pct: 104, used: '521,000', total: '500,000', unit: 'requests', note: '+21,000 over the plan · ~$63.00 overage' },
    { label: 'Tokens', pct: 82, used: '99.1M', total: '120M', unit: 'tokens' },
    { label: 'Storage', pct: 86, used: '17.1', total: '20', unit: 'GB' },
    { label: 'Seats', pct: 76, used: '38', total: '50', unit: 'seats' },
  ],
};

/* next invoice line items — some with a usage meter */
const INVOICE = [
  { name: 'Plan Scale', desc: 'Base subscription · monthly cycle', value: '$1,200.00' },
  { name: 'Requests', desc: '412,800 of 500,000 included', value: '$0.00', pct: 83 },
  { name: 'Tokens', desc: '78.4M of 120M included', value: '$0.00', pct: 65 },
  { name: 'Storage', desc: '14.2 GB of 20 GB included', value: '$0.00', pct: 71 },
  { name: 'US-East region', desc: 'Add-on · additional residency', value: '$180.00' },
  { name: 'Premium support', desc: 'Add-on · 1h SLA', value: '$240.00' },
];

/* cycle cost composition */
const BREAKDOWN = [
  { label: 'Compute', amount: '$740.00', pct: 45.7, dot: 'bg-primary' },
  { label: 'Tokens', amount: '$410.00', pct: 25.3, dot: 'bg-category-violet' },
  { label: 'Storage', amount: '$190.00', pct: 11.7, dot: 'bg-category-cyan' },
  { label: 'Add-ons', amount: '$280.00', pct: 17.3, dot: 'bg-muted-foreground' },
];

/* invoice history */
const HISTORY = [
  { period: 'May 2026', date: 'Due Jun 1', amount: '$1,620.00', status: 'due' },
  { period: 'April 2026', date: 'Paid May 1', amount: '$1,584.20', status: 'paid' },
  { period: 'March 2026', date: 'Paid Apr 1', amount: '$1,498.00', status: 'paid' },
  { period: 'February 2026', date: 'Paid Mar 1', amount: '$1,432.60', status: 'paid' },
];

const INVOICE_STATUS = {
  paid: ['Paid', 'bg-primary/14 text-primary'],
  due: ['Due', 'bg-warning/16 text-warning'],
};

/* ── snippets to paste ───────────────────────────────────────────────────── */
const C_METER = `// Meter — the tone is set by quota %: green healthy, amber near the
// cap, red on overage. The brand (green) never signals severity.
function Meter({ label, pct, used, total, unit, note }) {
  const tone = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  const fill = { ok: "bg-primary", warn: "bg-warning", over: "bg-destructive" }[tone];
  const txt  = { ok: "text-foreground", warn: "text-warning", over: "text-destructive" }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
          <span className={\`font-semibold \${txt}\`}>{used}</span> / {total} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={\`h-full rounded-full \${fill}\`}
             style={{ width: Math.min(pct, 100) + "%" }} />
      </div>
      {note && <p className="mt-1.5 font-mono text-[11px] text-destructive">{note}</p>}
    </div>
  );
}`;

const C_PLAN = `// Current plan — billing page header: plan, price per cycle,
// renewal and actions. The monthly/annual toggle recalculates the price.
<div className="rounded-lg border border-border bg-card p-6">
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-[17px] font-semibold tracking-tight text-foreground">Plan Scale</h3>
        <span className="rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">Active</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Renews June 1, 2026 · 50 seats · EU + US</p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums">$1,200</span>
        <span className="text-[13px] text-muted-foreground">/ month</span>
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold">Manage</button>
      <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold">Upgrade plan</button>
    </div>
  </div>
</div>`;

const C_INVOICE = `// Invoice summary — line items with their amount; metered ones show a
// thin usage meter. The footer closes with the cycle total.
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <ul className="divide-y divide-border">
    {items.map((it) => (
      <li key={it.name} className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13.5px] font-medium text-foreground">{it.name}</p>
          <p className="font-mono text-[13px] font-medium text-foreground tabular-nums">{it.value}</p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-[12px] text-muted-foreground">{it.desc}</p>
        </div>
        {it.pct != null && (
          <div className="mt-2 h-1.5 w-full max-w-[40%] rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: it.pct + "%" }} />
          </div>
        )}
      </li>
    ))}
  </ul>
  <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3.5">
    <span className="text-[13px] font-medium text-foreground">Estimated total · May cycle</span>
    <span className="font-mono text-[15px] font-semibold text-foreground tabular-nums">$1,620.00</span>
  </div>
</div>`;

const C_BUDGET = `// Spend vs budget — fill = MTD spend, ghost = projected, alert marker
// at 90%. Status is decided by projected vs cap, not by the brand colour.
<div className="relative pt-5">
  <div className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-warning" style={{ left: "90%" }}>Alert 90%</div>
  <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
    <div className="absolute inset-y-0 left-0 bg-primary/25" style={{ width: "84.5%" }} />
    <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: "59%" }} />
    <div className="absolute inset-y-0 bg-warning" style={{ left: "90%", width: "2px" }} />
  </div>
</div>`;

const C_BREAKDOWN = `// Cost breakdown — one bar segmented by category + legend with
// amount and %. Categorical token colours, not severity.
<div className="flex h-3 w-full overflow-hidden rounded-full">
  {parts.map((p) => (
    <div key={p.label} className={p.dot} style={{ width: p.pct + "%" }} title={p.label} />
  ))}
</div>
<ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
  {parts.map((p) => (
    <li key={p.label} className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[13px] text-foreground">
        <span className={\`h-2.5 w-2.5 rounded-[3px] \${p.dot}\`} />{p.label}
      </span>
      <span className="font-mono text-[12.5px] text-muted-foreground tabular-nums">{p.amount}</span>
    </li>
  ))}
</ul>`;

/* ════════════════════════════════════════════════════════════════════════ */
function BillingUsageSection() {
  const [cycle, setCycle] = useState('monthly');
  const [scope, setScope] = useState('current');
  const price = cycle === 'monthly'
    ? { big: '$1,200', unit: '/ month', note: 'Billed monthly' }
    : { big: '$1,000', unit: '/ month', note: 'Billed annually ($12,000) · 2 months free' };
  const meters = USAGE[scope];

  return (
    <div>
      <SectionHead kicker="Data" title="Billing & usage" status="done"
        intro="How to present usage and cost clearly. The current plan as a header, meters showing each quota against its cap, the next invoice breakdown, spend against the monthly budget, cost composition and history. One colour rule: brand green means healthy; amber warns near the cap and red marks overage — severity is never confused with the brand." />

      {/* 1 · Current plan */}
      <Variant title="Current plan"
        desc="The billing page header: the plan, its price per cycle, the renewal date and the actions. The monthly/annual toggle recalculates the price live."
        code={C_PLAN}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-semibold tracking-tight text-foreground">Plan Scale</h3>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />Active
              </span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">Renews June 1, 2026 · 50 seats · EU + US regions</p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-sans text-[30px] font-semibold tracking-tight text-foreground tabular-nums" style={{ letterSpacing: '-0.02em' }}>{price.big}</span>
              <span className="text-[13px] text-muted-foreground">{price.unit}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{price.note}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Seg value={cycle} onChange={setCycle} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual −16%' }]} />
            <div className="flex items-center gap-2">
              <GhostBtn>Manage</GhostBtn>
              <PrimaryBtn><Icon name="spark" size={15} />Upgrade plan</PrimaryBtn>
            </div>
          </div>
        </div>
      </Variant>

      {/* 2 · Usage meters */}
      <Variant title="Usage meters"
        desc="The core: each quota included in the plan with its usage bar. The fill is green while there is headroom, turns amber near the cap and red once exceeded. The toggle switches between current-cycle usage and the end-of-cycle projection — where requests already exceed the plan."
        code={C_METER}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <span className="text-[12px] font-medium text-muted-foreground">May cycle · Scale plan quotas</span>
          <Seg value={scope} onChange={setScope} options={[{ value: 'current', label: 'Current cycle' }, { value: 'projected', label: 'Projected' }]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {meters.map((m) => <Meter key={m.label} {...m} />)}
        </div>
      </Variant>

      {/* 3 · Invoice summary */}
      <Variant title="Invoice summary"
        desc="The next invoice breakdown: one line per item with its amount on the right. Metered items carry a thin meter to place usage at a glance. The footer closes with the cycle total."
        code={C_INVOICE}>
        <div className="max-w-[640px] rounded-lg border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {INVOICE.map((it) => (
              <li key={it.name} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[13.5px] font-medium text-foreground">{it.name}</p>
                  <p className="font-mono text-[13px] font-medium text-foreground tabular-nums">{it.value}</p>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{it.desc}</p>
                {it.pct != null && (
                  <div className="mt-2 h-1.5 w-full max-w-[44%] rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: it.pct + '%' }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary/40 px-5 py-3.5">
            <span className="text-[13px] font-medium text-foreground">Estimated total · May cycle</span>
            <span className="font-mono text-[15px] font-semibold text-foreground tabular-nums">$1,620.00</span>
          </div>
        </div>
      </Variant>

      {/* 4 · Spend vs budget */}
      <Variant title="Spend vs budget"
        desc="One bar to read the spend pace: the solid segment is spend to date, the ghost is the end-of-month projection and the alert marker flags 90% of the cap. Status is decided by the projection against the cap — green if it fits, not because it is the brand."
        code={C_BUDGET}>
        <div className="max-w-[640px]">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-[26px] font-semibold tracking-tight text-foreground tabular-nums" style={{ letterSpacing: '-0.02em' }}>$1,184.20</span>
              <span className="text-[12.5px] text-muted-foreground">of a $2,000.00 cap</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />Within cap
            </span>
          </div>
          <div className="relative pt-5">
            <div className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-warning whitespace-nowrap" style={{ left: '90%' }}>Alert 90%</div>
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary/25" style={{ width: '84.5%' }} />
              <div className="absolute inset-y-0 left-0 bg-primary rounded-r-full" style={{ width: '59%' }} />
              <div className="absolute inset-y-0 bg-warning" style={{ left: '90%', width: '2px' }} />
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {[['MTD spend', '$1,184.20', 'bg-primary'], ['Projected month end', '$1,690.00', 'bg-primary/25'], ['Monthly cap', '$2,000.00', 'bg-secondary']].map(([k, v, dot]) => (
              <div key={k}>
                <dt className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span className={"h-2 w-2 rounded-[2px] " + dot} />{k}
                </dt>
                <dd className="mt-1 font-mono text-[14px] font-semibold text-foreground tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Variant>

      {/* 5 · Cost breakdown */}
      <Variant title="Cost breakdown"
        desc="Where the cycle spend goes: a single bar segmented by category, with a legend repeating the amount and percentage. Uses the categorical token accents — not the severity colours — so amber and red keep their meaning."
        code={C_BREAKDOWN}>
        <div className="max-w-[560px]">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <span className="text-[12px] font-medium text-muted-foreground">Cycle cost by category</span>
            <span className="font-mono text-[13px] font-semibold text-foreground tabular-nums">$1,620.00</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary gap-0.5">
            {BREAKDOWN.map((p) => (
              <div key={p.label} className={p.dot} style={{ width: p.pct + '%' }} title={p.label} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {BREAKDOWN.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-foreground">
                  <span className={"h-2.5 w-2.5 rounded-[3px] shrink-0 " + p.dot} />{p.label}
                </span>
                <span className="font-mono text-[12.5px] text-muted-foreground tabular-nums whitespace-nowrap">{p.amount} · {p.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 6 · History */}
      <Variant title="History"
        desc="Past invoices in a compact table: period, status, amount and download. Status tells paid (green) from due (amber); each row downloads its PDF."
        code={`// Status: paid (brand green) vs due (amber) — download per row
<tr className="border-t border-border">
  <td className="py-3 text-[13px] font-medium text-foreground">April 2026</td>
  <td className="py-3">
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />Paid
    </span>
  </td>
  <td className="py-3 text-right font-mono text-[13px] text-foreground tabular-nums">$1,584.20</td>
  <td className="py-3 text-right"><a href="#" className="text-[12.5px] font-semibold text-primary">PDF</a></td>
</tr>`}>
        <div className="max-w-[640px] overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/40">
                <th className="px-4 py-2.5 text-left font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-right font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="px-4 py-2.5 text-right font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((r) => {
                const [label, cls] = INVOICE_STATUS[r.status];
                return (
                  <tr key={r.period} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium text-foreground">{r.period}</div>
                      <div className="text-[11.5px] text-muted-foreground">{r.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-semibold " + cls}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />{label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] text-foreground tabular-nums">{r.amount}</td>
                    <td className="px-4 py-3 text-right"><DownloadLink /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Variant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['billing-usage'] = BillingUsageSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
