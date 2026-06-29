/* ============================================================================
   Gntik UI · bar-charts.jsx — subcategoría "Bar charts" (grupo Gráficas).
   Conteos por categoría: apilada, agrupada y horizontal. Datos musematic
   (runs por estado, tokens in/out, gasto por agente). Tooltip + leyenda
   interactiva, tema en vivo. (Aquí entran después los blocks de Tremor.)
   ============================================================================ */
(function () {
const { SectionHead, ChartCard, ChartVariant, BarChart, BarList, chartFmt } = window;

const RUNS = [
  { day: 'Lun', Succeeded: 1240, Failed: 38, Cancelled: 22 },
  { day: 'Mar', Succeeded: 1380, Failed: 41, Cancelled: 18 },
  { day: 'Mié', Succeeded: 1290, Failed: 52, Cancelled: 25 },
  { day: 'Jue', Succeeded: 1460, Failed: 36, Cancelled: 20 },
  { day: 'Vie', Succeeded: 1520, Failed: 44, Cancelled: 28 },
  { day: 'Sáb', Succeeded: 980, Failed: 22, Cancelled: 12 },
  { day: 'Dom', Succeeded: 870, Failed: 18, Cancelled: 9 },
];
const TOKENS_IO = [
  { day: 'Lun', Entrada: 18.2, Salida: 4.1 },
  { day: 'Mar', Entrada: 20.6, Salida: 4.6 },
  { day: 'Mié', Entrada: 19.1, Salida: 4.3 },
  { day: 'Jue', Entrada: 22.4, Salida: 5.2 },
  { day: 'Vie', Entrada: 24.0, Salida: 5.6 },
  { day: 'Sáb', Entrada: 14.8, Salida: 3.2 },
  { day: 'Dom', Entrada: 12.9, Salida: 2.8 },
];
const AGENTS = [
  { agent: 'support-triage', spend: 1820 },
  { agent: 'billing-bot', spend: 1460 },
  { agent: 'docs-rag', spend: 1190 },
  { agent: 'sales-qualifier', spend: 980 },
  { agent: 'onboarding', spend: 740 },
  { agent: 'moderation', spend: 520 },
];

/* ── bloques de dashboard (adaptados de Tremor Blocks · bar charts #2 y #3) ── */
const COST_REGION = [
  { month: 'Ene', 'eu-west-1': 42000, 'us-east-1': 28000, 'ap-south-1': 9000 },
  { month: 'Feb', 'eu-west-1': 44000, 'us-east-1': 29500, 'ap-south-1': 9600 },
  { month: 'Mar', 'eu-west-1': 47000, 'us-east-1': 31000, 'ap-south-1': 10200 },
  { month: 'Abr', 'eu-west-1': 45500, 'us-east-1': 30200, 'ap-south-1': 9800 },
  { month: 'May', 'eu-west-1': 49000, 'us-east-1': 33000, 'ap-south-1': 11000 },
  { month: 'Jun', 'eu-west-1': 52000, 'us-east-1': 35000, 'ap-south-1': 11800 },
  { month: 'Jul', 'eu-west-1': 50500, 'us-east-1': 34000, 'ap-south-1': 11400 },
  { month: 'Ago', 'eu-west-1': 53000, 'us-east-1': 36000, 'ap-south-1': 12200 },
  { month: 'Sep', 'eu-west-1': 55000, 'us-east-1': 37500, 'ap-south-1': 12800 },
  { month: 'Oct', 'eu-west-1': 57000, 'us-east-1': 38500, 'ap-south-1': 13200 },
  { month: 'Nov', 'eu-west-1': 59000, 'us-east-1': 40000, 'ap-south-1': 13800 },
  { month: 'Dic', 'eu-west-1': 61000, 'us-east-1': 41500, 'ap-south-1': 14400 },
];
const COST_YOY = [
  { month: 'Ene', 'Este año': 52000, 'Año pasado': 44000 },
  { month: 'Feb', 'Este año': 54000, 'Año pasado': 45500 },
  { month: 'Mar', 'Este año': 58000, 'Año pasado': 49000 },
  { month: 'Abr', 'Este año': 55500, 'Año pasado': 48000 },
  { month: 'May', 'Este año': 60000, 'Año pasado': 51000 },
  { month: 'Jun', 'Este año': 64000, 'Año pasado': 53000 },
  { month: 'Jul', 'Este año': 62000, 'Año pasado': 52000 },
  { month: 'Ago', 'Este año': 66000, 'Año pasado': 55000 },
  { month: 'Sep', 'Este año': 68000, 'Año pasado': 57000 },
  { month: 'Oct', 'Este año': 70000, 'Año pasado': 59000 },
  { month: 'Nov', 'Este año': 72000, 'Año pasado': 61000 },
  { month: 'Dic', 'Este año': 75000, 'Año pasado': 63000 },
];
const sumKey = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
const LOCATIONS = [
  { country: 'Estados Unidos', requests: 5422 },
  { country: 'India', requests: 3560 },
  { country: 'Alemania', requests: 680 },
  { country: 'Brasil', requests: 580 },
  { country: 'Reino Unido', requests: 510 },
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
  categories={["Entrada", "Salida"]}
  colors={["primary", "violet"]}
  valueFormatter={(v) => \`\${v}M\`}
/>`;

const C_HORIZ = `<BarChart
  data={agents}
  index="agent"
  categories={["spend"]}
  colors={["primary"]}
  layout="vertical"            // barras horizontales
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
  <h3 className="text-[15px] font-semibold text-foreground">Coste por región</h3>
  <p className="text-[13px] text-muted-foreground">Reparto mensual entre las 3 regiones principales</p>

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
  <h3 className="text-[15px] font-semibold text-foreground">Coste · interanual</h3>
  <p className="text-[13px] text-muted-foreground">Gasto mensual de 2026 frente a 2025</p>

  <ul className="mt-5 flex gap-10">
    <li>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-primary" />
        <p className="text-[12px] text-muted-foreground">Este año</p>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <p className="text-[18px] font-semibold text-foreground">{usdCompact(thisYear)}</p>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">+{delta}%</span>
      </div>
    </li>
    <li>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-category-cyan" />
        <p className="text-[12px] text-muted-foreground">Año pasado</p>
      </div>
      <p className="mt-0.5 text-[18px] font-semibold text-foreground">{usdCompact(lastYear)}</p>
    </li>
  </ul>

  <BarChart data={data} index="month"
    categories={["Año pasado", "Este año"]}
    colors={["cyan", "primary"]}
    valueFormatter={usdCompact} showLegend={false} />
</div>`;

/* Block · desglose de coste por región (Tremor bar #2) */
function RegionBlock() {
  const regions = [
    { name: 'eu-west-1', key: 'eu-west-1', dot: 'bg-primary' },
    { name: 'us-east-1', key: 'us-east-1', dot: 'bg-category-cyan' },
    { name: 'ap-south-1', key: 'ap-south-1', dot: 'bg-category-violet' },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">Coste por región</h3>
      <p className="text-[13px] text-muted-foreground mt-0.5">Reparto mensual entre las 3 regiones principales</p>
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

/* Block · coste interanual (Tremor bar #3) */
function YoyBlock() {
  const thisYear = sumKey(COST_YOY, 'Este año');
  const lastYear = sumKey(COST_YOY, 'Año pasado');
  const delta = Math.round(((thisYear - lastYear) / lastYear) * 100);
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">Coste · interanual</h3>
      <p className="text-[13px] text-muted-foreground mt-0.5">Gasto mensual de 2026 frente a 2025</p>
      <ul className="mt-5 flex gap-10">
        <li>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-primary shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground">Este año</p>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="font-sans text-[18px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usdCompact(thisYear)}</p>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">{(delta >= 0 ? '+' : '') + delta}%</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-category-cyan shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground">Año pasado</p>
          </div>
          <p className="mt-0.5 font-sans text-[18px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{chartFmt.usdCompact(lastYear)}</p>
        </li>
      </ul>
      <div className="mt-6">
        <BarChart data={COST_YOY} index="month" categories={['Año pasado', 'Este año']}
          colors={['cyan', 'primary']} valueFormatter={chartFmt.usdCompact} showLegend={false} height={224} />
      </div>
    </div>);
}

function BarChartsSection() {
  return (
    <div>
      <SectionHead kicker="Gráficas" title="Bar charts" status="done"
        intro="Conteos por categoría. Apilada para composición, agrupada para comparar series lado a lado y horizontal para rankings. El verde lleva la serie principal; los categóricos entran para el resto. Abajo, dos cards de dashboard adaptadas de Tremor Blocks." />

      <ChartVariant title="Apilada" desc="Runs de los últimos 7 días por estado. El verde lleva los exitosos; rojo y ámbar señalan fallos y cancelaciones sin competir con la marca." code={C_STACK}>
        <ChartCard title="Runs por estado · 7 días" value="8,740" delta="+6.2% vs. semana previa" deltaTone="pos">
          <BarChart data={RUNS} index="day" categories={['Succeeded', 'Failed', 'Cancelled']}
            colors={['primary', 'rose', 'amber']} valueFormatter={chartFmt.num} stacked />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Agrupada" desc="Series lado a lado para comparar magnitudes. Tokens de entrada vs. salida por día (en millones)." code={C_GROUP}>
        <ChartCard title="Tokens entrada vs. salida · 7 días" value="121.0M" delta="ratio 4.4×" deltaTone="muted">
          <BarChart data={TOKENS_IO} index="day" categories={['Entrada', 'Salida']}
            colors={['primary', 'violet']} valueFormatter={(v) => v + 'M'} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Horizontal" desc={'Ranking de una sola serie con las etiquetas en el eje Y. Para tops — gasto por agente del mes. layout="vertical" gira las barras.'} code={C_HORIZ}>
        <ChartCard title="Gasto por agente · Junio" value="$6,710" delta="6 agentes activos" deltaTone="muted">
          <BarChart data={AGENTS} index="agent" categories={['spend']} colors={['primary']}
            layout="vertical" valueFormatter={chartFmt.usd} showLegend={false} height={260} />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Bar list" desc="Variación sin ejes: el nombre va dentro de la barra y el valor a la derecha, con las barras proporcionales al máximo. Para tops compactos." code={C_BARLIST}>
        <ChartCard title="Requests por país · 24 h">
          <BarList data={LOCATIONS} index="country" category="requests" valueFormatter={chartFmt.num} color="primary" />
        </ChartCard>
      </ChartVariant>

      <ChartVariant title="Block · coste por región" desc="Adaptado del bloque Tremor #2: card con cabecera, una rejilla de tres tiles (región + total) y debajo la barra apilada. Cada tile usa el color de su serie." code={C_REGION_BLOCK}>
        <RegionBlock />
      </ChartVariant>

      <ChartVariant title="Block · coste interanual" desc="Adaptado del bloque Tremor #3: comparativa de dos periodos en barras agrupadas, con una fila de KPIs (valor + delta) que hace de leyenda. Verde = este año, cian = año pasado." code={C_YOY_BLOCK}>
        <YoyBlock />
      </ChartVariant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['bar-charts'] = BarChartsSection;
})();
