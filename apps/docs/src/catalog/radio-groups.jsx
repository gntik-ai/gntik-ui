/* ============================================================================
   Gntik UI · radio-groups.jsx — single selection ("Forms" group).
   The brand radio (ring that fills green) as a list with descriptions,
   stacked cards with a check, and segmented controls / pills for short
   values. Neutral fixtures (fallback, deployment, interval, memory).
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

/* brand radio (same pattern as the plan card in form-layouts) */
const Radio = ({ checked }) => (
  <span className={"flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors " + (checked ? 'border-primary bg-primary' : 'border-border bg-background')}>
    <span className={"size-1.5 rounded-full transition-colors " + (checked ? 'bg-primary-foreground' : 'bg-transparent')} />
  </span>
);

/* ── 1 · LIST with description ───────────────────────────────────────────── */
const FALLBACKS = [
  { id: 'retry', label: 'Retry 3×', desc: 'Calls the same upstream again with backoff before failing.' },
  { id: 'cheap', label: 'Fall back to a cheaper tier', desc: 'Switches to the lite tier to keep the latency SLA.' },
  { id: 'human', label: 'Escalate to a human', desc: 'Opens a ticket for the on-call operator and pauses the run.' },
];
function ListRadio() {
  const [v, setV] = useState('retry');
  return (
    <fieldset className="mx-auto w-full max-w-lg" role="radiogroup" aria-label="Fallback strategy">
      <legend className="text-[13px] font-semibold text-foreground">Fallback strategy</legend>
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

/* ── 2 · STACKED CARDS with check ────────────────────────────────────────── */
const DEPLOYS = [
  { id: 'shared', name: 'Shared', spec: 'Shared CPU · cold start', price: 'Free' },
  { id: 'dedicated', name: 'Dedicated', spec: '2 vCPU · always warm', price: '$80/mo', tag: 'recommended' },
  { id: 'isolated', name: 'Isolated (VPC)', spec: 'Private network · no neighbors', price: '$240/mo' },
];
function CardRadio() {
  const [v, setV] = useState('dedicated');
  return (
    <fieldset className="mx-auto w-full max-w-lg" role="radiogroup" aria-label="Deployment mode">
      <legend className="mb-3 text-[13px] font-semibold text-foreground">Deployment mode</legend>
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

/* ── 3 · SEGMENTED + PILLS ───────────────────────────────────────────────── */
function SegmentedRadio() {
  const [interval, setInterval] = useState('5m');
  const [mem, setMem] = useState('1 GB');
  const INTERVALS = ['1m', '5m', '15m', '1h'];
  const MEMS = ['512 MB', '1 GB', '2 GB', '4 GB'];
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
      {/* segmented */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-foreground">Refresh interval</div>
        <div role="radiogroup" aria-label="Interval" className="inline-flex rounded-md bg-secondary/70 p-0.5 shadow-sm">
          {INTERVALS.map(o => {
            const on = interval === o;
            return (
              <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setInterval(o)}
                className={"h-8 rounded-[6px] px-3.5 font-mono text-[12.5px] font-medium transition-colors " +
                  (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{o}</button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">Framed track, raised active segment — for 2–4 short values.</p>
      </div>

      {/* pills with ring */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-foreground">Memory per instance</div>
        <div role="radiogroup" aria-label="Memory" className="flex flex-wrap gap-2">
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
        <p className="mt-3 text-[12px] text-muted-foreground">Bordered pills; the active one takes the green ring and the tick.</p>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_RADIO = `// Brand radio — a ring that fills; the input is sr-only
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

const CODE_CARD = `// Stacked card — the brand ring marks the choice, price on the right
<label className={\`flex items-center gap-3.5 rounded-md border bg-background px-4 py-3.5 cursor-pointer \${
  on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'}\`}>
  <input type="radio" name="dep" checked={on} onChange={pick} className="sr-only" />
  <Radio checked={on} />
  <span className="flex-1">{name} · <small>{spec}</small></span>
  <span className="font-semibold text-foreground">{price}</span>
</label>`;

const CODE_SEG = `// Segmented — bg-secondary track, raised active segment (bg-card)
<div role="radiogroup" className="inline-flex rounded-md bg-secondary/70 p-0.5 shadow-sm">
  {opts.map((o) => (
    <button key={o} role="radio" aria-checked={v === o} onClick={() => setV(o)}
      className={\`h-8 rounded-[6px] px-3.5 text-[12.5px] font-medium \${
        v === o ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}\`}>{o}</button>
  ))}
</div>

// Pills with ring — the active one takes border-primary + ring + tick
<button className={\`h-9 rounded-md border px-3 text-[13px] font-medium \${
  on ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/25' : 'border-border bg-background text-muted-foreground'}\`}>
  {on && <CheckIcon className="text-primary" />}{label}
</button>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function RadioGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Radio groups" status="done"
        intro="Single selection with the brand radio: a ring that fills green with an inner dot, over the hidden native input. Three densities — a list with descriptions for strategies, stacked cards with prices for the deployment mode, and compact controls (segmented and pills) for short values like the interval or memory." />

      <Variant title="List with description"
        desc="The default case: radio at the top left, a label and a line explaining the option. For decisions that need context."
        code={CODE_RADIO}>
        <ListRadio />
      </Variant>

      <Variant title="Stacked cards"
        desc="Each option is a card with spec and price; the chosen one takes the brand ring. The pattern for plans, sizes or deployment modes."
        code={CODE_CARD}>
        <CardRadio />
      </Variant>

      <Variant title="Segmented and pills"
        desc="For 2–4 short values: a segmented control with a framed track and a raised active segment, and bordered pills that take the green ring when selected."
        code={CODE_SEG}>
        <SegmentedRadio />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['radio-groups'] = RadioGroupsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
