/* ============================================================================
   Gntik UI · buttons.jsx — buttons ("Elements" group).
   The brand button: five variants (primary · secondary · soft · ghost ·
   destructive), three sizes, with icon (leading / trailing / icon-only) and states
   (loading with spinner, disabled). Mono-brand green, flat shadows, tokens.
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

/* ── Brand button ────────────────────────────────────────────────────────── */
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

/* ── 1 · VARIANTS ────────────────────────────────────────────────────────── */
function VariantsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="primary"><Btn icon="plus">New deployment</Btn></Demo>
      <Demo label="secondary"><Btn variant="secondary" icon="sliders">Filters</Btn></Demo>
      <Demo label="soft"><Btn variant="soft" icon="refresh">Retry</Btn></Demo>
      <Demo label="ghost"><Btn variant="ghost">Cancel</Btn></Demo>
      <Demo label="destructive"><Btn variant="destructive" icon="trash">Delete</Btn></Demo>
    </div>
  );
}

/* ── 2 · SIZES ───────────────────────────────────────────────────────────── */
function SizesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
      <Demo label="sm"><Btn size="sm" icon="plus">New deployment</Btn></Demo>
      <Demo label="md"><Btn size="md" icon="plus">New deployment</Btn></Demo>
      <Demo label="lg"><Btn size="lg" icon="plus">New deployment</Btn></Demo>
    </div>
  );
}

/* ── 3 · WITH ICON + ICON-ONLY ───────────────────────────────────────────── */
function IconsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="leading"><Btn variant="secondary" icon="download">Export CSV</Btn></Demo>
      <Demo label="trailing"><Btn variant="secondary" trailingIcon="arrow">View jobs</Btn></Demo>
      <Demo label="solo · primary"><Btn iconOnly icon="plus" aria-label="Add" /></Demo>
      <Demo label="solo · secondary"><Btn iconOnly variant="secondary" icon="dot3" aria-label="More actions" /></Demo>
      <Demo label="solo · ghost"><Btn iconOnly variant="ghost" icon="settings" aria-label="Settings" /></Demo>
    </div>
  );
}

/* ── 4 · STATES ──────────────────────────────────────────────────────────── */
function StatesRow() {
  const [loading, setLoading] = useState(false);
  const go = () => { if (loading) return; setLoading(true); setTimeout(() => setLoading(false), 1900); };
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <Demo label="click → loading"><Btn icon="bolt" loading={loading} onClick={go}>{loading ? 'Deploying…' : 'Deploy'}</Btn></Demo>
      <Demo label="loading · secondary"><Btn variant="secondary" loading>Saving…</Btn></Demo>
      <Demo label="disabled"><Btn icon="plus" disabled>New deployment</Btn></Demo>
      <Demo label="disabled · secondary"><Btn variant="secondary" disabled>Filters</Btn></Demo>
    </div>
  );
}

/* ── snippet ─────────────────────────────────────────────────────────────── */
const CODE_BTN = `// Brand button — variant × size, with icon and loading state
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

const CODE_ICON = `// Icon-only — square box per size; always with an aria-label
const ICONBOX = { sm: "size-8 rounded-md", md: "size-9 rounded-lg", lg: "size-11 rounded-lg" };
<Button iconOnly icon={PlusIcon} aria-label="Add" />`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ButtonsSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Buttons" status="done"
        intro="The brand button in its five variants — primary, secondary, soft, ghost and destructive — three sizes, with an icon or icon-only, and the loading and disabled states. A single Button component with variant and size maps; mono-brand green and flat shadows that read well on any theme." />

      <Variant title="Variants"
        desc="Primary for the main action; bordered secondary for the secondary one; soft as a low-weight accent; ghost for tertiary actions; destructive only for the irreversible."
        code={CODE_BTN}>
        <VariantsRow />
      </Variant>

      <Variant title="Sizes"
        desc="sm for dense toolbars, md by default, lg for CTAs and forms. Height and padding scale; the icon adjusts itself.">
        <SizesRow />
      </Variant>

      <Variant title="With icon and icon-only"
        desc="Icon on the left or right, or a square icon-only box. The icon-only button always carries an aria-label."
        code={CODE_ICON}>
        <IconsRow />
      </Variant>

      <Variant title="States"
        desc="Press “Deploy” to see the spinner: while loading the button is disabled and the icon changes. The disabled state lowers opacity and blocks events.">
        <StatesRow />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['buttons'] = ButtonsSection;
})();
