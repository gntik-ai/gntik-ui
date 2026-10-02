/* ============================================================================
   Gntik UI · buttons.jsx — botones (grupo "Elementos").
   El botón de marca: cinco variantes (primary · secondary · soft · ghost ·
   destructive), tres tamaños, con icono (leading / trailing / solo) y estados
   (loading con spinner, disabled). Mono-brand verde, sombras planas, tokens.
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
const Demo = ({ label, children }) => (
  <div className="flex flex-col items-center gap-2.5">
    {children}
    <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{label}</span>
  </div>
);

/* ── Botón de marca ──────────────────────────────────────────────────────── */
const BTN_VARIANT = {
  primary:     'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary:   'border border-border bg-card text-foreground shadow-sm hover:bg-secondary/70',
  soft:        'bg-primary/14 text-primary hover:bg-primary/20',
  ghost:       'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
};
const BTN_SIZE = {
  sm: 'h-8 gap-1.5 px-3 text-[12.5px] rounded-md',
  md: 'h-9 gap-1.5 px-3.5 text-[13px] rounded-lg',
  lg: 'h-11 gap-2 px-5 text-[14.5px] rounded-lg',
};
const BTN_ICONBOX = { sm: 'size-8 rounded-md', md: 'size-9 rounded-lg', lg: 'size-11 rounded-lg' };
const ICO = { sm: 14, md: 15, lg: 17 };

const Spinner = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" style={{ display: 'block' }} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeOpacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

function Btn({ variant = 'primary', size = 'md', icon, trailingIcon, iconOnly, loading, disabled, children, ...p }) {
  const base = 'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50 disabled:pointer-events-none';
  const shape = iconOnly ? BTN_ICONBOX[size] : BTN_SIZE[size];
  return (
    <button type="button" disabled={disabled || loading} {...p} className={base + ' ' + shape + ' ' + BTN_VARIANT[variant]}>
      {loading ? <Spinner size={ICO[size]} /> : (icon && <Icon name={icon} size={ICO[size]} />)}
      {!iconOnly && children}
      {!iconOnly && !loading && trailingIcon && <Icon name={trailingIcon} size={ICO[size]} />}
    </button>
  );
}

/* ── 1 · VARIANTES ───────────────────────────────────────────────────────── */
function VariantsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="primary"><Btn icon="plus">Deploy agent</Btn></Demo>
      <Demo label="secondary"><Btn variant="secondary" icon="sliders">Filtros</Btn></Demo>
      <Demo label="soft"><Btn variant="soft" icon="refresh">Reintentar</Btn></Demo>
      <Demo label="ghost"><Btn variant="ghost">Cancelar</Btn></Demo>
      <Demo label="destructive"><Btn variant="destructive" icon="trash">Eliminar</Btn></Demo>
    </div>
  );
}

/* ── 2 · TAMAÑOS ─────────────────────────────────────────────────────────── */
function SizesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
      <Demo label="sm"><Btn size="sm" icon="plus">Deploy agent</Btn></Demo>
      <Demo label="md"><Btn size="md" icon="plus">Deploy agent</Btn></Demo>
      <Demo label="lg"><Btn size="lg" icon="plus">Deploy agent</Btn></Demo>
    </div>
  );
}

/* ── 3 · CON ICONO + SOLO ICONO ──────────────────────────────────────────── */
function IconsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="leading"><Btn variant="secondary" icon="download">Exportar CSV</Btn></Demo>
      <Demo label="trailing"><Btn variant="secondary" trailingIcon="arrow">Ver runs</Btn></Demo>
      <Demo label="solo · primary"><Btn iconOnly icon="plus" aria-label="Añadir" /></Demo>
      <Demo label="solo · secondary"><Btn iconOnly variant="secondary" icon="dot3" aria-label="Más acciones" /></Demo>
      <Demo label="solo · ghost"><Btn iconOnly variant="ghost" icon="settings" aria-label="Ajustes" /></Demo>
    </div>
  );
}

/* ── 4 · ESTADOS ─────────────────────────────────────────────────────────── */
function StatesRow() {
  const [loading, setLoading] = useState(false);
  const go = () => { if (loading) return; setLoading(true); setTimeout(() => setLoading(false), 1900); };
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="click → loading"><Btn icon="bolt" loading={loading} onClick={go}>{loading ? 'Desplegando…' : 'Desplegar'}</Btn></Demo>
      <Demo label="loading · secondary"><Btn variant="secondary" loading>Guardando…</Btn></Demo>
      <Demo label="disabled"><Btn icon="plus" disabled>Deploy agent</Btn></Demo>
      <Demo label="disabled · secondary"><Btn variant="secondary" disabled>Filtros</Btn></Demo>
    </div>
  );
}

/* ── snippet ─────────────────────────────────────────────────────────────── */
const CODE_BTN = `// Botón de marca — variant × size, con icono y estado loading
const VARIANT = {
  primary:     "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:   "border border-border bg-card text-foreground shadow-sm hover:bg-secondary/70",
  soft:        "bg-primary/14 text-primary hover:bg-primary/20",
  ghost:       "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};
const SIZE = {
  sm: "h-8 gap-1.5 px-3 text-[12.5px] rounded-md",
  md: "h-9 gap-1.5 px-3.5 text-[13px] rounded-lg",
  lg: "h-11 gap-2 px-5 text-[14.5px] rounded-lg",
};

function Button({ variant = "primary", size = "md", icon: Lead, loading, children, ...props }) {
  const base = "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors " +
    "focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card " +
    "disabled:opacity-50 disabled:pointer-events-none";
  return (
    <button {...props} disabled={props.disabled || loading}
      className={base + " " + SIZE[size] + " " + VARIANT[variant]}>
      {loading ? <Spinner /> : Lead && <Lead className="size-[15px]" />}
      {children}
    </button>
  );
}`;

const CODE_ICON = `// Solo icono — caja cuadrada por tamaño; siempre con aria-label
const ICONBOX = { sm: "size-8 rounded-md", md: "size-9 rounded-lg", lg: "size-11 rounded-lg" };
<Button iconOnly icon={PlusIcon} aria-label="Añadir" />`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ButtonsSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Buttons" status="done"
        intro="El botón de marca en sus cinco variantes — primary, secondary, soft, ghost y destructive —, tres tamaños, con icono o solo icono, y los estados de carga y deshabilitado. Un único componente Button con mapas de variant y size; mono-brand verde y sombras planas que leen bien sobre cualquier tema." />

      <Variant title="Variantes"
        desc="Primary para la acción principal; secondary con borde para la secundaria; soft como acento de bajo peso; ghost para acciones terciarias; destructive solo para lo irreversible."
        code={CODE_BTN}>
        <VariantsRow />
      </Variant>

      <Variant title="Tamaños"
        desc="sm para toolbars densas, md por defecto, lg para CTAs y formularios. El alto y el padding escalan; el icono se ajusta solo.">
        <SizesRow />
      </Variant>

      <Variant title="Con icono y solo icono"
        desc="Icono a la izquierda o a la derecha, o caja cuadrada de solo icono. El botón de solo icono siempre lleva aria-label."
        code={CODE_ICON}>
        <IconsRow />
      </Variant>

      <Variant title="Estados"
        desc="Pulsa “Desplegar” para ver el spinner: en loading el botón se deshabilita y cambia el icono. El estado disabled baja la opacidad y corta los eventos.">
        <StatesRow />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['buttons'] = ButtonsSection;
})();
