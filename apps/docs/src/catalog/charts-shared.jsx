/* ============================================================================
   Gntik UI · charts-shared.jsx — shared chrome for the Charts sections.
   ChartCard (dashboard card) · ChartDelta · ChartVariant (name + desc +
   preview + code) · ChartSegmented. Used by area-charts, bar-charts, etc.
   The charts themselves live in chartkit.jsx; this is presentation only.
   ============================================================================ */
(function () {
const { Icon, CodeBlock } = window;

/* mono delta · green = good, red = attention, grey = neutral */
const ChartDelta = ({ tone = 'pos', children }) => {
  const c = tone === 'pos' ? 'text-primary' : tone === 'neg' ? 'text-destructive' : 'text-muted-foreground';
  return <span className={"font-mono text-[12px] font-medium " + c} style={{ fontVariantNumeric: 'tabular-nums' }}>{children}</span>;
};

/* dashboard card chrome: title + metric + action + (chart) + footer */
function ChartCard({ title, value, delta, deltaTone, action, foot, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
          {value != null && (
            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              <span className="font-sans text-[24px] font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>{value}</span>
              {delta && <ChartDelta tone={deltaTone}>{delta}</ChartDelta>}
            </div>)}
        </div>
        <div className="shrink-0">{action || <button className="w-8 h-8 -mr-1.5 -mt-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 flex items-center justify-center transition-colors"><Icon name="dot3" size={18} /></button>}</div>
      </div>
      {children}
      {foot && <div className="mt-4 pt-4 border-t border-border">{foot}</div>}
    </div>);
}

/* name + description + preview + code (copyable) */
const ChartVariant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    {children}
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>);

/* segmented control (donut/pie, periods, etc.) */
function ChartSegmented({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} type="button"
            className={"h-7 px-2.5 rounded-[5px] font-sans text-[12px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {o.label}
          </button>);
      })}
    </div>);
}

Object.assign(window, { ChartCard, ChartDelta, ChartVariant, ChartSegmented });
})();
