/* ============================================================================
   Gntik UI · stats.jsx — subcategoría "Stats" (grupo Datos).
   La tarjeta de KPI: etiqueta + cifra grande + delta con dirección — y, cuando
   ayuda, una mini gráfica de tendencia (línea/área), barras o un anillo de
   progreso. Dirección de la flecha y color son independientes: bajar la latencia
   o el coste es bueno (verde, flecha abajo). Mini-charts leen el tema en vivo.
   Variantes: simple · banda dividida · sparkline · mini-barras · anillo · icono+footer.
   ============================================================================ */
(function () {
const { SectionHead, Icon, CodeBlock, useChartTheme } = window;
const { useState } = React;
const RC = window.Recharts;
const { ResponsiveContainer, AreaChart: RArea, Area, LineChart: RLine, Line, BarChart: RBar, Bar } = RC;

/* ── delta mono con flecha · dir = forma de la flecha, tone = color ────────── */
const Trend = ({ dir = 'up', tone = 'pos', children }) => {
  const c = tone === 'pos' ? 'text-primary' : tone === 'neg' ? 'text-destructive' : 'text-muted-foreground';
  return (
    <span className={"inline-flex items-center gap-1 font-mono text-[12px] font-medium " + c} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
        {dir === 'up'
          ? <path d="M5 1.5 9 8.5H1z" fill="currentColor" />
          : <path d="M5 8.5 1 1.5h8z" fill="currentColor" />}
      </svg>
      {children}
    </span>
  );
};

/* ── cuadro de icono (tono de marca) ──────────────────────────────────────── */
const IconTile = ({ name }) => (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/14 text-primary shrink-0">
    <Icon name={name} size={18} />
  </span>
);

/* ── sparkline · área o línea, sin ejes ni tooltip ───────────────────────── */
function Sparkline({ data, color = 'primary', type = 'area', height = 46 }) {
  const t = useChartTheme();
  const c = t.color(color);
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area'
          ? <RArea data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="v" stroke={c} strokeWidth={1.75} fill={c} fillOpacity={0.13} dot={false} isAnimationActive={false} />
            </RArea>
          : <RLine data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <Line type="monotone" dataKey="v" stroke={c} strokeWidth={1.75} dot={false} isAnimationActive={false} />
            </RLine>}
      </ResponsiveContainer>
    </div>);
}

/* ── mini-barras · sin ejes ──────────────────────────────────────────────── */
function SparkBars({ data, color = 'primary', height = 48 }) {
  const t = useChartTheme();
  const c = t.color(color);
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBar data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
          <Bar dataKey="v" fill={c} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </RBar>
      </ResponsiveContainer>
    </div>);
}

/* ── anillo de progreso (track + arco) ───────────────────────────────────── */
function Ring({ pct, size = 60, stroke = 7, color = 'primary' }) {
  const t = useChartTheme();
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const off = C * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.grid} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.color(color)} strokeWidth={stroke}
          strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[13px] font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>
    </div>);
}

/* ── segmented compacto (toggle de rango) ────────────────────────────────── */
function Seg({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={"h-6 px-2 rounded-[5px] font-mono text-[11px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {o.label}
          </button>);
      })}
    </div>);
}

/* ── footer link interactivo ─────────────────────────────────────────────── */
function FootLink({ children }) {
  const [hot, setHot] = useState(false);
  const go = (e) => { e.preventDefault(); setHot(true); setTimeout(() => setHot(false), 1400); };
  return (
    <a href="#" onClick={go} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
      {hot ? 'Abriendo…' : children}{!hot && <span aria-hidden="true">→</span>}
    </a>);
}

/* ── envoltura: nombre + descripción + preview (surface) + código ────────── */
const StatV = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>);

/* ════════════════════════════════════════════════════════════════════════
   DATOS (dominio musematic · flota de agentes)
   ════════════════════════════════════════════════════════════════════════ */
const KPIS = [
  { label: 'Active agents', value: '142', delta: '+6', dir: 'up', tone: 'pos', note: 'vs. 30d ago' },
  { label: 'Runs · 24h', value: '38,921', delta: '+12.4%', dir: 'up', tone: 'pos', note: 'vs. prev 24h' },
  { label: 'Avg latency', value: '842 ms', delta: '−8.1%', dir: 'down', tone: 'pos', note: 'vs. prev 24h' },
  { label: 'Spend · MTD', value: '$18,204', delta: '+4.2%', dir: 'up', tone: 'neg', note: 'vs. last month' },
];

const STRIP = [
  { label: 'Runs today', value: '38,921' },
  { label: 'Success rate', value: '99.2%' },
  { label: 'Avg latency', value: '842 ms' },
  { label: 'Spend today', value: '$612.40' },
];

/* sparkline por rango — la cifra y el delta se recalculan al cambiar el toggle */
const TREND = {
  '7d': {
    runs: { v: '38,921', d: '+12.4%', dir: 'up', tone: 'pos', data: [31,34,33,38,36,41,39].map(v => ({ v })) },
    lat:  { v: '842 ms', d: '−8.1%', dir: 'down', tone: 'pos', data: [910,884,902,861,852,848,842].map(v => ({ v })) },
    tok:  { v: '2.9M', d: '+18.0%', dir: 'up', tone: 'neutral', data: [2.1,2.3,2.2,2.6,2.5,2.8,2.9].map(v => ({ v })) },
  },
  '30d': {
    runs: { v: '1.09M', d: '+9.6%', dir: 'up', tone: 'pos', data: [28,30,29,33,31,30,34,32,36,35,38,37].map(v => ({ v })) },
    lat:  { v: '871 ms', d: '−3.4%', dir: 'down', tone: 'pos', data: [930,910,918,895,902,884,876,869,872,861,858,854].map(v => ({ v })) },
    tok:  { v: '78.4M', d: '+11.2%', dir: 'up', tone: 'neutral', data: [2.0,2.2,2.1,2.4,2.3,2.5,2.4,2.6,2.5,2.7,2.6,2.8].map(v => ({ v })) },
  },
  '90d': {
    runs: { v: '3.02M', d: '+22.8%', dir: 'up', tone: 'pos', data: [22,24,23,26,25,28,27,30,29,33,32,36].map(v => ({ v })) },
    lat:  { v: '908 ms', d: '+1.9%', dir: 'up', tone: 'neg', data: [870,882,876,890,898,905,912,902,909,915,906,911].map(v => ({ v })) },
    tok:  { v: '214M', d: '+34.0%', dir: 'up', tone: 'neutral', data: [1.6,1.8,1.9,2.0,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9].map(v => ({ v })) },
  },
};

const RUNS14 = [29,34,31,38,33,41,37,30,36,42,35,39,44,40].map(v => ({ v }));
const TOK14  = [18,21,19,24,22,20,26,23,27,25,29,24,28,31].map(v => ({ v }));

const RINGS = [
  { pct: 68, label: 'Budget used', sub: '$20.4k of $30k cap' },
  { pct: 99, label: 'SLA met', sub: 'target 99.0%' },
  { pct: 75, label: 'Concurrency', sub: '6 of 8 slots' },
];

const FOOTERS = [
  { icon: 'activity', label: 'Runs · 24h', value: '38,921', delta: '+12.4%', dir: 'up', tone: 'pos', link: 'View runs' },
  { icon: 'coin', label: 'Spend · MTD', value: '$18,204', delta: '+4.2%', dir: 'up', tone: 'neg', link: 'View billing' },
  { icon: 'clock', label: 'Avg latency', value: '842 ms', delta: '−8.1%', dir: 'down', tone: 'pos', link: 'View latency' },
];

/* ── snippets para pegar ─────────────────────────────────────────────────── */
const C_TREND = `// dir = forma de la flecha · tone = color (independientes)
const Trend = ({ dir = "up", tone = "pos", children }) => {
  const c = tone === "pos" ? "text-primary"
          : tone === "neg" ? "text-destructive"
          : "text-muted-foreground";
  return (
    <span className={\`inline-flex items-center gap-1 font-mono text-[12px] font-medium \${c}\`} style={{ fontVariantNumeric: "tabular-nums" }}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
        {dir === "up" ? <path d="M5 1.5 9 8.5H1z" fill="currentColor" />
                      : <path d="M5 8.5 1 1.5h8z" fill="currentColor" />}
      </svg>
      {children}
    </span>
  );
};`;

const C_SIMPLE = `// Rejilla de KPIs — bajar latencia/coste es bueno → flecha abajo, verde
<dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {kpis.map((s) => (
    <div key={s.label} className="rounded-lg border border-border bg-card p-5">
      <dt className="text-[13px] font-medium text-muted-foreground">{s.label}</dt>
      <dd className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-[26px] font-semibold tracking-tight text-foreground">{s.value}</span>
        <Trend dir={s.dir} tone={s.tone}>{s.delta}</Trend>
      </dd>
      <p className="mt-1 text-[12px] text-muted-foreground">{s.note}</p>
    </div>
  ))}
</dl>`;

const C_STRIP = `// Banda dividida — una sola tarjeta, KPIs separados por divisores
<dl className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border border-border bg-card
               divide-y divide-x divide-border overflow-hidden
               lg:divide-y-0">
  {strip.map((s) => (
    <div key={s.label} className="px-5 py-4">
      <dt className="text-[12px] font-medium text-muted-foreground">{s.label}</dt>
      <dd className="mt-1 text-[22px] font-semibold tracking-tight text-foreground tabular-nums">
        {s.value}
      </dd>
    </div>
  ))}
</dl>`;

const C_SPARK = `// Sparkline — área/línea sin ejes; el toggle recalcula cifra + delta
function Sparkline({ data, color = "primary", type = "area", height = 46 }) {
  const t = useChartTheme();
  const c = t.color(color);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Area type="monotone" dataKey="v" stroke={c} strokeWidth={1.75}
                fill={c} fillOpacity={0.13} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

<div className="rounded-lg border border-border bg-card p-5">
  <div className="flex items-center justify-between">
    <span className="text-[13px] font-medium text-muted-foreground">Runs</span>
    <Trend dir={m.dir} tone={m.tone}>{m.d}</Trend>
  </div>
  <div className="mt-1 text-[24px] font-semibold tracking-tight tabular-nums">{m.v}</div>
  <div className="mt-3"><Sparkline data={m.data} color="primary" type="area" /></div>
</div>`;

const C_BARS = `// Mini-barras — la forma diaria de los últimos 14 días
<div className="rounded-lg border border-border bg-card p-5">
  <div className="flex items-center justify-between">
    <span className="text-[13px] font-medium text-muted-foreground">Runs / day</span>
    <span className="font-mono text-[11px] text-muted-foreground">14d</span>
  </div>
  <div className="mt-1 text-[24px] font-semibold tracking-tight tabular-nums">40,118</div>
  <div className="mt-3"><SparkBars data={runs14} color="primary" /></div>
</div>`;

const C_RING = `// Anillo de progreso — track + arco; el centro repite el %
function Ring({ pct, size = 60, stroke = 7, color = "primary" }) {
  const t = useChartTheme();
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const off = C * (1 - Math.min(pct, 100) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.grid} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.color(color)} strokeWidth={stroke}
          strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-mono text-[13px] font-semibold tabular-nums">
        {pct}%
      </div>
    </div>
  );
}

<div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
  <Ring pct={68} />
  <div className="min-w-0">
    <p className="text-[13px] font-medium text-foreground">Budget used</p>
    <p className="text-[12px] text-muted-foreground">$20.4k of $30k cap</p>
  </div>
</div>`;

const C_FOOT = `// Icono + footer — cuadro de icono, cifra, delta y una acción
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="p-5">
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/14 text-primary">
        <ActivityIcon className="w-[18px] h-[18px]" />
      </span>
      <span className="text-[13px] font-medium text-muted-foreground">Runs · 24h</span>
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-[26px] font-semibold tracking-tight tabular-nums">38,921</span>
      <Trend dir="up" tone="pos">+12.4%</Trend>
    </div>
  </div>
  <div className="border-t border-border px-5 py-3">
    <a href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:text-primary/80">
      View runs <span aria-hidden>→</span>
    </a>
  </div>
</div>`;

/* ════════════════════════════════════════════════════════════════════════ */
function StatsSection() {
  const [range, setRange] = useState('7d');
  const tr = TREND[range];
  const sparks = [
    { key: 'runs', label: 'Runs', color: 'primary', type: 'area', m: tr.runs },
    { key: 'lat', label: 'Avg latency', color: 'cyan', type: 'line', m: tr.lat },
    { key: 'tok', label: 'Tokens', color: 'violet', type: 'area', m: tr.tok },
  ];

  return (
    <div>
      <SectionHead kicker="Datos" title="Stats" status="done"
        intro="La tarjeta de KPI: una etiqueta, una cifra grande y un delta con dirección — y, cuando ayuda, una mini gráfica de tendencia, barras o un anillo de progreso. La dirección de la flecha y su color son independientes: bajar la latencia o el coste es bueno (verde, flecha abajo); subir el gasto pide atención (rojo, flecha arriba). Para la banda de KPIs de una página, la cabecera de un dashboard o el resumen de la flota." />

      {/* 1 · Simple */}
      <StatV title="Simple" desc="La rejilla de KPIs por defecto: etiqueta, cifra y delta contra el periodo anterior. Cuatro tarjetas que pasan de una a cuatro columnas. Fíjate en latencia y coste: misma caída, distinto color." code={C_TREND + '\n\n' + C_SIMPLE}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-5">
              <dt className="text-[13px] font-medium text-muted-foreground">{s.label}</dt>
              <dd className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="font-sans text-[26px] font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>{s.value}</span>
                <Trend dir={s.dir} tone={s.tone}>{s.delta}</Trend>
              </dd>
              <p className="mt-1 text-[12px] text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </dl>
      </StatV>

      {/* 2 · Banda dividida */}
      <StatV title="Banda dividida" desc="Los mismos KPIs en una sola banda separada por divisores, sin tarjetas individuales. Para fijar bajo la cabecera de una página o de un dashboard, donde el espacio vertical escasea." code={C_STRIP}>
        <dl className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border border-border bg-card overflow-hidden divide-x divide-y lg:divide-y-0 divide-border">
          {STRIP.map((s) => (
            <div key={s.label} className="px-5 py-4">
              <dt className="text-[12px] font-medium text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-sans text-[22px] font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </StatV>

      {/* 3 · Con sparkline */}
      <StatV title="Con sparkline" desc="Cada tarjeta añade una mini gráfica de tendencia bajo la cifra — área para volumen, línea para latencia. El segmented cambia el rango y recalcula la cifra y el delta. La sparkline no tiene ejes: solo la forma." code={C_SPARK}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-[12px] font-medium text-muted-foreground">Tendencia de la flota</span>
          <Seg value={range} onChange={setRange} options={[{ value: '7d', label: '7d' }, { value: '30d', label: '30d' }, { value: '90d', label: '90d' }]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sparks.map(({ key, label, color, type, m }) => (
            <div key={key} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
                <Trend dir={m.dir} tone={m.tone}>{m.d}</Trend>
              </div>
              <div className="mt-1 font-sans text-[24px] font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{m.v}</div>
              <div className="mt-3"><Sparkline data={m.data} color={color} type={type} /></div>
            </div>
          ))}
        </div>
      </StatV>

      {/* 4 · Con mini-barras */}
      <StatV title="Con mini-barras" desc="Cuando la forma diaria importa más que la curva: barras compactas de los últimos 14 días. Color categórico por serie para distinguirlas de un vistazo." code={C_BARS}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px]">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">Runs / day</span>
              <span className="font-mono text-[11px] text-muted-foreground">14d</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-sans text-[24px] font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>40,118</span>
              <Trend dir="up" tone="pos">+7.9%</Trend>
            </div>
            <div className="mt-3"><SparkBars data={RUNS14} color="primary" /></div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">Tokens / day</span>
              <span className="font-mono text-[11px] text-muted-foreground">14d</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-sans text-[24px] font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>2.74M</span>
              <Trend dir="up" tone="neutral">+11.2%</Trend>
            </div>
            <div className="mt-3"><SparkBars data={TOK14} color="violet" /></div>
          </div>
        </div>
      </StatV>

      {/* 5 · Anillo de progreso */}
      <StatV title="Anillo de progreso" desc="Para métricas con meta o tope: un anillo marca el porcentaje y la cifra del centro lo repite. Presupuesto consumido, SLA cumplido y concurrencia de la flota." code={C_RING}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RINGS.map((r) => (
            <div key={r.label} className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
              <Ring pct={r.pct} />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">{r.label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5" style={{ textWrap: 'pretty' }}>{r.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </StatV>

      {/* 6 · Icono + footer */}
      <StatV title="Con icono + footer" desc="La anatomía completa: un cuadro de icono al frente, la cifra, el delta y una acción en el footer. El enlace responde al clic." code={C_FOOT}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FOOTERS.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <IconTile name={s.icon} />
                  <span className="text-[13px] font-medium text-muted-foreground">{s.label}</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans text-[26px] font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</span>
                  <Trend dir={s.dir} tone={s.tone}>{s.delta}</Trend>
                </div>
              </div>
              <div className="border-t border-border px-5 py-3">
                <FootLink>{s.link}</FootLink>
              </div>
            </div>
          ))}
        </div>
      </StatV>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['stats'] = StatsSection;
})();
