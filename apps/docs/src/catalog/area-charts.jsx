/* ============================================================================
   Gntik UI · area-charts.jsx — "Area charts" subcategory (Charts group).
   Filled trend. Infrastructure cost: stacked by resource and a single total
   series. Tooltip + interactive legend, live theme.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, AreaChart, chartFmt } = window;

const COST = [
  { month: 'Jan', Compute: 1840, Storage: 420, Network: 1260 },
  { month: 'Feb', Compute: 2010, Storage: 460, Network: 1180 },
  { month: 'Mar', Compute: 2360, Storage: 510, Network: 1340 },
  { month: 'Apr', Compute: 2720, Storage: 540, Network: 1090 },
  { month: 'May', Compute: 3180, Storage: 620, Network: 1260 },
  { month: 'Jun', Compute: 3460, Storage: 680, Network: 1410 },
];
const TOTAL = COST.map(d => ({ month: d.month, Total: d.Compute + d.Storage + d.Network }));

const C_STACK = `<AreaChart
  data={cost}
  index="month"
  categories={["Compute", "Storage", "Network"]}
  colors={["primary", "violet", "cyan"]}
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
  stacked
/>`;

const C_SINGLE = `<AreaChart
  data={total}
  index="month"
  categories={["Total"]}
  colors={["primary"]}
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
  showLegend={false}
/>`;

function AreaChartsSection() {
  return (
    <div>
      <SectionHead kicker="Charts" title="Area charts" status="done"
        intro="Filled trend. The stacked version shows how the total is composed; the single-series one, the clean trajectory. Hover for the tooltip and click the legend to isolate series." />

      <ChartVariant title="Stacked" desc="Composition of the total over time. Monthly infrastructure cost split by resource — green carries the main series." code={C_STACK}>
        <ChartCard title="Infrastructure cost · 6 months" value="$5,550" delta="+9.7% vs. May" deltaTone="neg">
          <AreaChart data={COST} index="month" categories={['Compute', 'Storage', 'Network']}
            colors={['primary', 'violet', 'cyan']} valueFormatter={chartFmt.usd} stacked />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Single series" desc="A single metric with a faint fill and no legend. For the trend of a total when no breakdown is needed." code={C_SINGLE}>
        <ChartCard title="Total cost · 6 months" value="$5,550" delta="+9.7% vs. May" deltaTone="neg">
          <AreaChart data={TOTAL} index="month" categories={['Total']} colors={['primary']}
            valueFormatter={chartFmt.usd} showLegend={false} />
        </ChartCard>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['area-charts'] = AreaChartsSection;
})();
