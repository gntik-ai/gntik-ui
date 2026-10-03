/* ============================================================================
   Gntik UI · bar-charts.jsx — "Bar charts" subcategory (Charts group).
   Counts by category: stacked, grouped and horizontal. Sample data
   (jobs by status, tokens in/out, spend by service). Tooltip + interactive
   legend, live theme. (Tremor blocks come after.)
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, BarChart, BarList, chartFmt } = window;

const RUNS = [
  { day: 'Mon', Succeeded: 1240, Failed: 38, Cancelled: 22 },
  { day: 'Tue', Succeeded: 1380, Failed: 41, Cancelled: 18 },
  { day: 'Wed', Succeeded: 1290, Failed: 52, Cancelled: 25 },
  { day: 'Thu', Succeeded: 1460, Failed: 36, Cancelled: 20 },
  { day: 'Fri', Succeeded: 1520, Failed: 44, Cancelled: 28 },
  { day: 'Sat', Succeeded: 980, Failed: 22, Cancelled: 12 },
  { day: 'Sun', Succeeded: 870, Failed: 18, Cancelled: 9 },
];
const TOKENS_IO = [
  { day: 'Mon', Input: 18.2, Output: 4.1 },
  { day: 'Tue', Input: 20.6, Output: 4.6 },
  { day: 'Wed', Input: 19.1, Output: 4.3 },
  { day: 'Thu', Input: 22.4, Output: 5.2 },
  { day: 'Fri', Input: 24.0, Output: 5.6 },
  { day: 'Sat', Input: 14.8, Output: 3.2 },
  { day: 'Sun', Input: 12.9, Output: 2.8 },
];
const AGENTS = [
  { service: 'support-triage', spend: 1820 },
  { service: 'billing-bot', spend: 1460 },
  { service: 'docs-rag', spend: 1190 },
  { service: 'sales-qualifier', spend: 980 },
  { service: 'onboarding', spend: 740 },
  { service: 'moderation', spend: 520 },
];

/* ── dashboard blocks (adapted from Tremor Blocks · bar charts #2 and #3) ── */
const COST_REGION = [
  { month: 'Jan', 'eu-west-1': 42000, 'us-east-1': 28000, 'ap-south-1': 9000 },
  { month: 'Feb', 'eu-west-1': 44000, 'us-east-1': 29500, 'ap-south-1': 9600 },
  { month: 'Mar', 'eu-west-1': 47000, 'us-east-1': 31000, 'ap-south-1': 10200 },
  { month: 'Apr', 'eu-west-1': 45500, 'us-east-1': 30200, 'ap-south-1': 9800 },
  { month: 'May', 'eu-west-1': 49000, 'us-east-1': 33000, 'ap-south-1': 11000 },
  { month: 'Jun', 'eu-west-1': 52000, 'us-east-1': 35000, 'ap-south-1': 11800 },
  { month: 'Jul', 'eu-west-1': 50500, 'us-east-1': 34000, 'ap-south-1': 11400 },
  { month: 'Aug', 'eu-west-1': 53000, 'us-east-1': 36000, 'ap-south-1': 12200 },
  { month: 'Sep', 'eu-west-1': 55000, 'us-east-1': 37500, 'ap-south-1': 12800 },
  { month: 'Oct', 'eu-west-1': 57000, 'us-east-1': 38500, 'ap-south-1': 13200 },
  { month: 'Nov', 'eu-west-1': 59000, 'us-east-1': 40000, 'ap-south-1': 13800 },
  { month: 'Dec', 'eu-west-1': 61000, 'us-east-1': 41500, 'ap-south-1': 14400 },
];
const COST_YOY = [
  { month: 'Jan', 'This year': 52000, 'Last year': 44000 },
  { month: 'Feb', 'This year': 54000, 'Last year': 45500 },
  { month: 'Mar', 'This year': 58000, 'Last year': 49000 },
  { month: 'Apr', 'This year': 55500, 'Last year': 48000 },
  { month: 'May', 'This year': 60000, 'Last year': 51000 },
  { month: 'Jun', 'This year': 64000, 'Last year': 53000 },
  { month: 'Jul', 'This year': 62000, 'Last year': 52000 },
  { month: 'Aug', 'This year': 66000, 'Last year': 55000 },
  { month: 'Sep', 'This year': 68000, 'Last year': 57000 },
  { month: 'Oct', 'This year': 70000, 'Last year': 59000 },
  { month: 'Nov', 'This year': 72000, 'Last year': 61000 },
  { month: 'Dec', 'This year': 75000, 'Last year': 63000 },
];
const sumKey = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
const LOCATIONS = [
  { country: 'United States', requests: 5422 },
  { country: 'India', requests: 3560 },
  { country: 'Germany', requests: 680 },
  { country: 'Brazil', requests: 580 },
  { country: 'United Kingdom', requests: 510 },
];

const C_STACK = `<BarChart
  data={runs}
  index="day"
  categories={["Succeeded", "Failed", "Cancelled"]}
  colors={["primary", "rose", "amber"]}
  valueFormatter={(v) => v.toLocaleString()}
  stacked
/>`;

const C_GROUP = `<BarChart
  data={tokens}
  index="day"
  categories={["Input", "Output"]}
  colors={["primary", "violet"]}
  valueFormatter={(v) => \`\${v}M\`}
/>`;

const C_HORIZ = `<BarChart
  data={services}
  index="service"
  categories={["spend"]}
  colors={["primary"]}
  layout="vertical"            // horizontal bars
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
  showLegend={false}
/>`;

const C_BARLIST = `<BarList
  data={locations}
  index="country"
  category="requests"
  color="primary"
  valueFormatter={(v) => v.toLocaleString()}
/>`;

const C_REGION_BLOCK = `<div className="rounded-lg border border-border bg-card p-5">
  <h3 className="text-[15px] font-semibold text-foreground">Cost by region</h3>
  <p className="text-[13px] text-muted-foreground">Monthly split across the top 3 regions</p>

  <ul className="mt-5 grid gap-3 sm:grid-cols-3">
    {regions.map((r) => (
      <li key={r.key} className="rounded-md border border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className={\`size-2.5 rounded-sm \${r.dot}\`} />
          <p className="font-mono text-[11px] text-muted-foreground">{r.name}</p>
        </div>
        <p className="mt-0.5 font-semibold text-foreground">{usdCompact(total(r.key))}</p>
      </li>
    ))}
  </ul>

  <BarChart data={data} index="month"
    categories={["eu-west-1", "us-east-1", "ap-south-1"]}
    colors={["primary", "cyan", "violet"]}
    valueFormatter={usdCompact} stacked showLegend={false} />
</div>`;

const C_YOY_BLOCK = `<div className="rounded-lg border border-border bg-card p-5">
  <h3 className="text-[15px] font-semibold text-foreground">Cost · year over year</h3>
  <p className="text-[13px] text-muted-foreground">Monthly spend in 2026 vs. 2025</p>

  <ul className="mt-5 flex gap-10">
    <li>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-primary" />
        <p className="text-[12px] text-muted-foreground">This year</p>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <p className="text-[18px] font-semibold text-foreground">{usdCompact(thisYear)}</p>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">+{delta}%</span>
      </div>
    </li>
    <li>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-category-cyan" />
        <p className="text-[12px] text-muted-foreground">Last year</p>
      </div>
      <p className="mt-0.5 text-[18px] font-semibold text-foreground">{usdCompact(lastYear)}</p>
    </li>
  </ul>

  <BarChart data={data} index="month"
    categories={["Last year", "This year"]}
    colors={["cyan", "primary"]}
    valueFormatter={usdCompact} showLegend={false} />
</div>`;

/* Block · cost breakdown by region (Tremor bar #2) */
function RegionBlock() {
  const regions = [
    { name: 'eu-west-1', key: 'eu-west-1', dot: 'bg-primary' },
    { name: 'us-east-1', key: 'us-east-1', dot: 'bg-category-cyan' },
    { name: 'ap-south-1', key: 'ap-south-1', dot: 'bg-category-violet' },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">Cost by region</h3>
      <p className="text-[13px] text-muted-foreground mt-0.5">Monthly split across the top 3 regions</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {regions.map(r => (
          <li key={r.key} className="rounded-md border border-border px-3 py-2 text-left">
            <div className="flex items-center gap-1.5">
              <span className={"w-2.5 h-2.5 rounded-[3px] shrink-0 " + r.dot} aria-hidden="true" />
              <p className="font-mono text-[11px] text-muted-foreground">{r.name}</p>
            </div>
            <p className="mt-0.5 font-sans font-semibold text-[15px] text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usdCompact(sumKey(COST_REGION, r.key))}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <BarChart data={COST_REGION} index="month" categories={['eu-west-1', 'us-east-1', 'ap-south-1']}
          colors={['primary', 'cyan', 'violet']} valueFormatter={chartFmt.usdCompact} stacked showLegend={false} height={224} />
      </div>
    </div>);
}

/* Block · year-over-year cost (Tremor bar #3) */
function YoyBlock() {
  const thisYear = sumKey(COST_YOY, 'This year');
  const lastYear = sumKey(COST_YOY, 'Last year');
  const delta = Math.round(((thisYear - lastYear) / lastYear) * 100);
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">Cost · year over year</h3>
      <p className="text-[13px] text-muted-foreground mt-0.5">Monthly spend in 2026 vs. 2025</p>
      <ul className="mt-5 flex gap-10">
        <li>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-primary shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground">This year</p>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="font-sans text-[18px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usdCompact(thisYear)}</p>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">{(delta >= 0 ? '+' : '') + delta}%</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-category-cyan shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground">Last year</p>
          </div>
          <p className="mt-0.5 font-sans text-[18px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usdCompact(lastYear)}</p>
        </li>
      </ul>
      <div className="mt-6">
        <BarChart data={COST_YOY} index="month" categories={['Last year', 'This year']}
          colors={['cyan', 'primary']} valueFormatter={chartFmt.usdCompact} showLegend={false} height={224} />
      </div>
    </div>);
}

function BarChartsSection() {
  return (
    <div>
      <SectionHead kicker="Charts" title="Bar charts" status="done"
        intro="Counts by category. Stacked for composition, grouped to compare series side by side and horizontal for rankings. Green carries the main series; categoricals cover the rest. Below, two dashboard cards adapted from Tremor Blocks." />

      <ChartVariant title="Stacked" desc="Jobs over the last 7 days by status. Green carries the successful ones; red and amber flag failures and cancellations without competing with the brand." code={C_STACK}>
        <ChartCard title="Jobs by status · 7 days" value="8,740" delta="+6.2% vs. previous week" deltaTone="pos">
          <BarChart data={RUNS} index="day" categories={['Succeeded', 'Failed', 'Cancelled']}
            colors={['primary', 'rose', 'amber']} valueFormatter={chartFmt.num} stacked />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Grouped" desc="Series side by side to compare magnitudes. Input vs. output tokens per day (in millions)." code={C_GROUP}>
        <ChartCard title="Input vs. output tokens · 7 days" value="121.0M" delta="ratio 4.4×" deltaTone="muted">
          <BarChart data={TOKENS_IO} index="day" categories={['Input', 'Output']}
            colors={['primary', 'violet']} valueFormatter={(v) => v + 'M'} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Horizontal" desc={'Single-series ranking with labels on the Y axis. For top lists — spend by service this month. layout="vertical" rotates the bars.'} code={C_HORIZ}>
        <ChartCard title="Spend by service · June" value="$6,710" delta="6 active services" deltaTone="muted">
          <BarChart data={AGENTS} index="service" categories={['spend']} colors={['primary']}
            layout="vertical" valueFormatter={chartFmt.usd} showLegend={false} height={260} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Bar list" desc="Axis-free variation: the name sits inside the bar and the value on the right, with bars proportional to the maximum. For compact top lists." code={C_BARLIST}>
        <ChartCard title="Requests by country · 24 h">
          <BarList data={LOCATIONS} index="country" category="requests" valueFormatter={chartFmt.num} color="primary" />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Block · cost by region" desc="Adapted from Tremor block #2: card with a header, a grid of three tiles (region + total) and the stacked bar below. Each tile uses its series colour." code={C_REGION_BLOCK}>
        <RegionBlock />
      </ChartVariant>

      <ChartVariant title="Block · year-over-year cost" desc="Adapted from Tremor block #3: two periods compared in grouped bars, with a KPI row (value + delta) acting as the legend. Green = this year, cyan = last year." code={C_YOY_BLOCK}>
        <YoyBlock />
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['bar-charts'] = BarChartsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
