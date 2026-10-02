/* ============================================================================
   Gntik UI · area-charts.jsx — subcategoría "Area charts" (grupo Gráficas).
   Tendencia con relleno. Coste de inferencia musematic: apilada por modelo y
   una sola serie de total. Tooltip + leyenda interactiva, tema en vivo.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, AreaChart, chartFmt } = window;

const COST = [
  { month: 'Ene', Sonnet: 1840, Haiku: 420, Opus: 1260 },
  { month: 'Feb', Sonnet: 2010, Haiku: 460, Opus: 1180 },
  { month: 'Mar', Sonnet: 2360, Haiku: 510, Opus: 1340 },
  { month: 'Abr', Sonnet: 2720, Haiku: 540, Opus: 1090 },
  { month: 'May', Sonnet: 3180, Haiku: 620, Opus: 1260 },
  { month: 'Jun', Sonnet: 3460, Haiku: 680, Opus: 1410 },
];
const TOTAL = COST.map(d => ({ month: d.month, Total: d.Sonnet + d.Haiku + d.Opus }));

const C_STACK = `<AreaChart
  data={cost}
  index="month"
  categories={["Sonnet", "Haiku", "Opus"]}
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
      <SectionHead kicker="Gráficas" title="Area charts" status="done"
        intro="Tendencia con relleno. La versión apilada muestra la composición del total; la de una sola serie, la trayectoria limpia. Pasa el ratón para el tooltip y haz clic en la leyenda para aislar series." />

      <ChartVariant title="Apilada" desc="Composición del total a lo largo del tiempo. Coste de inferencia mensual repartido por modelo — el verde lleva la serie principal." code={C_STACK}>
        <ChartCard title="Coste de inferencia · 6 meses" value="$5,550" delta="+9.7% vs. May" deltaTone="neg">
          <AreaChart data={COST} index="month" categories={['Sonnet', 'Haiku', 'Opus']}
            colors={['primary', 'violet', 'cyan']} valueFormatter={chartFmt.usd} stacked />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Una serie" desc="Una sola métrica con relleno tenue, sin leyenda. Para la tendencia de un total cuando no hace falta desglosar." code={C_SINGLE}>
        <ChartCard title="Coste total · 6 meses" value="$5,550" delta="+9.7% vs. May" deltaTone="neg">
          <AreaChart data={TOTAL} index="month" categories={['Total']} colors={['primary']}
            valueFormatter={chartFmt.usd} showLegend={false} />
        </ChartCard>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['area-charts'] = AreaChartsSection;
})();
