/* ============================================================================
   Gntik UI · line-charts.jsx — "Line charts" subcategory (Charts group).
   Thin series to compare trends. Latency by percentile (multi) and success
   rate (single series). Tooltip + interactive legend, live theme.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, LineChart, chartFmt, Icon } = window;

const LATENCY = [
  { day: 'Mon', p50: 240, p95: 880, p99: 1520 },
  { day: 'Tue', p50: 232, p95: 910, p99: 1610 },
  { day: 'Wed', p50: 251, p95: 1020, p99: 1840 },
  { day: 'Thu', p50: 244, p95: 870, p99: 1490 },
  { day: 'Fri', p50: 268, p95: 1140, p99: 2010 },
  { day: 'Sat', p50: 210, p95: 760, p99: 1280 },
  { day: 'Sun', p50: 198, p95: 720, p99: 1190 },
];
const SUCCESS = [
  { day: 'Mon', Success: 97.1 }, { day: 'Tue', Success: 97.6 }, { day: 'Wed', Success: 96.4 },
  { day: 'Thu', Success: 98.0 }, { day: 'Fri', Success: 97.2 }, { day: 'Sat', Success: 98.4 }, { day: 'Sun', Success: 98.7 },
];

const C_MULTI = `<LineChart
  data={latency}
  index="day"
  categories={["p50", "p95", "p99"]}
  colors={["primary", "cyan", "violet"]}
  valueFormatter={(v) => \`\${v} ms\`}
/>`;

const C_SINGLE = `<LineChart
  data={success}
  index="day"
  categories={["Success"]}
  colors={["primary"]}
  valueFormatter={(v) => \`\${v}%\`}
  showLegend={false}
/>`;

/* multi-series + side summary panel (dashboard card pattern) */
const RUNS = [
  { date: 'Jun 1', 'contract-summarize': 212, 'pii-redaction': 124, 'lead-enrich': 521 },
  { date: 'Jun 2', 'contract-summarize': 198, 'pii-redaction': 141, 'lead-enrich': 540 },
  { date: 'Jun 3', 'contract-summarize': 234, 'pii-redaction': 162, 'lead-enrich': 498 },
  { date: 'Jun 4', 'contract-summarize': 221, 'pii-redaction': 158, 'lead-enrich': 510 },
  { date: 'Jun 5', 'contract-summarize': 256, 'pii-redaction': 184, 'lead-enrich': 472 },
  { date: 'Jun 6', 'contract-summarize': 248, 'pii-redaction': 203, 'lead-enrich': 455 },
  { date: 'Jun 7', 'contract-summarize': 272, 'pii-redaction': 221, 'lead-enrich': 430 },
  { date: 'Jun 8', 'contract-summarize': 265, 'pii-redaction': 248, 'lead-enrich': 441 },
  { date: 'Jun 9', 'contract-summarize': 289, 'pii-redaction': 272, 'lead-enrich': 410 },
  { date: 'Jun 10', 'contract-summarize': 301, 'pii-redaction': 295, 'lead-enrich': 388 },
  { date: 'Jun 11', 'contract-summarize': 296, 'pii-redaction': 318, 'lead-enrich': 372 },
  { date: 'Jun 12', 'contract-summarize': 318, 'pii-redaction': 342, 'lead-enrich': 360 },
  { date: 'Jun 13', 'contract-summarize': 332, 'pii-redaction': 371, 'lead-enrich': 341 },
  { date: 'Jun 14', 'contract-summarize': 327, 'pii-redaction': 398, 'lead-enrich': 322 },
  { date: 'Jun 15', 'contract-summarize': 354, 'pii-redaction': 421, 'lead-enrich': 300 },
  { date: 'Jun 16', 'contract-summarize': 369, 'pii-redaction': 438, 'lead-enrich': 281 },
  { date: 'Jun 17', 'contract-summarize': 358, 'pii-redaction': 442, 'lead-enrich': 268 },
  { date: 'Jun 18', 'contract-summarize': 382, 'pii-redaction': 430, 'lead-enrich': 247 },
  { date: 'Jun 19', 'contract-summarize': 401, 'pii-redaction': 412, 'lead-enrich': 233 },
  { date: 'Jun 20', 'contract-summarize': 396, 'pii-redaction': 388, 'lead-enrich': 220 },
  { date: 'Jun 21', 'contract-summarize': 423, 'pii-redaction': 364, 'lead-enrich': 232 },
  { date: 'Jun 22', 'contract-summarize': 418, 'pii-redaction': 341, 'lead-enrich': 210 },
  { date: 'Jun 23', 'contract-summarize': 441, 'pii-redaction': 318, 'lead-enrich': 198 },
  { date: 'Jun 24', 'contract-summarize': 437, 'pii-redaction': 302, 'lead-enrich': 187 },
  { date: 'Jun 25', 'contract-summarize': 466, 'pii-redaction': 281, 'lead-enrich': 176 },
  { date: 'Jun 26', 'contract-summarize': 489, 'pii-redaction': 263, 'lead-enrich': 168 },
  { date: 'Jun 27', 'contract-summarize': 502, 'pii-redaction': 244, 'lead-enrich': 161 },
  { date: 'Jun 28', 'contract-summarize': 528, 'pii-redaction': 228, 'lead-enrich': 154 },
  { date: 'Jun 29', 'contract-summarize': 547, 'pii-redaction': 209, 'lead-enrich': 147 },
  { date: 'Jun 30', 'contract-summarize': 581, 'pii-redaction': 192, 'lead-enrich': 141 },
];
const SUMMARY = [
  { name: 'contract-summarize', value: '581', bar: 'bg-primary' },
  { name: 'pii-redaction', value: '192', bar: 'bg-category-violet' },
  { name: 'lead-enrich', value: '141', bar: 'bg-category-cyan' },
];

const C_COMPARE = `<div className="rounded-lg border border-border bg-card p-5">
  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
    Runs per service
  </h3>
  <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
    Daily run volume · June
  </p>
  <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
    <div className="md:col-span-3">
      <LineChart
        data={runs}
        index="date"
        categories={["contract-summarize", "pii-redaction", "lead-enrich"]}
        colors={["primary", "violet", "cyan"]}
        valueFormatter={(v) => v.toLocaleString()}
        showLegend={false}
      />
    </div>
    <div className="md:col-span-1">
      <ul role="list" className="space-y-6">
        {summary.map((item) => (
          <li key={item.name} className="flex gap-3">
            <span className={\`\${item.bar} w-1 shrink-0 rounded\`} aria-hidden />
            <div className="flex w-full items-center justify-between md:block">
              <p className="order-last font-mono font-semibold text-foreground">
                {item.value}
              </p>
              <p className="order-first whitespace-nowrap text-[13px] text-muted-foreground">
                {item.name}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-6 inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary hover:text-primary/80">
        <Plus className="size-4 shrink-0" />
        Compare service
      </button>
    </div>
  </div>
</div>`;

const C_TWOCARD = `<>
  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
    Runs per service
  </h3>
  <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
    Daily run volume · June
  </p>
  <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
      {/* desktop: full chart with Y axis */}
      <div className="hidden sm:block">
        <LineChart
          data={runs}
          index="date"
          categories={["contract-summarize", "pii-redaction", "lead-enrich"]}
          colors={["primary", "violet", "cyan"]}
          valueFormatter={(v) => v.toLocaleString()}
          showLegend={false}
        />
      </div>
      {/* mobile: compact — X-axis ends only, no Y axis */}
      <div className="sm:hidden">
        <LineChart
          data={runs}
          index="date"
          categories={["contract-summarize", "pii-redaction", "lead-enrich"]}
          colors={["primary", "violet", "cyan"]}
          valueFormatter={(v) => v.toLocaleString()}
          showLegend={false}
          showYAxis={false}
          startEndOnly
        />
      </div>
    </div>
    <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
      <ul role="list" className="divide-y divide-border">
        {summary.map((item) => (
          <li key={item.name} className="flex gap-3 py-4 first:pt-0">
            <span className={\`\${item.bar} w-1 shrink-0 rounded\`} aria-hidden />
            <div className="flex w-full items-center justify-between gap-4 truncate">
              <p className="truncate text-[13px] text-muted-foreground">
                {item.name}
              </p>
              <p className="font-mono font-medium text-foreground">
                {item.value}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-4 inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary hover:text-primary/80">
        <Plus className="size-4 shrink-0" />
        Compare service
      </button>
    </div>
  </div>
</>`;

function LineChartsSection() {
  return (
    <div>
      <SectionHead kicker="Charts" title="Line charts" status="done"
        intro="Several thin series to compare trends. The median against the tail, a rate over time. Click the legend to isolate a percentile." />

      <ChartVariant title="Multi-series" desc="Latency by percentile (p50 · p95 · p99). The median stays flat while the tail spikes on Fridays." code={C_MULTI}>
        <ChartCard title="Latency by percentile · 7 days" value="1,140 ms" delta="p95 · Friday peak" deltaTone="neg">
          <LineChart data={LATENCY} index="day" categories={['p50', 'p95', 'p99']}
            colors={['primary', 'cyan', 'violet']} valueFormatter={chartFmt.ms} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Single series" desc="A single trend, no legend. Daily run success rate as a percentage." code={C_SINGLE}>
        <ChartCard title="Success rate · 7 days" value="97.6%" delta="+0.4 pts vs. previous week" deltaTone="pos">
          <LineChart data={SUCCESS} index="day" categories={['Success']} colors={['primary']}
            valueFormatter={chartFmt.pct} showLegend={false} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Comparison with summary" desc="Chart without an embedded legend + side panel that summarizes the latest value of each series and lets you add another to the comparison. The dashboard card pattern for comparing services." code={C_COMPARE}>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Runs per service</h3>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">Daily run volume · June</p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-3">
              <LineChart data={RUNS} index="date" categories={['contract-summarize', 'pii-redaction', 'lead-enrich']}
                colors={['primary', 'violet', 'cyan']} valueFormatter={chartFmt.num} showLegend={false} />
            </div>
            <div className="md:col-span-1">
              <ul role="list" className="space-y-6">
                {SUMMARY.map((item) => (
                  <li key={item.name} className="flex gap-3">
                    <span className={item.bar + ' w-1 shrink-0 rounded'} aria-hidden={true} />
                    <div className="flex w-full items-center justify-between md:block">
                      <p className="order-last font-mono font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
                      <p className="order-first whitespace-nowrap text-[13px] text-muted-foreground">{item.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-6 inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors">
                <Icon name="plus" size={16} className="shrink-0" />
                Compare service
              </button>
            </div>
          </div>
        </div>
      </ChartVariant>

      <ChartVariant title="Two cards" desc="Heading outside the cards; chart and summary in separate cards side by side. The list uses dividers and aligns name and value in a row. On mobile the chart compacts: X-axis ends only and no Y axis." code={C_TWOCARD}>
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Runs per service</h3>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">Daily run volume · June</p>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
              <div className="hidden sm:block">
                <LineChart data={RUNS} index="date" categories={['contract-summarize', 'pii-redaction', 'lead-enrich']}
                  colors={['primary', 'violet', 'cyan']} valueFormatter={chartFmt.num} showLegend={false} />
              </div>
              <div className="sm:hidden">
                <LineChart data={RUNS} index="date" categories={['contract-summarize', 'pii-redaction', 'lead-enrich']}
                  colors={['primary', 'violet', 'cyan']} valueFormatter={chartFmt.num} showLegend={false} showYAxis={false} startEndOnly />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
              <ul role="list" className="divide-y divide-border">
                {SUMMARY.map((item) => (
                  <li key={item.name} className="flex gap-3 py-4 first:pt-0">
                    <span className={item.bar + ' w-1 shrink-0 rounded'} aria-hidden={true} />
                    <div className="flex w-full items-center justify-between gap-4 truncate">
                      <p className="truncate text-[13px] text-muted-foreground">{item.name}</p>
                      <p className="font-mono font-medium text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-4 inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors">
                <Icon name="plus" size={16} className="shrink-0" />
                Compare service
              </button>
            </div>
          </div>
        </div>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['line-charts'] = LineChartsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
