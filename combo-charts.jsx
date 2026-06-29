/* ============================================================================
   Gntik UI · combo-charts.jsx — subcategoría "Combo charts" (grupo Gráficas).
   Dos magnitudes con escalas distintas en un mismo eje X: barras (eje izq.) +
   línea (eje der.). Tokens vs. coste y requests vs. latencia. Tema en vivo.
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, ComboChart, chartFmt } = window;

const USAGE = [
  { month: 'Ene', Tokens: 182000000, Coste: 3520 },
  { month: 'Feb', Tokens: 198000000, Coste: 3650 },
  { month: 'Mar', Tokens: 232000000, Coste: 4210 },
  { month: 'Abr', Tokens: 256000000, Coste: 4350 },
  { month: 'May', Tokens: 298000000, Coste: 5060 },
  { month: 'Jun', Tokens: 332000000, Coste: 5550 },
];
const REQLAT = [
  { month: 'Ene', Requests: 412000, 'p95': 820 },
  { month: 'Feb', Requests: 458000, 'p95': 860 },
  { month: 'Mar', Requests: 521000, 'p95': 940 },
  { month: 'Abr', Requests: 566000, 'p95': 910 },
  { month: 'May', Requests: 638000, 'p95': 1080 },
  { month: 'Jun', Requests: 694000, 'p95': 1010 },
];

const C_TOKENS = `<ComboChart
  data={usage}
  index="month"
  barSeries="Tokens"
  lineSeries="Coste"
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
      <SectionHead kicker="Gráficas" title="Combo charts" status="done"
        intro="Dos magnitudes con escalas distintas en un mismo eje X: barras para el volumen y línea para la métrica que lo acompaña, cada una con su eje y su formato. Clic en la leyenda para aislar." />

      <ChartVariant title="Tokens vs. coste" desc="Barras para el volumen de tokens (eje izq.) y línea para el coste facturado (eje der.)." code={C_TOKENS}>
        <ChartCard title="Tokens vs. coste · 6 meses" value="332M tokens" delta="$5,550 facturado" deltaTone="muted">
          <ComboChart data={USAGE} index="month" barSeries="Tokens" lineSeries="Coste"
            barColor="primary" lineColor="amber" barFormatter={chartFmt.compact} lineFormatter={chartFmt.usd} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Volumen vs. latencia" desc="Requests por mes (barras) frente a la latencia p95 (línea). Útil para ver si el volumen presiona la cola." code={C_REQ}>
        <ChartCard title="Requests vs. p95 · 6 meses" value="694K req" delta="p95 1,010 ms" deltaTone="muted">
          <ComboChart data={REQLAT} index="month" barSeries="Requests" lineSeries="p95"
            barColor="primary" lineColor="cyan" barFormatter={chartFmt.compact} lineFormatter={chartFmt.ms} />
        </ChartCard>
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['combo-charts'] = ComboChartsSection;
})();
