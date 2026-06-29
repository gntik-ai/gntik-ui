/* ============================================================================
   Gntik UI · checkboxes.jsx — casillas (grupo "Formularios").
   El checkbox de marca (input nativo estilizado, check verde) en lista con
   descripción, en grupo con "seleccionar todo" indeterminado, y como tarjetas
   multiselección. Dominio musematic (guardrails, namespaces, capacidades).
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

/* checkbox de marca con soporte indeterminate (mismo patrón que en Tables) */
const Check = ({ checked, indeterminate, onChange, disabled }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px] shrink-0">
    <input type="checkbox" checked={checked} disabled={disabled} ref={el => el && (el.indeterminate = !!indeterminate)} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-background cursor-pointer checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);

/* ── 1 · LISTA con descripción ───────────────────────────────────────────── */
const GUARDRAILS = [
  { id: 'pii', label: 'Redacción de PII', desc: 'Enmascara emails, tarjetas y teléfonos antes de llegar al modelo.' },
  { id: 'allow', label: 'Allowlist de tools', desc: 'El agente solo puede invocar herramientas aprobadas para su namespace.' },
  { id: 'audit', label: 'Log de auditoría', desc: 'Registra cada llamada y respuesta para revisión de compliance.' },
];
function ListWithDesc() {
  const [on, setOn] = useState({ pii: true, allow: true, audit: false });
  return (
    <fieldset className="mx-auto w-full max-w-lg">
      <legend className="text-[13px] font-semibold text-foreground">Guardrails del agente</legend>
      <div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40">
        {GUARDRAILS.map(g => (
          <label key={g.id} htmlFor={'gr-' + g.id} className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
            <span className="mt-0.5"><Check checked={!!on[g.id]} onChange={() => setOn(o => ({ ...o, [g.id]: !o[g.id] }))} /></span>
            <span className="min-w-0">
              <span id={'gr-' + g.id} className="block text-[13px] font-medium text-foreground">{g.label}</span>
              <span className="mt-0.5 block text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{g.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ── 2 · GRUPO con "seleccionar todo" (indeterminate) ────────────────────── */
const NAMESPACES = ['checkout-agents', 'support-tier1', 'data-pipeline', 'billing-bot', 'onboarding'];
function SelectAll() {
  const [sel, setSel] = useState(['checkout-agents', 'support-tier1']);
  const all = sel.length === NAMESPACES.length;
  const some = sel.length > 0 && !all;
  const toggleAll = () => setSel(all ? [] : [...NAMESPACES]);
  const toggle = (n) => setSel(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);
  return (
    <div className="mx-auto w-full max-w-lg">
      <label className="flex items-center gap-3 border-b border-border pb-3">
        <Check checked={all} indeterminate={some} onChange={toggleAll} />
        <span className="text-[13px] font-semibold text-foreground">Incluir todos los namespaces</span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{sel.length}/{NAMESPACES.length}</span>
      </label>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {NAMESPACES.map(n => (
          <label key={n} className="flex cursor-pointer items-center gap-3">
            <Check checked={sel.includes(n)} onChange={() => toggle(n)} />
            <span className="font-mono text-[12.5px] text-foreground">{n}</span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-muted-foreground">La cabecera entra en estado indeterminado (raya) cuando hay una selección parcial.</p>
    </div>
  );
}

/* ── 3 · TARJETAS multiselección ─────────────────────────────────────────── */
const CAPS = [
  { id: 'web', icon: 'search', label: 'Búsqueda web', desc: 'Consulta fuentes en vivo durante el run.' },
  { id: 'code', icon: 'code', label: 'Ejecución de código', desc: 'Sandbox aislado para Python y JS.' },
  { id: 'files', icon: 'box', label: 'Acceso a ficheros', desc: 'Lee y escribe en el bucket del workspace.' },
  { id: 'tools', icon: 'bolt', label: 'Llamada a tools', desc: 'Invoca las APIs registradas del namespace.' },
];
function CardChecks() {
  const [sel, setSel] = useState(['web', 'tools']);
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <fieldset className="mx-auto w-full max-w-2xl">
      <legend className="mb-3 text-[13px] font-semibold text-foreground">Capacidades del agente</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CAPS.map(c => {
          const on = sel.includes(c.id);
          return (
            <label key={c.id}
              className={"relative flex cursor-pointer gap-3 rounded-md border bg-background p-4 transition-colors " +
                (on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40')}>
              <input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="sr-only" />
              <span className={"grid size-9 shrink-0 place-items-center rounded-md transition-colors " + (on ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground')}>
                <Icon name={c.icon} size={17} />
              </span>
              <span className="min-w-0 pr-6">
                <span className="block text-[13px] font-semibold text-foreground">{c.label}</span>
                <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{c.desc}</span>
              </span>
              <span className={"absolute right-3 top-3 grid size-[18px] place-items-center rounded-[5px] border transition-all " + (on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-transparent')}>
                <Icon name="check" size={12} stroke={2.6} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_CHECK = `// Checkbox de marca — input nativo estilizado (soporta indeterminate)
const Check = ({ checked, indeterminate, onChange }) => (
  <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
    <input type="checkbox" checked={checked} onChange={onChange}
      ref={(el) => el && (el.indeterminate = !!indeterminate)}
      className="peer h-[18px] w-[18px] appearance-none rounded-[5px] border border-border bg-background
                 cursor-pointer transition-colors checked:bg-primary checked:border-primary
                 indeterminate:bg-primary indeterminate:border-primary" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0
                     peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);`;

const CODE_LIST = `// Lista con descripción — check arriba (items-start), texto en dos líneas
<div className="divide-y divide-border/60 rounded-md border border-border bg-background/40">
  {items.map((it) => (
    <label key={it.id} className="flex items-start gap-3 px-4 py-3.5 cursor-pointer">
      <span className="mt-0.5"><Check checked={on[it.id]} onChange={() => toggle(it.id)} /></span>
      <span>
        <span className="block text-[13px] font-medium text-foreground">{it.label}</span>
        <span className="block text-[12.5px] text-muted-foreground">{it.desc}</span>
      </span>
    </label>
  ))}
</div>`;

const CODE_ALL = `// Seleccionar todo — la cabecera va indeterminate con selección parcial
const all = sel.length === items.length;
const some = sel.length > 0 && !all;
<Check checked={all} indeterminate={some} onChange={() => setSel(all ? [] : [...items])} />`;

const CODE_CARDS = `// Tarjeta multiselección — input sr-only; el borde/anillo y el tick son la UI
<label className={\`relative flex gap-3 rounded-md border bg-background p-4 cursor-pointer \${
  on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'}\`}>
  <input type="checkbox" checked={on} onChange={toggle} className="sr-only" />
  <span className={\`grid size-9 place-items-center rounded-md \${on ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}\`}><Icon /></span>
  <span>{title}<small>{desc}</small></span>
  <span className={\`absolute right-3 top-3 grid size-[18px] place-items-center rounded-[5px] border \${
    on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'}\`}><CheckIcon /></span>
</label>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function CheckboxesSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Checkboxes" status="done"
        intro="El checkbox de marca es un input nativo estilizado: casilla recessed que se rellena de verde con el tick en primary-foreground, y soporta el estado indeterminado. Aquí en sus tres formas — lista con descripción para guardrails, grupo con «seleccionar todo» para namespaces, y tarjetas multiselección para capacidades del agente." />

      <Variant title="Lista con descripción"
        desc="La casilla alineada arriba con una etiqueta y una línea de ayuda. El patrón para opciones que necesitan explicarse — guardrails, permisos, alertas."
        code={CODE_LIST}>
        <ListWithDesc />
      </Variant>

      <Variant title="Seleccionar todo · indeterminado"
        desc="Una cabecera que marca o desmarca el grupo y muestra la raya (indeterminate) cuando la selección es parcial, sobre una rejilla de namespaces."
        code={CODE_ALL}>
        <SelectAll />
      </Variant>

      <Variant title="Tarjetas multiselección"
        desc="Cuando cada opción merece icono y descripción: el input va oculto y la tarjeta entera es el target, con anillo de marca y tick en la esquina al activarse."
        code={CODE_CARDS}>
        <CardChecks />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['checkboxes'] = CheckboxesSection;
})();
