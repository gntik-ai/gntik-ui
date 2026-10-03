/* ============================================================================
   Gntik UI · chartkit.jsx — charts layer (Recharts themed to the brand).
   Wrappers with the Tremor API (index · categories · colors · valueFormatter)
   over Recharts. ZERO hardcoded colour: everything is read live from
   tokens/brand.css, so the theme switch reskins charts like everything else.
   Primary green = hero · categoricals (violet/cyan/rose/amber, colour-blind-safe order) = extra series.
   Sober: no gradients, no glow, no entry animation.
   Exports to window: AreaChart · BarChart · LineChart · ComboChart · DonutChart
   · useChartTheme · chartFmt · CHART_COLORS.
   ============================================================================ */
(function () {
const { useState, useEffect, useMemo } = React;
const RC = window.Recharts;
if (!RC) { console.error('[chartkit] Recharts did not load'); return; }
const {
  ResponsiveContainer, AreaChart: RAreaChart, Area, BarChart: RBarChart, Bar,
  LineChart: RLineChart, Line, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} = RC;

/* ── token → concrete colour (hsl) ───────────────────────────────────────── */
const readVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const hsl = (name, a) => { const v = readVar(name); return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`; };

/* series palette: hero green + brand categoricals */
const SERIES = {
  primary: '--primary', emerald: '--brand-accent',
  violet: '--category-violet', cyan: '--category-cyan',
  amber: '--category-amber', rose: '--category-rose', info: '--info',
};
const CHART_COLORS = ['primary', 'violet', 'cyan', 'rose', 'amber'];

/* ── theme hook: re-reads tokens when the <html> class changes ───────────── */
function useChartTheme() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const o = new MutationObserver(() => setV(x => x + 1));
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => o.disconnect();
  }, []);
  return useMemo(() => ({
    grid: hsl('--border'),
    axis: hsl('--muted-foreground', 0.5),
    text: hsl('--muted-foreground'),
    cursor: hsl('--muted-foreground', 0.32),
    barCursor: hsl('--secondary', 0.55),
    color: (name, a) => hsl(SERIES[name] || SERIES.primary, a),
  }), [v]);
}

/* ── value formats ───────────────────────────────────────────────────────── */
const nf = (opts) => new Intl.NumberFormat('en-US', opts);
const chartFmt = {
  usd: (n) => '$' + nf({ maximumFractionDigits: 0 }).format(n),
  usd2: (n) => '$' + nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
  usdCompact: (n) => '$' + nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n),
  num: (n) => nf().format(n),
  compact: (n) => nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n),
  ms: (n) => nf().format(n) + ' ms',
  pct: (n) => n + '%',
};
const ident = (x) => x;

/* ── brand tooltip (card + mono values) ──────────────────────────────────── */
function ChartTooltip({ active, payload, label, valueFormatter = ident, labelFormatter }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter(p => p.value != null);
  return (
    <div className="rounded-md border border-border bg-popover shadow-md px-3 py-2.5 min-w-[150px]"
      style={{ fontFamily: 'var(--font-sans)' }}>
      {label != null && (
        <div className="font-sans text-[11px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border">
          {labelFormatter ? labelFormatter(label) : label}
        </div>)}
      <div className="flex flex-col gap-1.5">
        {rows.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: p.color || p.payload?.fill }} />
              <span className="font-sans text-[12px] text-muted-foreground truncate">{p.name}</span>
            </span>
            <span className="font-mono text-[12px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {valueFormatter(p.value, p.name, p)}
            </span>
          </div>
        ))}
      </div>
    </div>);
}

/* ── interactive legend: click toggles the series ────────────────────────── */
function ChartLegend({ items, hidden, onToggle, className = '' }) {
  return (
    <div className={"flex flex-wrap items-center gap-x-4 gap-y-1.5 " + className}>
      {items.map(it => {
        const off = hidden.has(it.key);
        return (
          <button key={it.key} onClick={() => onToggle(it.key)} type="button"
            className="group flex items-center gap-1.5 transition-opacity"
            style={{ opacity: off ? 0.4 : 1 }}>
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0 transition-all"
              style={{ background: it.color, filter: off ? 'grayscale(1)' : 'none' }} />
            <span className={"font-sans text-[12.5px] transition-colors " + (off ? 'text-muted-foreground line-through' : 'text-muted-foreground group-hover:text-foreground')}>{it.label}</span>
          </button>);
      })}
    </div>);
}

/* legend state hook (set of hidden series) */
function useHidden() {
  const [hidden, setHidden] = useState(() => new Set());
  const toggle = (k) => setHidden(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  return [hidden, toggle];
}

/* shared axes */
const axisProps = (t) => ({ stroke: t.axis, tickLine: false, axisLine: false, tick: { fill: t.text, fontSize: 11 } });
const ChartWrap = ({ height, children }) => (
  <div style={{ width: '100%', height, fontFamily: 'var(--font-sans)' }}>
    <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
  </div>);

/* ════════════════════════════════════════════════════════════════════════
   AREA CHART
   ════════════════════════════════════════════════════════════════════════ */
function AreaChart({ data, index, categories = [], colors = CHART_COLORS, valueFormatter = ident,
  stacked = false, showLegend = true, showGrid = true, showYAxis = true, curve = 'monotone', height = 288 }) {
  const t = useChartTheme();
  const [hidden, toggle] = useHidden();
  const col = (i) => t.color(colors[i % colors.length]);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  return (
    <div>
      {showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
      <ChartWrap height={height}>
        <RAreaChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
          <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={20} />
          {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
          <Tooltip isAnimationActive={false} cursor={{ stroke: t.cursor, strokeWidth: 1 }}
            content={(p) => <ChartTooltip {...p} valueFormatter={valueFormatter} />} />
          {categories.map((c, i) => (
            <Area key={c} type={curve} dataKey={c} name={c} hide={hidden.has(c)}
              stackId={stacked ? '1' : undefined} stroke={col(i)} strokeWidth={2}
              fill={col(i)} fillOpacity={stacked ? 0.82 : 0.14}
              dot={false} activeDot={{ r: 3.5, strokeWidth: 0 }} isAnimationActive={false} />
          ))}
        </RAreaChart>
      </ChartWrap>
    </div>);
}

/* ════════════════════════════════════════════════════════════════════════
   BAR CHART  (vertical · horizontal · stacked)
   ════════════════════════════════════════════════════════════════════════ */
function BarChart({ data, index, categories = [], colors = CHART_COLORS, valueFormatter = ident,
  stacked = false, layout = 'horizontal', showLegend = true, showGrid = true, showYAxis = true, height = 288 }) {
  const t = useChartTheme();
  const [hidden, toggle] = useHidden();
  const col = (i) => t.color(colors[i % colors.length]);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const vertical = layout === 'vertical'; // horizontal bars (categories on the Y axis)
  const radius = stacked ? 0 : (vertical ? [0, 3, 3, 0] : [3, 3, 0, 0]);
  return (
    <div>
      {showLegend && categories.length > 1 && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
      <ChartWrap height={height}>
        <RBarChart data={data} layout={layout} margin={{ top: 6, right: 10, left: 0, bottom: 0 }} barCategoryGap={vertical ? '22%' : '28%'}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={vertical} horizontal={!vertical} />}
          {vertical
            ? <><XAxis type="number" {...axisProps(t)} tickFormatter={valueFormatter} />
                <YAxis type="category" dataKey={index} {...axisProps(t)} width={92} /></>
            : <><XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={16} />
                {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}</>}
          <Tooltip isAnimationActive={false} cursor={{ fill: t.barCursor }}
            content={(p) => <ChartTooltip {...p} valueFormatter={valueFormatter} />} />
          {categories.map((c, i) => (
            <Bar key={c} dataKey={c} name={c} hide={hidden.has(c)}
              stackId={stacked ? '1' : undefined} fill={col(i)} radius={radius}
              maxBarSize={vertical ? 22 : 46} isAnimationActive={false} />
          ))}
        </RBarChart>
      </ChartWrap>
    </div>);
}

/* ════════════════════════════════════════════════════════════════════════
   LINE CHART
   ════════════════════════════════════════════════════════════════════════ */
function LineChart({ data, index, categories = [], colors = CHART_COLORS, valueFormatter = ident,
  showLegend = true, showGrid = true, showYAxis = true, startEndOnly = false, curve = 'monotone', height = 288 }) {
  const t = useChartTheme();
  const [hidden, toggle] = useHidden();
  const col = (i) => t.color(colors[i % colors.length]);
  const legend = categories.map((c, i) => ({ key: c, label: c, color: col(i) }));
  const xTicks = startEndOnly && data && data.length ? [data[0][index], data[data.length - 1][index]] : undefined;
  return (
    <div>
      {showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
      <ChartWrap height={height}>
        <RLineChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
          <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={startEndOnly ? 0 : 20} ticks={xTicks} interval={startEndOnly ? 'preserveStartEnd' : undefined} />
          {showYAxis && <YAxis {...axisProps(t)} width={50} tickFormatter={valueFormatter} />}
          <Tooltip isAnimationActive={false} cursor={{ stroke: t.cursor, strokeWidth: 1 }}
            content={(p) => <ChartTooltip {...p} valueFormatter={valueFormatter} />} />
          {categories.map((c, i) => (
            <Line key={c} type={curve} dataKey={c} name={c} hide={hidden.has(c)}
              stroke={col(i)} strokeWidth={2} dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }} isAnimationActive={false} />
          ))}
        </RLineChart>
      </ChartWrap>
    </div>);
}

/* ════════════════════════════════════════════════════════════════════════
   COMBO CHART  (bars on left axis · line on right axis)
   ════════════════════════════════════════════════════════════════════════ */
function ComboChart({ data, index, barSeries, lineSeries, barColor = 'primary', lineColor = 'amber',
  barFormatter = ident, lineFormatter = ident, showLegend = true, showGrid = true, height = 300 }) {
  const t = useChartTheme();
  const [hidden, toggle] = useHidden();
  const bc = t.color(barColor), lc = t.color(lineColor);
  const legend = [{ key: barSeries, label: barSeries, color: bc }, { key: lineSeries, label: lineSeries, color: lc }];
  return (
    <div>
      {showLegend && <ChartLegend className="mb-3 px-1" items={legend} hidden={hidden} onToggle={toggle} />}
      <ChartWrap height={height}>
        <ComposedChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barCategoryGap="30%">
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />}
          <XAxis dataKey={index} {...axisProps(t)} dy={8} minTickGap={16} />
          <YAxis yAxisId="left" {...axisProps(t)} width={48} tickFormatter={barFormatter} />
          <YAxis yAxisId="right" orientation="right" {...axisProps(t)} width={48} tickFormatter={lineFormatter} />
          <Tooltip isAnimationActive={false} cursor={{ fill: t.barCursor }}
            content={(p) => <ChartTooltip {...p} valueFormatter={(v, name) => name === lineSeries ? lineFormatter(v) : barFormatter(v)} />} />
          <Bar yAxisId="left" dataKey={barSeries} name={barSeries} hide={hidden.has(barSeries)}
            fill={bc} radius={[3, 3, 0, 0]} maxBarSize={42} isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey={lineSeries} name={lineSeries} hide={hidden.has(lineSeries)}
            stroke={lc} strokeWidth={2} dot={false} activeDot={{ r: 3.5, strokeWidth: 0 }} isAnimationActive={false} />
        </ComposedChart>
      </ChartWrap>
    </div>);
}

/* ════════════════════════════════════════════════════════════════════════
   DONUT CHART  (donut · pie · with centre label)
   ════════════════════════════════════════════════════════════════════════ */
function DonutChart({ data, index, category, colors = CHART_COLORS, valueFormatter = ident,
  variant = 'donut', showLegend = true, centerLabel, height = 264 }) {
  const t = useChartTheme();
  const [hidden, toggle] = useHidden();
  const col = (i) => t.color(colors[i % colors.length]);
  const cardBg = hsl('--card');
  const shown = data.filter(d => !hidden.has(d[index]));
  const total = shown.reduce((s, d) => s + (d[category] || 0), 0);
  const isDonut = variant === 'donut';
  const legend = data.map((d, i) => ({ key: d[index], label: d[index], color: col(i) }));
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={shown} dataKey={category} nameKey={index} cx="50%" cy="50%"
              innerRadius={isDonut ? '64%' : 0} outerRadius="94%" paddingAngle={shown.length > 1 ? 1.5 : 0}
              stroke={cardBg} strokeWidth={2} isAnimationActive={false}>
              {shown.map((d, i) => {
                const oi = data.findIndex(x => x[index] === d[index]);
                return <Cell key={i} fill={col(oi)} />;
              })}
            </Pie>
            <Tooltip isAnimationActive={false}
              content={(p) => <ChartTooltip {...p} valueFormatter={valueFormatter} />} />
          </PieChart>
        </ResponsiveContainer>
        {isDonut && centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-mono text-[20px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{valueFormatter(total)}</div>
            <div className="font-sans text-[11px] text-muted-foreground mt-0.5">{centerLabel}</div>
          </div>)}
      </div>
      {showLegend && (
        <div className="flex flex-col gap-2 min-w-0 flex-1 w-full">
          {legend.map((it, i) => {
            const off = hidden.has(it.key);
            const val = data.find(d => d[index] === it.key)?.[category] || 0;
            return (
              <button key={it.key} onClick={() => toggle(it.key)} type="button"
                className="flex items-center justify-between gap-3 group" style={{ opacity: off ? 0.4 : 1 }}>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: it.color, filter: off ? 'grayscale(1)' : 'none' }} />
                  <span className={"font-sans text-[12.5px] truncate " + (off ? 'text-muted-foreground line-through' : 'text-muted-foreground group-hover:text-foreground transition-colors')}>{it.label}</span>
                </span>
                <span className="font-mono text-[12px] font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>{valueFormatter(val)}</span>
              </button>);
          })}
        </div>)}
    </div>);
}

/* ════════════════════════════════════════════════════════════════════════
   BAR LIST  (no axes · label inside the bar · value on the right)
   ════════════════════════════════════════════════════════════════════════ */
function BarList({ data, index, category, valueFormatter = ident, color = 'primary', sortOrder = 'desc' }) {
  const BG = { primary: 'bg-primary/20', violet: 'bg-category-violet/20', cyan: 'bg-category-cyan/20', amber: 'bg-category-amber/20', rose: 'bg-category-rose/20' };
  const bg = BG[color] || BG.primary;
  let rows = data.slice();
  if (sortOrder === 'desc') rows.sort((a, b) => b[category] - a[category]);
  else if (sortOrder === 'asc') rows.sort((a, b) => a[category] - b[category]);
  const max = Math.max(...rows.map(d => d[category]), 1);
  return (
    <div className="flex flex-col gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
      {rows.map((r, i) => {
        const pct = Math.max((r[category] / max) * 100, 1.5);
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0 h-9">
              <div className={"absolute inset-y-0 left-0 rounded-md " + bg} style={{ width: pct + '%' }} />
              <div className="relative z-10 flex items-center h-full px-2.5">
                <span className="truncate text-[13px] text-foreground">{r[index]}</span>
              </div>
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-[13px] text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{valueFormatter(r[category])}</span>
          </div>);
      })}
    </div>);
}

Object.assign(window, {
  AreaChart, BarChart, LineChart, ComboChart, DonutChart, BarList,
  useChartTheme, ChartTooltip, ChartLegend, chartFmt, CHART_COLORS,
});
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
