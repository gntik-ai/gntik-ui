/* ============================================================================
   Gntik UI · dropdowns.jsx — menús (grupo "Elementos").
   Acciones de fila (iconos · atajos · zona de peligro), menú agrupado con
   cabecera y etiquetas, selección única con check, y multi-selección que no
   se cierra. Popover de marca; cierre al hacer clic fuera o con Esc. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-10">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── Primitivas del menú ─────────────────────────────────────────────────── */
function Dropdown({ width = 208, align = 'left', children, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block text-left">
      {render({ open, toggle: () => setOpen(o => !o) })}
      {open && (
        <div className={"absolute top-[calc(100%+8px)] z-50 rounded-[10px] border border-border bg-popover p-1.5 shadow-md " + (align === 'right' ? 'right-0' : 'left-0')} style={{ minWidth: width }}>
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
const MItem = ({ icon, danger, shortcut, children, onClick }) => (
  <button type="button" onClick={onClick}
    className={"flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] transition-colors " + (danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-secondary/70')}>
    {icon && <Icon name={icon} size={15} className={danger ? '' : 'text-muted-foreground'} />}
    <span className="flex-1">{children}</span>
    {shortcut && <span className="font-mono text-[10.5px] text-muted-foreground/70">{shortcut}</span>}
  </button>
);
const MLabel = ({ children }) => <div className="px-2.5 pt-2 pb-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">{children}</div>;
const MSep = () => <div className="-mx-1.5 my-1.5 h-px bg-border" />;

/* ── 1 · ACCIONES DE FILA (atajos + peligro) ─────────────────────────────── */
function RowActions() {
  const [msg, setMsg] = useState('');
  const flash = (t, close) => { setMsg(t); close(); setTimeout(() => setMsg(''), 1400); };
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={208} render={({ open, toggle }) => (
        <button onClick={toggle} aria-label="Acciones del agente" aria-expanded={open}
          className={"grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary/60 hover:text-foreground " + (open ? 'bg-secondary/60 text-foreground' : '')}>
          <Icon name="dot3" size={18} />
        </button>
      )}>
        {({ close }) => (
          <React.Fragment>
            <MItem icon="eye" shortcut="⌘L" onClick={() => flash('Abriendo logs…', close)}>Ver logs</MItem>
            <MItem icon="refresh" shortcut="⌘R" onClick={() => flash('Reiniciado', close)}>Reiniciar</MItem>
            <MItem icon="copy" shortcut="⌘D" onClick={() => flash('Duplicado', close)}>Duplicar</MItem>
            <MSep />
            <MItem icon="pause" onClick={() => flash('Pausado', close)}>Pausar</MItem>
            <MSep />
            <MItem icon="trash" danger shortcut="⌫" onClick={() => flash('Eliminado', close)}>Eliminar agente</MItem>
          </React.Fragment>
        )}
      </Dropdown>
      <span className="h-4 font-mono text-[11px] text-muted-foreground/80">{msg || 'acciones de fila · iconos, atajos y peligro'}</span>
    </div>
  );
}

/* ── 2 · AGRUPADO con cabecera ───────────────────────────────────────────── */
function Grouped() {
  return (
    <Dropdown width={240} render={({ open, toggle }) => (
      <button onClick={toggle} aria-expanded={open}
        className="flex items-center gap-2.5 h-11 pl-1.5 pr-3 rounded-[10px] border border-border bg-card shadow-sm transition-colors hover:bg-secondary/50">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">MR</span>
        <span className="flex flex-col items-start leading-tight"><span className="text-[13px] font-semibold text-foreground">Marta Ríos</span><span className="font-mono text-[10px] text-muted-foreground">operator</span></span>
        <Icon name="chevron" size={14} className={"ml-1 text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
      </button>
    )}>
      {({ close }) => (
        <React.Fragment>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-[12px] font-bold text-accent-foreground">MR</span>
            <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-foreground">Marta Ríos</div><div className="truncate font-mono text-[10.5px] text-muted-foreground">marta@acme.co</div></div>
          </div>
          <MSep />
          <MLabel>Cuenta</MLabel>
          <MItem icon="user" onClick={close}>Perfil</MItem>
          <MItem icon="settings" onClick={close}>Preferencias</MItem>
          <MLabel>Workspace</MLabel>
          <MItem icon="fleet" onClick={close}>Cambiar workspace</MItem>
          <MItem icon="shield" onClick={close}>Policies</MItem>
          <MSep />
          <MItem icon="logout" danger onClick={close}>Cerrar sesión</MItem>
        </React.Fragment>
      )}
    </Dropdown>
  );
}

/* ── 3 · SELECCIÓN ÚNICA (check) ─────────────────────────────────────────── */
const REGIONS = ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'];
function SingleSelect() {
  const [region, setRegion] = useState('eu-west-1');
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={200} render={({ open, toggle }) => (
        <button onClick={toggle} aria-expanded={open}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60">
          <Icon name="net" size={15} className="text-muted-foreground" />
          <span className="font-mono text-[12.5px]">{region}</span>
          <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
      )}>
        {({ close }) => (
          <React.Fragment>
            <MLabel>Región</MLabel>
            {REGIONS.map(r => (
              <button key={r} onClick={() => { setRegion(r); close(); }}
                className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
                <span className="flex-1 font-mono text-[12.5px] text-foreground">{r}</span>
                {region === r && <Icon name="check" size={15} className="text-primary" />}
              </button>
            ))}
          </React.Fragment>
        )}
      </Dropdown>
      <span className="font-mono text-[11px] text-muted-foreground/80">selección única — cierra y actualiza el trigger</span>
    </div>
  );
}

/* ── 4 · MULTI-SELECCIÓN (no se cierra) ──────────────────────────────────── */
const COLS = [['state', 'Estado'], ['runs', 'Runs'], ['cost', 'Coste'], ['uptime', 'Uptime'], ['last', 'Última']];
function MultiSelect() {
  const [on, setOn] = useState({ state: true, runs: true, cost: true, uptime: false, last: true });
  const count = Object.values(on).filter(Boolean).length;
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown width={210} render={({ open, toggle }) => (
        <button onClick={toggle} aria-expanded={open}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60">
          <Icon name="layout" size={15} className="text-muted-foreground" />Columnas
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 font-mono text-[10px] font-semibold text-muted-foreground">{count}</span>
          <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
        </button>
      )}>
        <MLabel>Columnas visibles</MLabel>
        {COLS.map(([id, label]) => (
          <button key={id} onClick={() => setOn(o => ({ ...o, [id]: !o[id] }))}
            className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left transition-colors hover:bg-secondary/70">
            <span className={"grid size-[18px] place-items-center rounded-[5px] border transition-colors " + (on[id] ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent')}><Icon name="check" size={12} stroke={2.6} /></span>
            <span className="flex-1 text-[13px] text-foreground">{label}</span>
          </button>
        ))}
      </Dropdown>
      <span className="font-mono text-[11px] text-muted-foreground/80">multi-selección — el menú permanece abierto</span>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_DD = `// Dropdown — cierre al clic fuera / Esc con useClickOutside
function Dropdown({ width = 208, align = "left", render, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block text-left">
      {render({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div style={{ minWidth: width }}
          className={"absolute top-[calc(100%+8px)] z-50 rounded-[10px] border border-border bg-popover p-1.5 shadow-md " +
            (align === "right" ? "right-0" : "left-0")}>
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

const MItem = ({ icon: Glyph, danger, shortcut, children, onClick }) => (
  <button onClick={onClick}
    className={"flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] text-left text-[13px] transition-colors " +
      (danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-secondary/70")}>
    {Glyph && <Glyph className={danger ? "" : "text-muted-foreground"} />}
    <span className="flex-1">{children}</span>
    {shortcut && <span className="font-mono text-[10.5px] text-muted-foreground/70">{shortcut}</span>}
  </button>
);`;

const CODE_MULTI = `// Item con check — multi-selección que NO cierra el menú al pulsar
<button onClick={() => setOn((o) => ({ ...o, [id]: !o[id] }))}
  className="flex w-full items-center gap-2.5 h-[34px] px-2.5 rounded-[7px] hover:bg-secondary/70">
  <span className={"grid size-[18px] place-items-center rounded-[5px] border " +
    (on[id] ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}>
    <CheckIcon />
  </span>
  <span className="flex-1 text-[13px] text-foreground">{label}</span>
</button>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function DropdownsSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Dropdowns" status="done"
        intro="Menús que cuelgan de un trigger: acciones de fila con iconos, atajos y zona de peligro; menú agrupado con cabecera de usuario y etiquetas; selección única con check que actualiza el trigger; y multi-selección de columnas que no se cierra al pulsar. Popover de marca, con cierre al hacer clic fuera o con Esc." />

      <Variant title="Acciones de fila"
        desc="El menú “…” de una fila: iconos a la izquierda, atajos en mono a la derecha, separadores y un item destructivo al final. Pulsa una acción y verás el eco debajo."
        code={CODE_DD}>
        <RowActions />
      </Variant>

      <Variant title="Agrupado con cabecera"
        desc="Cabecera con el usuario, secciones bajo etiquetas en mono y separadores; el botón cierra sesión en rojo. El trigger muestra el avatar y el chevron gira al abrir.">
        <Grouped />
      </Variant>

      <Variant title="Selección única"
        desc="Un select estilo menú: el valor activo lleva check y, al elegir otro, el menú cierra y el trigger se actualiza.">
        <SingleSelect />
      </Variant>

      <Variant title="Multi-selección"
        desc="Casillas para alternar columnas; el menú permanece abierto mientras marcas, y el contador del trigger refleja cuántas hay visibles."
        code={CODE_MULTI}>
        <MultiSelect />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['dropdowns'] = DropdownsSection;
})();
