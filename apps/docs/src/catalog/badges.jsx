/* ============================================================================
   Gntik UI · badges.jsx — badges & pills (grupo "Elementos").
   Status pills del Fleet (tonos semánticos), tonos y formas (soft/solid/
   outline · cuadrada/pill), badges de conteo sobre nav e iconos, y tags
   removibles con los colores categóricos. Todo en mono, todo desde tokens.
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

/* ── Status pill de marca ────────────────────────────────────────────────── */
const PILL_TONE = {
  primary:     'bg-primary/14 text-primary',
  muted:       'bg-muted-foreground/16 text-muted-foreground',
  warning:     'bg-warning/16 text-warning',
  info:        'bg-info/15 text-info',
  destructive: 'bg-destructive/15 text-destructive',
};
const StatusPill = ({ tone = 'primary', children }) => (
  <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + PILL_TONE[tone]}>
    <span className="size-1.5 rounded-full bg-current" />{children}
  </span>
);

/* ── 1 · STATUS PILLS ────────────────────────────────────────────────────── */
function StatusPills() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <StatusPill tone="primary">Running</StatusPill>
      <StatusPill tone="muted">Paused</StatusPill>
      <StatusPill tone="warning">Degraded</StatusPill>
      <StatusPill tone="destructive">Failed</StatusPill>
      <StatusPill tone="info">Queued</StatusPill>
    </div>
  );
}

/* ── 2 · TONOS Y FORMAS ──────────────────────────────────────────────────── */
function TonesShapes() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary">soft</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary text-primary-foreground">solid</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold border border-primary/45 text-primary">outline</span>
        <span className="inline-flex items-center h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold border border-border text-muted-foreground">neutral</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center h-[24px] px-2.5 rounded-full bg-primary/14 text-primary text-[11.5px] font-semibold">pill</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-md bg-primary/14 text-primary text-[11.5px] font-semibold"><Icon name="check" size={12} stroke={2.6} />verificado</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-md bg-warning/16 text-warning text-[11.5px] font-semibold"><Icon name="alert" size={12} />97% budget</span>
        <span className="inline-flex items-center gap-1.5 h-[24px] pl-1.5 pr-2.5 rounded-full bg-secondary text-secondary-foreground text-[11.5px] font-semibold"><span className="size-1.5 rounded-full bg-primary" />live</span>
      </div>
    </div>
  );
}

/* ── 3 · BADGES DE CONTEO ────────────────────────────────────────────────── */
function CountBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
      <div className="inline-flex items-center gap-2.5 h-9 px-3 rounded-lg bg-secondary/60 text-[13px] font-medium text-foreground">
        <Icon name="bell" size={16} className="text-muted-foreground" />Alertas
        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">5</span>
      </div>
      <button className="relative inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm" aria-label="Bandeja · 12 sin leer">
        <Icon name="inbox" size={17} />
        <span className="absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground ring-2 ring-card">12</span>
      </button>
      <button className="relative inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm" aria-label="Notificaciones nuevas">
        <Icon name="bell" size={17} />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
      </button>
      <span className="inline-flex items-center h-[20px] px-2 rounded-md bg-primary/14 text-primary font-mono text-[9.5px] font-bold tracking-[0.1em] uppercase">Nuevo</span>
      <div className="inline-flex items-center gap-2 pb-2 border-b-2 border-primary text-[13px] font-semibold text-foreground">
        Runs<span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary/14 px-1 font-mono text-[10px] font-bold text-primary">128</span>
      </div>
    </div>
  );
}

/* ── 4 · TAGS REMOVIBLES ─────────────────────────────────────────────────── */
const CAT_DOT = { rose: 'bg-category-rose', violet: 'bg-category-violet', amber: 'bg-category-amber', cyan: 'bg-category-cyan' };
const TAGS0 = [
  { label: 'production', cat: 'rose' }, { label: 'eu-west-1', cat: 'cyan' },
  { label: 'sonnet-4', cat: 'violet' }, { label: 'pii-redaction', cat: 'amber' },
];
function Tags() {
  const [tags, setTags] = useState(TAGS0);
  const remove = (l) => setTags(t => t.filter(x => x.label !== l));
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex min-h-[26px] flex-wrap items-center justify-center gap-2">
        {tags.map(t => (
          <span key={t.label} className="inline-flex items-center gap-1.5 h-[26px] pl-2.5 pr-1.5 rounded-md border border-border bg-card text-[12px] font-medium text-foreground">
            <span className={"size-2 rounded-full " + CAT_DOT[t.cat]} />{t.label}
            <button onClick={() => remove(t.label)} aria-label={'Quitar ' + t.label} className="grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={11} stroke={2.4} /></button>
          </span>
        ))}
        {tags.length === 0 && <button onClick={() => setTags(TAGS0)} className="font-mono text-[11px] text-primary hover:underline">restaurar etiquetas</button>}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">pulsa la ✕ para quitar — el punto usa los colores categóricos</span>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_PILL = `// Status pill — tono semántico soft + punto que hereda el color (bg-current)
const TONE = {
  primary:     "bg-primary/14 text-primary",
  muted:       "bg-muted-foreground/16 text-muted-foreground",
  warning:     "bg-warning/16 text-warning",
  info:        "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
};
const StatusPill = ({ tone = "primary", children }) => (
  <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + TONE[tone]}>
    <span className="size-1.5 rounded-full bg-current" />{children}
  </span>
);`;

const CODE_COUNT = `// Badge de conteo sobre un icono — ring del color de la superficie
<button className="relative size-9 rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
  <InboxIcon />
  <span className="absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full
                   bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground ring-2 ring-card">12</span>
</button>`;

const CODE_TAG = `// Tag removible — punto categórico + botón ✕
<span className="inline-flex items-center gap-1.5 h-[26px] pl-2.5 pr-1.5 rounded-md border border-border bg-card text-[12px] font-medium">
  <span className="size-2 rounded-full bg-category-violet" />sonnet-4
  <button onClick={() => remove(tag)} aria-label="Quitar"
    className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"><XIcon /></button>
</span>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function BadgesSection() {
  return (
    <div>
      <SectionHead kicker="Elementos" title="Badges & pills" status="done"
        intro="Etiquetas compactas para estado y metadatos: las status pills del Fleet con sus tonos semánticos, los estilos soft / solid / outline en forma cuadrada o pill, los badges de conteo sobre nav e iconos, y los tags removibles con los colores categóricos. Todo el texto en mono y todo el color desde tokens." />

      <Variant title="Status pills"
        desc="El estado de un agente en un vistazo: tono soft + punto que hereda el color con bg-current. Verde para sano, ámbar para degradado, rojo para fallo — el primario nunca compite con la severidad."
        code={CODE_PILL}>
        <StatusPills />
      </Variant>

      <Variant title="Tonos y formas"
        desc="Cuatro estilos (soft, solid, outline, neutral) y dos formas (cuadrada rounded-md o pill rounded-full), con punto o icono opcional. Soft es el de uso diario; solid se reserva para énfasis puntual.">
        <TonesShapes />
      </Variant>

      <Variant title="Badges de conteo"
        desc="Números sobre items de nav, esquina de un icono con ring del color de fondo, punto indicador sin número, etiqueta “Nuevo” y contador en tab activa."
        code={CODE_COUNT}>
        <CountBadges />
      </Variant>

      <Variant title="Tags removibles"
        desc="Chips de metadatos con punto categórico y botón ✕. Pulsa la ✕ para quitar uno; cuando se vacía, aparece el enlace para restaurarlos."
        code={CODE_TAG}>
        <Tags />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['badges'] = BadgesSection;
})();
