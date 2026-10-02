/* ============================================================================
   Gntik UI · billing-usage.jsx — subcategoría "Billing & usage" (grupo Datos).
   Cómo presentar consumo y coste con claridad: el plan actual, medidores de
   cuota, el desglose de la próxima factura, gasto contra presupuesto, la
   composición del coste y el historial de facturas. El verde de marca = sano;
   ámbar cerca del tope, rojo en overage — la severidad nunca se confunde con
   la marca. Dominio musematic · todo en tokens.
   Variantes: plan actual · medidores de uso · resumen de factura ·
   gasto vs presupuesto · desglose de coste · historial.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── envoltura: nombre + descripción + preview (card) + código ───────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── segmented compacto (toggle) ─────────────────────────────────────────── */
function Seg({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={"h-6 px-2.5 rounded-[5px] font-mono text-[11px] font-medium transition-colors " + (on ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {o.label}
          </button>);
      })}
    </div>);
}

/* ── botones de acción ───────────────────────────────────────────────────── */
const GhostBtn = ({ children }) => (
  <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const PrimaryBtn = ({ children }) => (
  <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors">{children}</button>
);

/* ── medidor de cuota · tono por % (verde → ámbar → rojo en overage) ──────── */
function Meter({ label, pct, used, total, unit, note }) {
  const tone = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
  const fill = { ok: 'bg-primary', warn: 'bg-warning', over: 'bg-destructive' }[tone];
  const txt = { ok: 'text-foreground', warn: 'text-warning', over: 'text-destructive' }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums whitespace-nowrap">
          <span className={"font-semibold " + txt}>{used}</span> / {total} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={"h-full rounded-full " + fill} style={{ width: Math.min(pct, 100) + '%', transition: 'width .4s ease' }} />
      </div>
      {note && <p className="mt-1.5 font-mono text-[11px] text-destructive">{note}</p>}
    </div>
  );
}

/* ── enlace de descarga interactivo (por fila) ───────────────────────────── */
function DownloadLink({ size = 15, label = 'PDF' }) {
  const [done, setDone] = useState(false);
  const go = (e) => { e.preventDefault(); setDone(true); setTimeout(() => setDone(false), 1500); };
  return (
    <a href="#" onClick={go} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
      <Icon name={done ? 'check' : 'download'} size={size} />{done ? 'Descargado' : label}
    </a>);
}

/* ════════════════════════════════════════════════════════════════════════
   DATOS (dominio musematic · facturación de la flota)
   ════════════════════════════════════════════════════════════════════════ */

/* medidores: ciclo actual vs proyectado a fin de ciclo */
const USAGE = {
  actual: [
    { label: 'Agent runs', pct: 83, used: '412,800', total: '500,000', unit: 'runs' },
    { label: 'Tokens', pct: 65, used: '78.4M', total: '120M', unit: 'tokens' },
    { label: 'Storage', pct: 71, used: '14.2', total: '20', unit: 'GB' },
    { label: 'Operator seats', pct: 76, used: '38', total: '50', unit: 'seats' },
  ],
  proyectado: [
    { label: 'Agent runs', pct: 104, used: '521,000', total: '500,000', unit: 'runs', note: '+21,000 sobre el plan · ~$63.00 de overage' },
    { label: 'Tokens', pct: 82, used: '99.1M', total: '120M', unit: 'tokens' },
    { label: 'Storage', pct: 86, used: '17.1', total: '20', unit: 'GB' },
    { label: 'Operator seats', pct: 76, used: '38', total: '50', unit: 'seats' },
  ],
};

/* líneas de la próxima factura — algunas con medidor de uso */
const INVOICE = [
  { name: 'Plan Scale', desc: 'Suscripción base · ciclo mensual', value: '$1,200.00' },
  { name: 'Agent runs', desc: '412,800 de 500,000 incluidos', value: '$0.00', pct: 83 },
  { name: 'Tokens', desc: '78.4M de 120M incluidos', value: '$0.00', pct: 65 },
  { name: 'Storage', desc: '14.2 GB de 20 GB incluidos', value: '$0.00', pct: 71 },
  { name: 'Región US-East', desc: 'Add-on · residencia adicional', value: '$180.00' },
  { name: 'Soporte premium', desc: 'Add-on · SLA 1h', value: '$240.00' },
];

/* composición del coste del ciclo */
const BREAKDOWN = [
  { label: 'Compute / runs', amount: '$740.00', pct: 45.7, dot: 'bg-primary' },
  { label: 'Tokens', amount: '$410.00', pct: 25.3, dot: 'bg-category-violet' },
  { label: 'Storage', amount: '$190.00', pct: 11.7, dot: 'bg-category-cyan' },
  { label: 'Add-ons', amount: '$280.00', pct: 17.3, dot: 'bg-muted-foreground' },
];

/* historial de facturas */
const HISTORY = [
  { period: 'Mayo 2026', date: 'Vence 1 jun', amount: '$1,620.00', status: 'due' },
  { period: 'Abril 2026', date: 'Pagada 1 may', amount: '$1,584.20', status: 'paid' },
  { period: 'Marzo 2026', date: 'Pagada 1 abr', amount: '$1,498.00', status: 'paid' },
  { period: 'Febrero 2026', date: 'Pagada 1 mar', amount: '$1,432.60', status: 'paid' },
];

const INVOICE_STATUS = {
  paid: ['Pagada', 'bg-primary/14 text-primary'],
  due: ['Pendiente', 'bg-warning/16 text-warning'],
};

/* ── snippets para pegar ─────────────────────────────────────────────────── */
const C_METER = `// Medidor — el tono lo fija el % de cuota: verde sano, ámbar cerca del
// tope, rojo en overage. La marca (verde) nunca señala severidad.
function Meter({ label, pct, used, total, unit, note }) {
  const tone = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  const fill = { ok: "bg-primary", warn: "bg-warning", over: "bg-destructive" }[tone];
  const txt  = { ok: "text-foreground", warn: "text-warning", over: "text-destructive" }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
          <span className={\`font-semibold \${txt}\`}>{used}</span> / {total} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={\`h-full rounded-full \${fill}\`}
             style={{ width: Math.min(pct, 100) + "%" }} />
      </div>
      {note && <p className="mt-1.5 font-mono text-[11px] text-destructive">{note}</p>}
    </div>
  );
}`;

const C_PLAN = `// Plan actual — cabecera de la página de billing: plan, precio segun ciclo,
// renovación y acciones. El toggle mensual/anual recalcula el precio.
<div className="rounded-lg border border-border bg-card p-6">
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-[17px] font-semibold tracking-tight text-foreground">Plan Scale</h3>
        <span className="rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">Activo</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Renueva el 1 de junio de 2026 · 50 asientos · EU + US</p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums">$1,200</span>
        <span className="text-[13px] text-muted-foreground">/ mes</span>
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold">Gestionar</button>
      <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold">Mejorar plan</button>
    </div>
  </div>
</div>`;

const C_INVOICE = `// Resumen de factura — líneas con su importe; las medidas muestran un
// medidor fino de uso. El footer cierra con el total del ciclo.
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <ul className="divide-y divide-border">
    {items.map((it) => (
      <li key={it.name} className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13.5px] font-medium text-foreground">{it.name}</p>
          <p className="font-mono text-[13px] font-medium text-foreground tabular-nums">{it.value}</p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-[12px] text-muted-foreground">{it.desc}</p>
        </div>
        {it.pct != null && (
          <div className="mt-2 h-1.5 w-full max-w-[40%] rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: it.pct + "%" }} />
          </div>
        )}
      </li>
    ))}
  </ul>
  <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3.5">
    <span className="text-[13px] font-medium text-foreground">Total estimado · ciclo de mayo</span>
    <span className="font-mono text-[15px] font-semibold text-foreground tabular-nums">$1,620.00</span>
  </div>
</div>`;

const C_BUDGET = `// Gasto vs presupuesto — fill = gasto MTD, fantasma = proyectado, marca de
// alerta al 90%. El estado lo decide proyectado vs tope, no el color de marca.
<div className="relative pt-5">
  <div className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-warning" style={{ left: "90%" }}>Alerta 90%</div>
  <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
    <div className="absolute inset-y-0 left-0 bg-primary/25" style={{ width: "84.5%" }} />
    <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: "59%" }} />
    <div className="absolute inset-y-0 bg-warning" style={{ left: "90%", width: "2px" }} />
  </div>
</div>`;

const C_BREAKDOWN = `// Desglose de coste — una barra segmentada por categoría + leyenda con
// importe y %. Colores categóricos de los tokens, no severidad.
<div className="flex h-3 w-full overflow-hidden rounded-full">
  {parts.map((p) => (
    <div key={p.label} className={p.dot} style={{ width: p.pct + "%" }} title={p.label} />
  ))}
</div>
<ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
  {parts.map((p) => (
    <li key={p.label} className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[13px] text-foreground">
        <span className={\`h-2.5 w-2.5 rounded-[3px] \${p.dot}\`} />{p.label}
      </span>
      <span className="font-mono text-[12.5px] text-muted-foreground tabular-nums">{p.amount}</span>
    </li>
  ))}
</ul>`;

/* ════════════════════════════════════════════════════════════════════════ */
function BillingUsageSection() {
  const [cycle, setCycle] = useState('mensual');
  const [scope, setScope] = useState('actual');
  const price = cycle === 'mensual'
    ? { big: '$1,200', unit: '/ mes', note: 'Facturado mensualmente' }
    : { big: '$1,000', unit: '/ mes', note: 'Facturado anual ($12,000) · 2 meses gratis' };
  const meters = USAGE[scope];

  return (
    <div>
      <SectionHead kicker="Datos" title="Billing & usage" status="done"
        intro="Cómo presentar consumo y coste con claridad. El plan actual como cabecera, medidores que muestran cada cuota contra su tope, el desglose de la próxima factura, el gasto contra el presupuesto del mes, la composición del coste y el historial. Una regla de color: el verde de marca significa sano; el ámbar avisa cerca del tope y el rojo marca el overage — la severidad nunca se confunde con la marca." />

      {/* 1 · Plan actual */}
      <Variant title="Plan actual"
        desc="La cabecera de la página de billing: el plan, su precio según el ciclo, la fecha de renovación y las acciones. El toggle mensual/anual recalcula el precio en vivo."
        code={C_PLAN}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-semibold tracking-tight text-foreground">Plan Scale</h3>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />Activo
              </span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">Renueva el 1 de junio de 2026 · 50 asientos · regiones EU + US</p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-sans text-[30px] font-semibold tracking-tight text-foreground tabular-nums" style={{ letterSpacing: '-0.02em' }}>{price.big}</span>
              <span className="text-[13px] text-muted-foreground">{price.unit}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{price.note}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Seg value={cycle} onChange={setCycle} options={[{ value: 'mensual', label: 'Mensual' }, { value: 'anual', label: 'Anual −16%' }]} />
            <div className="flex items-center gap-2">
              <GhostBtn>Gestionar</GhostBtn>
              <PrimaryBtn><Icon name="spark" size={15} />Mejorar plan</PrimaryBtn>
            </div>
          </div>
        </div>
      </Variant>

      {/* 2 · Medidores de uso */}
      <Variant title="Medidores de uso"
        desc="El núcleo: cada cuota incluida en el plan con su barra de consumo. El relleno es verde mientras hay margen, pasa a ámbar al acercarse al tope y a rojo cuando se rebasa. El toggle alterna entre el consumo del ciclo actual y la proyección a fin de ciclo — donde los runs ya superan el plan."
        code={C_METER}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <span className="text-[12px] font-medium text-muted-foreground">Ciclo de mayo · cuotas del plan Scale</span>
          <Seg value={scope} onChange={setScope} options={[{ value: 'actual', label: 'Ciclo actual' }, { value: 'proyectado', label: 'Proyectado' }]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {meters.map((m) => <Meter key={m.label} {...m} />)}
        </div>
      </Variant>

      {/* 3 · Resumen de factura */}
      <Variant title="Resumen de factura"
        desc="El desglose de la próxima factura: una línea por concepto con su importe a la derecha. Los conceptos medidos llevan un medidor fino para situar el consumo de un vistazo. El footer cierra con el total del ciclo."
        code={C_INVOICE}>
        <div className="max-w-[640px] rounded-lg border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {INVOICE.map((it) => (
              <li key={it.name} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[13.5px] font-medium text-foreground">{it.name}</p>
                  <p className="font-mono text-[13px] font-medium text-foreground tabular-nums">{it.value}</p>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{it.desc}</p>
                {it.pct != null && (
                  <div className="mt-2 h-1.5 w-full max-w-[44%] rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: it.pct + '%' }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary/40 px-5 py-3.5">
            <span className="text-[13px] font-medium text-foreground">Total estimado · ciclo de mayo</span>
            <span className="font-mono text-[15px] font-semibold text-foreground tabular-nums">$1,620.00</span>
          </div>
        </div>
      </Variant>

      {/* 4 · Gasto vs presupuesto */}
      <Variant title="Gasto vs presupuesto"
        desc="Una barra para leer el ritmo de gasto: el tramo sólido es el gasto a la fecha, el fantasma es la proyección a fin de mes y la marca de alerta señala el 90% del tope. El estado lo decide la proyección contra el tope — verde si entra dentro, no porque sea la marca."
        code={C_BUDGET}>
        <div className="max-w-[640px]">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-[26px] font-semibold tracking-tight text-foreground tabular-nums" style={{ letterSpacing: '-0.02em' }}>$1,184.20</span>
              <span className="text-[12.5px] text-muted-foreground">de $2,000.00 de tope</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />Dentro del tope
            </span>
          </div>
          <div className="relative pt-5">
            <div className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-warning whitespace-nowrap" style={{ left: '90%' }}>Alerta 90%</div>
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary/25" style={{ width: '84.5%' }} />
              <div className="absolute inset-y-0 left-0 bg-primary rounded-r-full" style={{ width: '59%' }} />
              <div className="absolute inset-y-0 bg-warning" style={{ left: '90%', width: '2px' }} />
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {[['Gasto MTD', '$1,184.20', 'bg-primary'], ['Proyectado fin de mes', '$1,690.00', 'bg-primary/25'], ['Tope mensual', '$2,000.00', 'bg-secondary']].map(([k, v, dot]) => (
              <div key={k}>
                <dt className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span className={"h-2 w-2 rounded-[2px] " + dot} />{k}
                </dt>
                <dd className="mt-1 font-mono text-[14px] font-semibold text-foreground tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Variant>

      {/* 5 · Desglose de coste */}
      <Variant title="Desglose de coste"
        desc="A dónde va el gasto del ciclo: una sola barra segmentada por categoría, con una leyenda que repite el importe y el porcentaje. Usa los acentos categóricos de los tokens — no los colores de severidad — para no robarle significado al ámbar y al rojo."
        code={C_BREAKDOWN}>
        <div className="max-w-[560px]">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <span className="text-[12px] font-medium text-muted-foreground">Coste del ciclo por categoría</span>
            <span className="font-mono text-[13px] font-semibold text-foreground tabular-nums">$1,620.00</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary gap-0.5">
            {BREAKDOWN.map((p) => (
              <div key={p.label} className={p.dot} style={{ width: p.pct + '%' }} title={p.label} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {BREAKDOWN.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-foreground">
                  <span className={"h-2.5 w-2.5 rounded-[3px] shrink-0 " + p.dot} />{p.label}
                </span>
                <span className="font-mono text-[12.5px] text-muted-foreground tabular-nums whitespace-nowrap">{p.amount} · {p.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 6 · Historial */}
      <Variant title="Historial"
        desc="Las facturas anteriores en una tabla compacta: periodo, estado, importe y descarga. El estado distingue pagada (verde) de pendiente (ámbar); cada fila descarga su PDF."
        code={`// Estado: pagada (verde de marca) vs pendiente (ámbar) — descarga por fila
<tr className="border-t border-border">
  <td className="py-3 text-[13px] font-medium text-foreground">Abril 2026</td>
  <td className="py-3">
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/14 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />Pagada
    </span>
  </td>
  <td className="py-3 text-right font-mono text-[13px] text-foreground tabular-nums">$1,584.20</td>
  <td className="py-3 text-right"><a href="#" className="text-[12.5px] font-semibold text-primary">PDF</a></td>
</tr>`}>
        <div className="max-w-[640px] overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/40">
                <th className="px-4 py-2.5 text-left font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Periodo</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 text-right font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Importe</th>
                <th className="px-4 py-2.5 text-right font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Factura</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((r) => {
                const [label, cls] = INVOICE_STATUS[r.status];
                return (
                  <tr key={r.period} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium text-foreground">{r.period}</div>
                      <div className="text-[11.5px] text-muted-foreground">{r.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-semibold " + cls}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />{label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] text-foreground tabular-nums">{r.amount}</td>
                    <td className="px-4 py-3 text-right"><DownloadLink /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Variant>
    </div>);
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['billing-usage'] = BillingUsageSection;
})();
