/* ============================================================================
   Gntik UI · select-menus.jsx — selects (grupo "Formularios").
   El select nativo de marca + un Listbox custom reutilizable (botón → popover
   con check en el seleccionado), declinado para texto, avatar+secundario y
   estado con punto de color. Dominio musematic. Tokens, cero hardcode.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

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

const labelCls = "block text-[13px] font-medium text-foreground mb-2";
const Avatar = ({ initials, size = 22 }) => (
  <span className="inline-grid place-items-center rounded-full bg-accent text-accent-foreground font-semibold shrink-0"
    style={{ width: size, height: size, fontSize: size * 0.42 }}>{initials}</span>
);
const Dot = ({ tone }) => <span className={"size-2 rounded-full shrink-0 " + tone} />;

/* ── Listbox custom reutilizable ─────────────────────────────────────────── */
function Listbox({ value, onChange, options, render, placeholder = 'Selecciona…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const sel = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={"flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background pl-3 pr-2.5 text-[13px] text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/25 " +
          (open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border hover:border-muted-foreground/40')}>
        <span className="flex min-w-0 items-center gap-2 truncate">
          {sel ? render(sel) : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <Icon name="chevron" size={15} className={"text-muted-foreground shrink-0 transition-transform " + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {options.map(o => {
            const on = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={on} onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}
                className={"flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] " +
                  (o.disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer ' + (on ? 'bg-primary/12' : 'hover:bg-secondary/70'))}>
                <span className="flex min-w-0 items-center gap-2">{render(o)}</span>
                {on && <Icon name="check" size={15} className="text-primary shrink-0" stroke={2.4} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── datos ───────────────────────────────────────────────────────────────── */
const REGIONS = [
  { value: 'eu', label: 'EU-West · Frankfurt' },
  { value: 'us-e', label: 'US-East · Boston' },
  { value: 'us-w', label: 'US-West · San Francisco' },
  { value: 'ap', label: 'AP-South · Singapur', disabled: true },
];
const OPERATORS = [
  { value: 'emma', name: 'Emma Crown', email: 'emma@acme.com', init: 'EC' },
  { value: 'leo', name: 'Leo Park', email: 'leo@acme.com', init: 'LP' },
  { value: 'mara', name: 'Mara Vidal', email: 'mara@acme.com', init: 'MV' },
  { value: 'noah', name: 'Noah Frey', email: 'noah@acme.com', init: 'NF' },
];
const ENVS = [
  { value: 'prod', label: 'Producción', tone: 'bg-primary', note: '12 agentes' },
  { value: 'staging', label: 'Staging', tone: 'bg-warning', note: '4 agentes' },
  { value: 'dev', label: 'Desarrollo', tone: 'bg-info', note: '7 agentes' },
  { value: 'paused', label: 'Pausado', tone: 'bg-muted-foreground/40', note: '0 agentes' },
];

/* ── 1 · NATIVO ──────────────────────────────────────────────────────────── */
function NativeSelects() {
  const sel = "h-9 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-9 text-[13px] text-foreground shadow-sm transition-colors focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25 cursor-pointer";
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Región</label>
        <div className="relative">
          <select defaultValue="eu" className={sel}>
            {REGIONS.map(r => <option key={r.value} value={r.value} disabled={r.disabled}>{r.label}</option>)}
          </select>
          <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Modelo</label>
        <div className="relative">
          <select defaultValue="" className={sel}>
            <option value="" disabled>Selecciona modelo…</option>
            <optgroup label="Rápidos"><option>haiku-3.5</option><option>gpt-4o-mini</option></optgroup>
            <optgroup label="Razonadores"><option>sonnet-4</option><option>o3</option></optgroup>
          </select>
          <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">El select nativo del SO, con el chevron de marca.</p>
      </div>
    </div>
  );
}

/* ── 2 · CUSTOM básico ───────────────────────────────────────────────────── */
function CustomBasic() {
  const [v, setV] = useState('eu');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Región de despliegue</label>
      <Listbox value={v} onChange={setV} options={REGIONS}
        render={(o) => <span className="truncate">{o.label}{o.disabled && <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">pronto</span>}</span>} />
      <p className="mt-2 text-[12px] text-muted-foreground">Listbox custom: check en el activo, opción deshabilitada y cierre al hacer clic fuera.</p>
    </div>
  );
}

/* ── 3 · CON AVATAR + secundario ─────────────────────────────────────────── */
function WithAvatar() {
  const [v, setV] = useState('emma');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Asignar operador</label>
      <Listbox value={v} onChange={setV} options={OPERATORS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={o.init} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium text-foreground">{o.name}</span>
            </span>
          </span>
        )} />
      <p className="mt-2 text-[12px] text-muted-foreground">Cada opción lleva avatar; el email se muestra en la fila del popover.</p>
    </div>
  );
}

/* variante del render con email en el desplegable (mismo Listbox, render con 2 líneas) */
function WithAvatarRich() {
  const [v, setV] = useState('leo');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Revisor del policy</label>
      <Listbox value={v} onChange={setV} options={OPERATORS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={o.init} size={26} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium text-foreground">{o.name}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">{o.email}</span>
            </span>
          </span>
        )} />
    </div>
  );
}

/* ── 4 · CON ESTADO (punto de color) ─────────────────────────────────────── */
function WithStatus() {
  const [v, setV] = useState('prod');
  return (
    <div className="mx-auto w-full max-w-sm">
      <label className={labelCls}>Entorno activo</label>
      <Listbox value={v} onChange={setV} options={ENVS}
        render={(o) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <Dot tone={o.tone} />
            <span className="truncate font-medium text-foreground">{o.label}</span>
            <span className="ml-1 truncate font-mono text-[11px] text-muted-foreground">{o.note}</span>
          </span>
        )} />
      <p className="mt-2 text-[12px] text-muted-foreground">Punto de estado por entorno: prod en verde, staging en ámbar, dev en azul-info.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_LISTBOX = `// Listbox custom — botón + popover; el render decide cómo se pinta cada opción
function Listbox({ value, onChange, options, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const sel = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={\`flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background pl-3 pr-2.5
          text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/25 \${
          open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border hover:border-muted-foreground/40'}\`}>
        <span className="flex items-center gap-2 truncate">{sel ? render(sel) : <span className="text-muted-foreground">Selecciona…</span>}</span>
        <ChevronIcon className={\`text-muted-foreground transition-transform \${open ? 'rotate-180' : ''}\`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute inset-x-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-md
                                      border border-border bg-popover p-1 shadow-lg">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={on}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={\`flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px]
                  cursor-pointer \${on ? 'bg-primary/12' : 'hover:bg-secondary/70'}\`}>
                <span className="flex items-center gap-2">{render(o)}</span>
                {on && <CheckIcon className="text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}`;

const CODE_NATIVE = `// Nativo: appearance-none + chevron de marca posicionado encima
<div className="relative">
  <select className="h-9 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-9
                     text-[13px] shadow-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25">
    <optgroup label="Rápidos"><option>haiku-3.5</option></optgroup>
  </select>
  <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
</div>`;

const CODE_RENDER = `// Mismo Listbox, distintos render → avatar+secundario · punto de estado
render={(o) => (
  <span className="flex items-center gap-2.5">
    <Avatar initials={o.init} />
    <span className="flex flex-col leading-tight">
      <span className="font-medium text-foreground">{o.name}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{o.email}</span>
    </span>
  </span>
)}

render={(o) => (
  <span className="flex items-center gap-2.5">
    <span className={\`size-2 rounded-full \${o.tone}\`} />  {/* bg-primary · bg-warning · bg-info */}
    <span className="font-medium text-foreground">{o.label}</span>
  </span>
)}`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function SelectMenusSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Select menus" status="done"
        intro="Dos caminos: el select nativo de marca (rápido, accesible, con el chevron de los tokens) y un Listbox custom reutilizable cuando cada opción necesita más que texto. El mismo componente, cambiando solo la función render, sirve para regiones, asignar un operador con avatar y email, o elegir entorno con punto de estado. Check verde en el activo y cierre al clicar fuera." />

      <Variant title="Nativo"
        desc="El <select> del sistema con appearance-none y el chevron de marca. Soporta grupos, opción deshabilitada y placeholder. El más robusto para listas simples."
        code={CODE_NATIVE}>
        <NativeSelects />
      </Variant>

      <Variant title="Custom · básico"
        desc="El Listbox de marca: botón que abre un popover sobre bg-popover, check verde en el seleccionado, fila deshabilitada y cierre con clic-fuera o Escape."
        code={CODE_LISTBOX}>
        <CustomBasic />
      </Variant>

      <Variant title="Con avatar y secundario"
        desc="El mismo Listbox con un render que pinta avatar + nombre + email. Para asignar operador, elegir revisor de un policy o transferir ownership."
        code={CODE_RENDER}>
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
          <WithAvatar />
          <WithAvatarRich />
        </div>
      </Variant>

      <Variant title="Con estado"
        desc="Render con punto de color por entorno y un contador secundario. Verde prod, ámbar staging, azul-info dev — la misma escala semántica del resto de la librería."
        code={CODE_RENDER}>
        <WithStatus />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['select-menus'] = SelectMenusSection;
})();
