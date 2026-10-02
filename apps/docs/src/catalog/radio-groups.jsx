/* ============================================================================
   Gntik UI · radio-groups.jsx — selección única (grupo "Formularios").
   El radio de marca (anillo que se rellena de verde) en lista con descripción,
   tarjetas apiladas con check, y controles segmentados / pills para valores
   cortos. Dominio musematic (fallback, despliegue, intervalo, memoria).
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* radio de marca (mismo patrón que el plan-card de form-layouts) */
const Radio = ({ checked }) => (
  <span className={"flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors " + (checked ? 'border-primary bg-primary' : 'border-border bg-background')}>
    <span className={"size-1.5 rounded-full transition-colors " + (checked ? 'bg-primary-foreground' : 'bg-transparent')} />
  </span>
);

/* ── 1 · LISTA con descripción ───────────────────────────────────────────── */
const FALLBACKS = [
  { id: 'retry', label: 'Reintentar 3×', desc: 'Vuelve a llamar al mismo modelo con backoff antes de fallar.' },
  { id: 'cheap', label: 'Caer a modelo barato', desc: 'Conmuta a haiku-3.5 para no romper el SLA de latencia.' },
  { id: 'human', label: 'Escalar a humano', desc: 'Abre un ticket al operador on-call y pausa el run.' },
];
function ListRadio() {
  const [v, setV] = useState('retry');
  return (
    <fieldset className="mx-auto w-full max-w-lg" role="radiogroup" aria-label="Estrategia de fallback">
      <legend className="text-[13px] font-semibold text-foreground">Estrategia de fallback</legend>
      <div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40">
        {FALLBACKS.map(f => {
          const on = v === f.id;
          return (
            <label key={f.id} className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
              <input type="radio" name="fb" checked={on} onChange={() => setV(f.id)} className="sr-only" />
              <span className="mt-0.5"><Radio checked={on} /></span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-foreground">{f.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{f.desc}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── 2 · TARJETAS apiladas con check ─────────────────────────────────────── */
const DEPLOYS = [
  { id: 'shared', name: 'Compartido', spec: 'CPU compartida · arranque en frío', price: 'Gratis' },
  { id: 'dedicated', name: 'Dedicado', spec: '2 vCPU · siempre caliente', price: '$80/mes', tag: 'recomendado' },
  { id: 'isolated', name: 'Aislado (VPC)', spec: 'Red privada · sin vecinos', price: '$240/mes' },
];
function CardRadio() {
  const [v, setV] = useState('dedicated');
  return (
    <fieldset className="mx-auto w-full max-w-lg" role="radiogroup" aria-label="Modo de despliegue">
      <legend className="mb-3 text-[13px] font-semibold text-foreground">Modo de despliegue</legend>
      <div className="space-y-3">
        {DEPLOYS.map(d => {
          const on = v === d.id;
          return (
            <label key={d.id}
              className={"flex cursor-pointer items-center gap-3.5 rounded-md border bg-background px-4 py-3.5 transition-colors " +
                (on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40')}>
              <input type="radio" name="dep" checked={on} onChange={() => setV(d.id)} className="sr-only" />
              <Radio checked={on} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">{d.name}</span>
                  {d.tag && <span className="inline-flex items-center rounded bg-primary/14 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">{d.tag}</span>}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">{d.spec}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="text-[13px] font-semibold text-foreground">{d.price}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── 3 · SEGMENTADO + PILLS ──────────────────────────────────────────────── */
function SegmentedRadio() {
  const [interval, setInterval] = useState('5m');
  const [mem, setMem] = useState('1 GB');
  const INTERVALS = ['1m', '5m', '15m', '1h'];
  const MEMS = ['512 MB', '1 GB', '2 GB', '4 GB'];
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
      {/* segmentado */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-foreground">Intervalo de refresco</div>
        <div role="radiogroup" aria-label="Intervalo" className="inline-flex rounded-md bg-secondary/70 p-0.5 shadow-sm">
          {INTERVALS.map(o => {
            const on = interval === o;
            return (
              <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setInterval(o)}
                className={"h-8 rounded-[6px] px-3.5 font-mono text-[12.5px] font-medium transition-colors " +
                  (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{o}</button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">Pista enmarcada, segmento activo elevado — para 2–4 valores cortos.</p>
      </div>

      {/* pills con anillo */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-foreground">Memoria por agente</div>
        <div role="radiogroup" aria-label="Memoria" className="flex flex-wrap gap-2">
          {MEMS.map(o => {
            const on = mem === o;
            return (
              <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setMem(o)}
                className={"inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors " +
                  (on ? 'border-primary/60 bg-primary/10 text-foreground ring-1 ring-primary/25' : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40')}>
                {on && <Icon name="check" size={14} className="text-primary" stroke={2.4} />}{o}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">Pills con borde; el activo toma el anillo verde y el tick.</p>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_RADIO = `// Radio de marca — anillo que se rellena; el input va sr-only
const Radio = ({ checked }) => (
  <span className={\`flex size-[18px] items-center justify-center rounded-full border \${
    checked ? 'border-primary bg-primary' : 'border-border bg-background'}\`}>
    <span className={\`size-1.5 rounded-full \${checked ? 'bg-primary-foreground' : 'bg-transparent'}\`} />
  </span>
);

<label className="flex items-start gap-3 px-4 py-3.5 cursor-pointer">
  <input type="radio" name="fb" checked={on} onChange={() => setV(id)} className="sr-only" />
  <span className="mt-0.5"><Radio checked={on} /></span>
  <span>
    <span className="block text-[13px] font-medium text-foreground">{label}</span>
    <span className="block text-[12.5px] text-muted-foreground">{desc}</span>
  </span>
</label>`;

const CODE_CARD = `// Tarjeta apilada — el anillo de marca marca la elección, precio a la derecha
<label className={\`flex items-center gap-3.5 rounded-md border bg-background px-4 py-3.5 cursor-pointer \${
  on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'}\`}>
  <input type="radio" name="dep" checked={on} onChange={pick} className="sr-only" />
  <Radio checked={on} />
  <span className="flex-1">{name} · <small>{spec}</small></span>
  <span className="font-semibold text-foreground">{price}</span>
</label>`;

const CODE_SEG = `// Segmentado — pista bg-secondary, segmento activo elevado (bg-card)
<div role="radiogroup" className="inline-flex rounded-md bg-secondary/70 p-0.5 shadow-sm">
  {opts.map((o) => (
    <button key={o} role="radio" aria-checked={v === o} onClick={() => setV(o)}
      className={\`h-8 rounded-[6px] px-3.5 text-[12.5px] font-medium \${
        v === o ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}\`}>{o}</button>
  ))}
</div>

// Pills con anillo — el activo toma border-primary + ring + tick
<button className={\`h-9 rounded-md border px-3 text-[13px] font-medium \${
  on ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/25' : 'border-border bg-background text-muted-foreground'}\`}>
  {on && <CheckIcon className="text-primary" />}{label}
</button>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function RadioGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Radio groups" status="done"
        intro="Selección única con el radio de marca: un anillo que se rellena de verde con un punto interior, sobre el input nativo oculto. Tres densidades — una lista con descripción para estrategias, tarjetas apiladas con precio para el modo de despliegue, y controles compactos (segmentado y pills) para valores cortos como el intervalo o la memoria." />

      <Variant title="Lista con descripción"
        desc="El caso por defecto: radio arriba a la izquierda, etiqueta y una línea que explica la opción. Para decisiones que necesitan contexto."
        code={CODE_RADIO}>
        <ListRadio />
      </Variant>

      <Variant title="Tarjetas apiladas"
        desc="Cada opción es una tarjeta con spec y precio; la elegida toma el anillo de marca. El patrón para planes, tamaños o modos de despliegue."
        code={CODE_CARD}>
        <CardRadio />
      </Variant>

      <Variant title="Segmentado y pills"
        desc="Para 2–4 valores cortos: un control segmentado con la pista enmarcada y el segmento activo elevado, y pills con borde que toman el anillo verde al seleccionarse."
        code={CODE_SEG}>
        <SegmentedRadio />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['radio-groups'] = RadioGroupsSection;
})();
