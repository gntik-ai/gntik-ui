/* ============================================================================
   Gntik UI · avatars.jsx — avatares (grupo "Elementos").
   El avatar de iniciales de marca: cinco tamaños, cuadrado o redondo, en tonos
   para distinguir personas y un icono para los agentes; con indicador de estado
   en la esquina y apilado en grupo con desbordamiento +N. Tokens, sin imágenes.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

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

/* ── Avatar de marca ─────────────────────────────────────────────────────── */
const AV = {
  xs: { box: 'size-6',  fs: 'text-[10px]', r: 'rounded-md',     dot: 'size-2',   ico: 13 },
  sm: { box: 'size-8',  fs: 'text-[11px]', r: 'rounded-lg',     dot: 'size-2.5', ico: 16 },
  md: { box: 'size-10', fs: 'text-[13px]', r: 'rounded-[10px]', dot: 'size-3',   ico: 20 },
  lg: { box: 'size-12', fs: 'text-[15px]', r: 'rounded-xl',     dot: 'size-3.5', ico: 24 },
  xl: { box: 'size-16', fs: 'text-[20px]', r: 'rounded-2xl',    dot: 'size-4',   ico: 30 },
};
const AV_TONE = {
  primary:   'bg-primary text-primary-foreground',
  accent:    'bg-accent text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  rose:      'bg-category-rose/18 text-category-rose',
  violet:    'bg-category-violet/20 text-category-violet',
  cyan:      'bg-category-cyan/18 text-category-cyan',
  amber:     'bg-category-amber/22 text-category-amber',
};
const AV_STATUS = { online: 'bg-primary', idle: 'bg-warning', busy: 'bg-destructive', offline: 'bg-muted-foreground' };

function Avatar({ size = 'md', round, tone = 'primary', initials, icon, status, ring }) {
  const s = AV[size];
  return (
    <span className="relative inline-flex shrink-0">
      <span className={"inline-flex items-center justify-center font-bold tracking-tight " + s.box + ' ' + s.fs + ' ' + (round ? 'rounded-full' : s.r) + ' ' + AV_TONE[tone] + (ring ? ' ring-2 ring-card' : '')}>
        {icon ? <Icon name={icon} size={s.ico} stroke={1.8} /> : initials}
      </span>
      {status && <span className={"absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-card " + s.dot + ' ' + AV_STATUS[status]} />}
    </span>
  );
}

/* ── 1 · TAMAÑOS Y FORMA ─────────────────────────────────────────────────── */
function SizesShape() {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
        {['xs', 'sm', 'md', 'lg', 'xl'].map(sz => (
          <div key={sz} className="flex flex-col items-center gap-2"><Avatar size={sz} tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">{sz}</span></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2"><Avatar size="lg" tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">rounded</span></div>
        <div className="flex flex-col items-center gap-2"><Avatar size="lg" round tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">round</span></div>
      </div>
    </div>
  );
}

/* ── 2 · TONOS E ICONO ───────────────────────────────────────────────────── */
function TonesIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
      <Avatar size="md" tone="primary" initials="MR" />
      <Avatar size="md" tone="accent" initials="JL" />
      <Avatar size="md" tone="violet" initials="SK" />
      <Avatar size="md" tone="rose" initials="AT" />
      <Avatar size="md" tone="cyan" initials="DN" />
      <Avatar size="md" tone="amber" initials="VG" />
      <div className="mx-1 h-8 w-px bg-border" />
      <Avatar size="md" tone="secondary" icon="bot" />
      <Avatar size="md" round tone="secondary" icon="user" />
    </div>
  );
}

/* ── 3 · CON ESTADO ──────────────────────────────────────────────────────── */
const STATUSES = [['online', 'en línea', 'primary', 'MR'], ['idle', 'inactivo', 'violet', 'JL'], ['busy', 'ocupado', 'cyan', 'SK'], ['offline', 'offline', 'secondary', 'VG']];
function WithStatus() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      {STATUSES.map(([st, label, tone, ini]) => (
        <div key={st} className="flex flex-col items-center gap-2.5">
          <Avatar size="lg" round tone={tone} initials={ini} status={st} />
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 4 · GRUPO APILADO ───────────────────────────────────────────────────── */
const TEAM = [
  { initials: 'MR', tone: 'primary' }, { initials: 'JL', tone: 'violet' }, { initials: 'SK', tone: 'cyan' },
  { initials: 'AT', tone: 'rose' }, { initials: 'VG', tone: 'amber' }, { initials: 'DN', tone: 'accent' }, { initials: 'PL', tone: 'secondary' },
];
const Group = ({ size, max }) => {
  const shown = TEAM.slice(0, max);
  const extra = TEAM.length - shown.length;
  const s = AV[size];
  return (
    <div className="flex -space-x-2.5">
      {shown.map((p, i) => <Avatar key={i} size={size} round ring tone={p.tone} initials={p.initials} />)}
      {extra > 0 && <span className={"relative inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-muted-foreground ring-2 ring-card " + s.box + ' ' + s.fs}>+{extra}</span>}
    </div>
  );
};
function Stacked() {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-col items-center gap-2.5"><Group size="md" max={4} /><span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">operadores · 7</span></div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2"><Group size="sm" max={5} /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">sm</span></div>
        <div className="flex flex-col items-center gap-2"><Group size="lg" max={3} /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">lg</span></div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_AV = `// Avatar de marca — tamaño × tono; icono para agentes, iniciales para personas
const SIZE = {
  xs: "size-6 text-[10px] rounded-md",   sm: "size-8 text-[11px] rounded-lg",
  md: "size-10 text-[13px] rounded-[10px]", lg: "size-12 text-[15px] rounded-xl",
  xl: "size-16 text-[20px] rounded-2xl",
};
const TONE = {
  primary: "bg-primary text-primary-foreground", accent: "bg-accent text-accent-foreground",
  violet:  "bg-category-violet/20 text-category-violet", cyan: "bg-category-cyan/18 text-category-cyan",
};
function Avatar({ size = "md", round, tone = "primary", initials, icon: Glyph }) {
  return (
    <span className={"inline-flex items-center justify-center font-bold " +
      SIZE[size] + " " + (round ? "rounded-full" : "") + " " + TONE[tone]}>
      {Glyph ? <Glyph /> : initials}
    </span>
  );
}`;

const CODE_STATUS = `// Indicador de estado — punto en la esquina con ring del color de fondo
<span className="relative inline-flex">
  <Avatar size="lg" round initials="MR" />
  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-primary ring-2 ring-card" />
</span>
// online → bg-primary · idle → bg-warning · busy → bg-destructive · offline → bg-muted-foreground`;

const CODE_GROUP = `// Grupo apilado — solapamiento con -space-x + ring, y overflow +N
<div className="flex -space-x-2.5">
  {people.slice(0, max).map((p) => <Avatar key={p.id} round ring {...p} />)}
  {extra > 0 && (
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary
                     font-semibold text-muted-foreground ring-2 ring-card">+{extra}</span>
  )}
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function AvatarsSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Avatars" status="done"
        intro="El avatar de iniciales de marca: cinco tamaños (xs–xl), cuadrado por defecto o redondo, en tonos para distinguir personas y un icono para representar agentes. Con indicador de estado en la esquina y apilado en grupo con desbordamiento +N. Sin imágenes — todo desde tokens, legible en cualquier tema." />

      <Variant title="Tamaños y forma"
        desc="Cinco tamaños con el radio escalando con la caja; round lo convierte en círculo. md es el de uso general; xl para cabeceras de perfil."
        code={CODE_AV}>
        <SizesShape />
      </Variant>

      <Variant title="Tonos e icono"
        desc="Tonos sólidos (primary, accent) y categóricos suaves para diferenciar a las personas de un vistazo; el icono (bot / user) marca a los agentes frente a los operadores.">
        <TonesIcons />
      </Variant>

      <Variant title="Con estado"
        desc="Un punto en la esquina inferior con ring del color de la superficie para que se separe del avatar: verde en línea, ámbar inactivo, rojo ocupado, gris offline."
        code={CODE_STATUS}>
        <WithStatus />
      </Variant>

      <Variant title="Grupo apilado"
        desc="Avatares solapados con -space-x y un ring que los separa; cuando hay más de los que caben, un chip +N cierra el grupo."
        code={CODE_GROUP}>
        <Stacked />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['avatars'] = AvatarsSection;
})();
