/* ============================================================================
   Gntik UI · combo-charts.jsx — "Combo charts" subcategory (Charts group).
   Two measures with different scales on one X axis: bars (left axis) +
   line (right axis). Tokens vs. cost and requests vs. latency. Live theme.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, ComboChart, chartFmt } = window;

const USAGE = [
  { month: 'Jan', Tokens: 182000000, Cost: 3520 },
  { month: 'Feb', Tokens: 198000000, Cost: 3650 },
  { month: 'Mar', Tokens: 232000000, Cost: 4210 },
  { month: 'Apr', Tokens: 256000000, Cost: 4350 },
  { month: 'May', Tokens: 298000000, Cost: 5060 },
  { month: 'Jun', Tokens: 332000000, Cost: 5550 },
];
const REQLAT = [
  { month: 'Jan', Requests: 412000, 'p95': 820 },
  { month: 'Feb', Requests: 458000, 'p95': 860 },
  { month: 'Mar', Requests: 521000, 'p95': 940 },
  { month: 'Apr', Requests: 566000, 'p95': 910 },
  { month: 'May', Requests: 638000, 'p95': 1080 },
  { month: 'Jun', Requests: 694000, 'p95': 1010 },
];

const C_TOKENS = `<ComboChart
  data={usage}
  index="month"
  barSeries="Tokens"
  lineSeries="Cost"
  barColor="primary"
  lineColor="amber"
  barFormatter={(v) => Intl.NumberFormat("en", { notation: "compact" }).format(v)}
  lineFormatter={(v) => \`$\${v.toLocaleString()}\`}
/>`;

const C_REQ = `<ComboChart
  data={reqlat}
  index="month"
  barSeries="Requests"
  lineSeries="p95"
  barColor="primary"
  lineColor="cyan"
  barFormatter={(v) => Intl.NumberFormat("en", { notation: "compact" }).format(v)}
  lineFormatter={(v) => \`\${v} ms\`}
/>`;

function ComboChartsSection() {
  return (
    <div>
      <SectionHead kicker="Charts" title="Combo charts" status="done"
        intro="Two measures with different scales on one X axis: bars for volume and a line for the metric that goes with it, each with its own axis and format. Click the legend to isolate." />

      <ChartVariant title="Tokens vs. cost" desc="Bars for token volume (left axis) and a line for billed cost (right axis)." code={C_TOKENS}>
        <ChartCard title="Tokens vs. cost · 6 months" value="332M tokens" delta="$5,550 billed" deltaTone="muted">
          <ComboChart data={USAGE} index="month" barSeries="Tokens" lineSeries="Cost"
            barColor="primary" lineColor="amber" barFormatter={chartFmt.compact} lineFormatter={chartFmt.usd} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Volume vs. latency" desc="Requests per month (bars) against p95 latency (line). Useful to see whether volume is pressuring the queue." code={C_REQ}>
        <ChartCard title="Requests vs. p95 · 6 months" value="694K req" delta="p95 1,010 ms" deltaTone="muted">
          <ComboChart data={REQLAT} index="month" barSeries="Requests" lineSeries="p95"
            barColor="primary" lineColor="cyan" barFormatter={chartFmt.compact} lineFormatter={chartFmt.ms} />
        </ChartCard>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['combo-charts'] = ComboChartsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
