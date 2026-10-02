/* ============================================================================
   Gntik UI · kit.jsx — primitivas del catálogo
   Icon · Logo/Wordmark · CodeBlock (copiar) · Card · SectionHead · Grid ·
   ScaleFrame · useClickOutside. Todo se pinta con clases Tailwind que resuelven
   a los tokens de tokens/brand.css → el switch de tema reskinea todo en vivo.
   ============================================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Iconos · stroke currentColor, viewBox 24 ─────────────────────────────── */
function Icon({ name, size = 18, stroke = 1.7, className = '' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const g = {
    /* navegación de producto (app shell) */
    home: <><path d="M3 11l9-7 9 7" {...p} /><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" {...p} /><path d="M9 21v-6h6v6" {...p} /></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" {...p} />,
    store: <><path d="M3 9l1.5-5h15L21 9" {...p} /><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" {...p} /><path d="M9 21v-7h6v7" {...p} /></>,
    bot: <><rect x="4" y="8" width="16" height="12" rx="2" {...p} /><path d="M12 4v4M9 14h.01M15 14h.01M2 14h2M20 14h2" {...p} /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...p} /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...p} /></>,
    net: <><circle cx="12" cy="5" r="2.5" {...p} /><circle cx="5" cy="19" r="2.5" {...p} /><circle cx="19" cy="19" r="2.5" {...p} /><path d="M12 7.5v3M10.5 13l-3.5 4M13.5 13l3.5 4" {...p} /></>,
    flow: <><rect x="3" y="3" width="6" height="6" rx="1" {...p} /><rect x="15" y="15" width="6" height="6" rx="1" {...p} /><path d="M6 9v4a2 2 0 0 0 2 2h7" {...p} /></>,
    flask: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" {...p} /><path d="M7 16h10" {...p} /></>,
    line: <><path d="M3 3v18h18" {...p} /><path d="m19 9-5 5-4-4-3 3" {...p} /></>,
    coin: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v10M9.5 9.2c0-1.1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.6-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.6 2.5-1.7" {...p} /></>,
    finger: <path d="M12 10a2 2 0 0 0-2 2c0 1.5.5 4-1 6M12 6a6 6 0 0 1 6 6c0 2-.3 4-1 5.5M8.5 19.5C9.5 17 9 14 9 12a3 3 0 0 1 6 0c0 1 0 2.5-.5 4M5 13c0-3 1.5-7 7-7 2 0 3.7.7 5 2" {...p} />,
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" {...p} />,
    cog: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1M19.1 19.1L17 17M7 7L4.9 4.9" {...p} /></>,
    /* primitivas de UI */
    fleet: <><rect x="3" y="3" width="7" height="7" rx="1.5" {...p} /><rect x="14" y="3" width="7" height="7" rx="1.5" {...p} /><rect x="3" y="14" width="7" height="7" rx="1.5" {...p} /><rect x="14" y="14" width="7" height="7" rx="1.5" {...p} /></>,
    audit: <><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" {...p} /><path d="M14 3v5h5M8.5 13h7M8.5 17h7" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1M19.1 19.1L17 17M7 7L4.9 4.9" {...p} /></>,
    bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" {...p} />,
    bell2: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...p} />,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="m21 21-4.3-4.3" {...p} /></>,
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    minus: <path d="M5 12h14" {...p} />,
    check: <path d="M5 12l4.5 4.5L19 7" {...p} />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" {...p} />,
    lock: <><rect x="4.5" y="11" width="15" height="9" rx="2" {...p} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" {...p} /><path d="M4 7l8 6 8-6" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3 2" {...p} /></>,
    filter: <path d="M3 5h18l-7 8v6l-4-2v-4z" {...p} />,
    sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" {...p} />,
    chart: <><path d="M4 4v16h16" {...p} /><path d="M8 14l3-4 3 3 4-6" {...p} /></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p} />,
    shield: <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" {...p} />,
    chevron: <path d="M6 9l6 6 6-6" {...p} />,
    chevronRight: <path d="M9 6l6 6-6 6" {...p} />,
    chevronLeft: <path d="M15 6l-6 6 6 6" {...p} />,
    chevronUp: <path d="M6 15l6-6 6 6" {...p} />,
    dot3: <><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...p} />,
    play: <><circle cx="12" cy="12" r="9" {...p} /><path d="M10 8.5l5 3.5-5 3.5z" {...p} /></>,
    pause: <><circle cx="12" cy="12" r="9" {...p} /><path d="M10 9v6M14 9v6" {...p} /></>,
    x: <path d="M6 6l12 12M18 6L6 18" {...p} />,
    info: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 11v5M12 8h.01" {...p} /></>,
    alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" {...p} /><path d="M12 9v4M12 17h.01" {...p} /></>,
    trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" {...p} />,
    download: <path d="M12 3v12M7 11l5 4 5-4M5 21h14" {...p} />,
    upload: <path d="M12 21V9M7 13l5-4 5 4M5 3h14" {...p} />,
    paperclip: <path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8" {...p} />,
    tag: <><path d="M3 3h7.2L21 13.8a2 2 0 0 1 0 2.8l-4.4 4.4a2 2 0 0 1-2.8 0L3 10.2z" {...p} /><circle cx="7.5" cy="7.5" r="1.3" {...p} /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" {...p} /><path d="M5 15V5a2 2 0 0 1 2-2h8" {...p} /></>,
    external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" {...p} />,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.5" {...p} /><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" {...p} /><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M22 20c0-2.6-1.8-4.8-4.3-5.6" {...p} /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" {...p} /><rect x="14" y="3" width="7" height="7" rx="1.5" {...p} /><rect x="3" y="14" width="7" height="7" rx="1.5" {...p} /><rect x="14" y="14" width="7" height="7" rx="1.5" {...p} /></>,
    code: <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" {...p} />,
    sun: <><circle cx="12" cy="12" r="4.5" {...p} /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...p} /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" {...p} />,
    contrast: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" /></>,
    type: <path d="M4 6V4h16v2M9 20h6M12 4v16" {...p} />,
    palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-2 0-.6-.2-1-.6-1.4-.3-.4-.6-.8-.6-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4-4-7.5-9-7.5z" {...p} /><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="16.5" cy="11" r="1" fill="currentColor" stroke="none" /></>,
    box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" {...p} /><path d="M3 7l9 4 9-4M12 11v10" {...p} /></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2" {...p} /><path d="M3 9h18M9 21V9" {...p} /></>,
    bricks: <><rect x="3" y="3" width="18" height="18" rx="2" {...p} /><path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" {...p} /></>,
    logout: <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 17l-5-5 5-5M5 12h11" {...p} />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p} /><circle cx="12" cy="12" r="2.5" {...p} /></>,
    refresh: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" {...p} />,
    /* iconos de categoría del catálogo */
    heading: <path d="M6 4v16M18 4v16M6 12h12" {...p} />,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" {...p} />,
    table: <><rect x="3" y="4" width="18" height="16" rx="2" {...p} /><path d="M3 9h18M9 4v16" {...p} /></>,
    form: <><rect x="4" y="3" width="16" height="18" rx="2" {...p} /><path d="M8 8h8M8 12h8M8 16h4" {...p} /></>,
    compass: <><circle cx="12" cy="12" r="9" {...p} /><path d="m15 9-2 6-4 2 2-6z" {...p} /></>,
    layers: <><path d="M12 3 2 8l10 5 10-5-10-5z" {...p} /><path d="m2 14 10 5 10-5" {...p} /></>,
    flowGraph: <><rect x="2" y="9" width="6" height="6" rx="1" {...p} /><rect x="16" y="3" width="6" height="6" rx="1" {...p} /><rect x="16" y="15" width="6" height="6" rx="1" {...p} /><path d="M8 12h4M12 12V6h4M12 12v6h4" {...p} /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" {...p} /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" {...p} /></>,
    toggle: <><rect x="2" y="7" width="20" height="10" rx="5" {...p} /><circle cx="8" cy="12" r="3" fill="currentColor" stroke="none" /></>,
    creditcard: <><rect x="2" y="5" width="20" height="14" rx="2" {...p} /><path d="M2 10h20" {...p} /></>,
    menu: <path d="M3 6h18M3 12h18M3 18h18" {...p} />,
    inbox: <><path d="M3 12h5l2 3h4l2-3h5" {...p} /><path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'block', flex: '0 0 auto' }}>{g[name] || null}</svg>;
}

/* ── Logo · marca musematic (vectorizada, hereda currentColor) ────────────── */
const MARK_D = "M252.45 62L256 61.04L260 62.84L301.33 88L301.41 141L294 146.26L260 166.28L188 207.56L186.51 209L187 210.37L316 282.34L332 290.19L332.89 161L338 156.62L375 134.68L380 133.8L423 158.51L425.52 161L426.18 169L425.94 327L425 351.92L273 441.24L259.03 449L256 449.5L251 448.26L215 427.9L208.5 423L208.93 371L217 364.81L323 303.3L325.27 301L324 299.76L180 219.93L179.03 232L179.48 348L178.03 353L136.02 377L132 377.96L86.44 352L85.54 351L84.94 333L85.52 161L90.26 157L114 142.76ZM253.38 75L255 74.28L259 75.85L282 89.31L283.28 91L280 93.49L133 179.21L131 179.51L129 178.5L103.88 164L104 162.57L115 155.76ZM288.37 102L290.25 102L290.29 134L288 136.48L273 145.37L174 202.69L172 202.39L150 189.98L144.57 186ZM375.87 148L378 147.11L381 147.86L405 161.54L407.1 163L407.01 164L380 179.22L374 176.82L353 165.5L350.56 163ZM343.63 174L346 174.42L366 185.59L373.51 191L373 313.81L351 302.36L345 298.89L343.62 297ZM96.44 175L98 174.32L108 179.54L125 189.52L126.75 192L126.76 352L126.71 360L126 361.22L102 348.23L96.35 344ZM411.61 175L413 174.2L414.35 175L413.92 344L410 347.18L325 397.29L262 433.37L261.32 432L261.33 402L262.58 400L375 333.92L384.62 327L384.98 192L388 188.71ZM138.4 198L140 197.49L158 207.55L167 213.03L168.24 216L168.25 344L165 347.26L139 361.79ZM337.79 308L366.5 324L366 325.45L353 333.28L256 390.29L226.93 374L230 370.98ZM219.89 385L221 384.24L223 385.12L249.52 401L249.7 432L249 433.65L219.89 417Z";

function MusematicMark({ s = 28, color = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 512 512" style={{ display: 'block', flex: '0 0 auto' }} role="img" aria-label="musematic">
      <path fill={color} fillRule="evenodd" d={MARK_D} />
    </svg>);
}

function LogoMark({ s = 28 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ display: 'block', flex: '0 0 auto' }} role="img" aria-label="musematic">
      <rect width="64" height="64" rx="14" fill="#0C2017" />
      <svg x="9" y="9" width="46" height="46" viewBox="0 0 512 512"><path fill="#33CE73" fillRule="evenodd" d={MARK_D} /></svg>
    </svg>);
}

function Wordmark({ s = 28, fs = 18, label = 'musematic' }) {
  return (
    <div className="flex items-center gap-[7px]">
      <LogoMark s={s} />
      <span className="font-sans font-bold tracking-tight text-foreground" style={{ fontSize: fs, letterSpacing: '-0.02em' }}>{label}<span className="text-primary">.</span></span>
    </div>);
}

/* ── CodeBlock · colapsable + copiar ─────────────────────────────────────── */
function CodeBlock({ code, lang = 'tsx', open: openInit = false }) {
  const [open, setOpen] = useState(openInit);
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  return (
    <div className="mt-3 rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 h-9 border-b border-border/70">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name={open ? 'chevronUp' : 'chevronRight'} size={14} />
          <span className="font-mono text-[11px] tracking-wide uppercase">{lang}</span>
        </button>
        <button onClick={copy} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name={copied ? 'check' : 'copy'} size={14} className={copied ? 'text-primary' : ''} />
          <span className={"font-mono text-[11px] " + (copied ? 'text-primary' : '')}>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      {open && <pre className="m-0 p-4 overflow-x-auto text-[12.5px] leading-relaxed text-foreground/85 bg-background/40"><code>{code}</code></pre>}
    </div>);
}

/* ── Card · una entrada del catálogo: nombre + blurb + preview + código ───── */
function Card({ name, blurb, code, lang = 'tsx', children, align = 'center', pad = 'p-10', surface = true, span = 1 }) {
  const justify = align === 'start' ? 'justify-start' : align === 'stretch' ? '' : 'justify-center';
  const colSpan = span === 2 ? 'lg:col-span-2' : '';
  return (
    <section className={"min-w-0 " + colSpan}>
      {name &&
        <div className="mb-3">
          <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{name}</h3>
          {blurb && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{blurb}</p>}
        </div>}
      <div className={(surface ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border overflow-hidden"}>
        <div className={"flex flex-wrap items-center gap-4 " + justify + ' ' + pad}>{children}</div>
      </div>
      {code && <CodeBlock code={code} lang={lang} />}
    </section>);
}

/* ── Encabezado de sección ───────────────────────────────────────────────── */
function SectionHead({ kicker, title, intro, status }) {
  return (
    <div className="mb-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        {kicker && <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-text">{kicker}</div>}
        {status && <StatusTag status={status} />}
      </div>
      <h1 className="font-sans font-bold text-[2rem] leading-tight tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>{title}</h1>
      {intro && <p className="font-sans text-[15px] text-muted-foreground mt-3 leading-relaxed" style={{ textWrap: 'pretty' }}>{intro}</p>}
    </div>);
}

/* ── Etiqueta de estado (done / wip / todo) ──────────────────────────────── */
function StatusTag({ status }) {
  const map = {
    done: ['Listo', 'bg-primary/14 text-primary-text'],
    wip: ['En curso', 'bg-warning/16 text-warning-text'],
    todo: ['Pendiente', 'bg-muted-foreground/16 text-muted-foreground'],
  };
  const [label, cls] = map[status] || map.todo;
  return <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10px] font-semibold tracking-wide uppercase " + cls}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
  </span>;
}

/* ── Grilla de cards ─────────────────────────────────────────────────────── */
const Grid = ({ children, cols = 2 }) =>
  <div className={"grid gap-x-8 gap-y-12 " + (cols === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2')}>{children}</div>;

const Mono = ({ children, className = '' }) =>
  <code className={"font-mono text-[12px] text-muted-foreground " + className}>{children}</code>;

/* ── ScaleFrame · renderiza a un ancho de diseño fijo y escala para encajar ── */
function ScaleFrame({ width = 1320, children }) {
  const outer = useRef(null), inner = useRef(null);
  const [s, setS] = useState(1), [h, setH] = useState(0);
  useEffect(() => {
    function fit() {
      if (!outer.current || !inner.current) return;
      const sc = Math.min(1, outer.current.clientWidth / width);
      setS(sc); setH(inner.current.offsetHeight * sc);
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className="w-full" style={{ height: h || undefined, overflow: 'hidden' }}>
      <div ref={inner} style={{ width, transform: `scale(${s})`, transformOrigin: 'top left' }}>{children}</div>
    </div>);
}

/* ── useClickOutside ─────────────────────────────────────────────────────── */
function useClickOutside(ref, onClose, active = true) {
  useEffect(() => {
    if (!active) return;
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [ref, onClose, active]);
}

Object.assign(window, {
  Icon, LogoMark, Wordmark, MusematicMark, MARK_D, CodeBlock, Card, SectionHead, StatusTag, Grid, Mono,
  ScaleFrame, useClickOutside, useState, useEffect, useRef, useCallback,
});
