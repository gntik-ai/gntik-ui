/* ============================================================================
   Gntik UI · donut-charts.jsx — "Donut charts" subcategory (Charts group).
   Share of a total across categories. Spend by team (donut/pie with the total
   in the centre) and by region. Side legend that isolates slices. Live theme.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, ChartSegmented, DonutChart, chartFmt } = window;
const { useState } = React;

const SPEND = [
  { team: 'Support', spend: 4210 },
  { team: 'Sales', spend: 2680 },
  { team: 'Data', spend: 1940 },
  { team: 'Product', spend: 1320 },
  { team: 'Trust & Safety', spend: 760 },
];
const REGION = [
  { region: 'eu-west-1', spend: 5120 },
  { region: 'us-east-1', spend: 3460 },
  { region: 'ap-south-1', spend: 1480 },
  { region: 'sa-east-1', spend: 850 },
];

/* breakdown of a total with switchable dimensions (tabs) — spend card pattern */
const BREAKDOWN = [
  { key: 'service', label: 'service', dim: 'Service', data: [
    { name: 'contract-summarize', amount: 5820, share: '29.8%', bar: 'bg-primary' },
    { name: 'lead-enrich', amount: 4310, share: '22.1%', bar: 'bg-category-violet' },
    { name: 'pii-redaction', amount: 3940, share: '20.2%', bar: 'bg-category-cyan' },
    { name: 'invoice-parse', amount: 3180, share: '16.3%', bar: 'bg-category-amber' },
    { name: 'ticket-router', amount: 2260, share: '11.6%', bar: 'bg-category-rose' },
  ] },
  { key: 'resource', label: 'resource', dim: 'Resource', data: [
    { name: 'compute', amount: 8140, share: '41.7%', bar: 'bg-primary' },
    { name: 'database', amount: 5460, share: '28.0%', bar: 'bg-category-violet' },
    { name: 'storage', amount: 2930, share: '15.0%', bar: 'bg-category-cyan' },
    { name: 'network', amount: 1720, share: '8.8%', bar: 'bg-category-amber' },
    { name: 'cdn', amount: 1260, share: '6.5%', bar: 'bg-category-rose' },
  ] },
];

const C_DONUT = `<DonutChart
  data={spend}
  index="team"
  category="spend"
  variant="donut"              // or "pie"
  centerLabel="Spend / month"
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
/>`;

const C_REGION = `<DonutChart
  data={region}
  index="region"
  category="spend"
  variant="donut"
  centerLabel="By region"
  colors={["primary", "cyan", "violet", "amber"]}
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
/>`;

const C_TABS = `const TABS = [
  { name: "service", dim: "Service", data: byService },
  { name: "resource", dim: "Resource", data: byResource },
];

function ExpensesBreakdown() {
  const [tab, setTab] = useState(0);
  const active = TABS[tab];
  return (
    <div className="rounded-lg border border-border bg-card sm:mx-auto sm:max-w-lg">
      <div className="px-6 pt-6">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          Spend breakdown
        </h3>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          This month's spend split; switch the dimension with the tabs.
        </p>
      </div>
      <div className="mt-4 flex gap-5 border-b border-border px-6">
        {TABS.map((t, i) => (
          <button key={t.name} type="button" onClick={() => setTab(i)}
            className={\`relative -mb-px whitespace-nowrap pb-2.5 text-[13px] font-medium transition-colors \${i === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}\`}>
            By {t.name}
            {i === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="mt-6 flex justify-center">
          <DonutChart
            data={active.data}
            index="name"
            category="amount"
            colors={["primary", "violet", "cyan", "amber", "rose"]}
            showLegend={false}
            centerLabel="Spend / month"
            valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
            height={232}
          />
        </div>
        <p className="mt-8 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>{active.dim}</span>
          <span>Amount / Share</span>
        </p>
        <ul role="list" className="mt-2 divide-y divide-border">
          {active.data.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-6 py-2.5">
              <div className="flex items-center gap-2.5 truncate">
                <span className={\`\${item.bar} size-2.5 shrink-0 rounded-sm\`} />
                <span className="truncate text-[13px] text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-medium tabular-nums text-foreground">
                  {\`$\${item.amount.toLocaleString()}\`}
                </span>
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
                  {item.share}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}`;

function DonutChartsSection() {
  const [variant, setVariant] = useState('donut');
  const [dtab, setDtab] = useState(0);
  const active = BREAKDOWN[dtab];
  return (
    <div>
      <SectionHead kicker="Charts" title="Donut charts" status="done"
        intro="Share of a total across categories. The donut keeps the total figure in the centre; the legend lists each slice with its value and isolates it on click. Switch between donut and pie." />

      <ChartVariant title="Donut / Pie" desc="Spend by team this month. The total lives in the centre of the donut; the segmented control switches to pie." code={C_DONUT}>
        <ChartCard title="Spend by team · June"
          action={<ChartSegmented value={variant} onChange={setVariant} options={[{ value: 'donut', label: 'Donut' }, { value: 'pie', label: 'Pie' }]} />}>
          <DonutChart data={SPEND} index="team" category="spend" colors={['primary', 'violet', 'cyan', 'amber', 'rose']}
            variant={variant} centerLabel="Spend / month" valueFormatter={chartFmt.usd} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="By region" desc="The same split with another dimension — spend by deployment region. Fewer slices, a narrower palette." code={C_REGION}>
        <ChartCard title="Spend by region · June">
          <DonutChart data={REGION} index="region" category="spend" colors={['primary', 'cyan', 'violet', 'amber']}
            variant="donut" centerLabel="By region" valueFormatter={chartFmt.usd} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Tabs + breakdown" desc="A compact card that splits a total and lets you switch dimension with tabs. Below the donut, a list with colour swatch, amount and percentage badge. The classic spend card pattern." code={C_TABS}>
        <div className="rounded-lg border border-border bg-card sm:mx-auto sm:max-w-lg">
          <div className="px-6 pt-6">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Spend breakdown</h3>
            <p className="mt-1 text-[13px] leading-6 text-muted-foreground">This month's spend split; switch the dimension with the tabs.</p>
          </div>
          <div className="mt-4 flex gap-5 border-b border-border px-6">
            {BREAKDOWN.map((t, i) => (
              <button key={t.key} type="button" onClick={() => setDtab(i)}
                className={"relative -mb-px whitespace-nowrap pb-2.5 text-[13px] font-medium transition-colors " + (i === dtab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                By {t.label}
                {i === dtab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <div className="px-6 pb-6">
            <div className="mt-6 flex justify-center">
              <DonutChart data={active.data} index="name" category="amount" colors={['primary', 'violet', 'cyan', 'amber', 'rose']}
                variant="donut" showLegend={false} centerLabel="Spend / month" valueFormatter={chartFmt.usd} height={232} />
            </div>
            <p className="mt-8 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{active.dim}</span>
              <span>Amount / Share</span>
            </p>
            <ul role="list" className="mt-2 divide-y divide-border">
              {active.data.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-6 py-2.5">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={item.bar + ' size-2.5 shrink-0 rounded-sm'} aria-hidden={true} />
                    <span className="truncate text-[13px] text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-medium text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usd(item.amount)}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.share}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['donut-charts'] = DonutChartsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
