/* ============================================================================
   Gntik UI · spinners.jsx — indicadores de carga (grupo "Feedback").
   Para esperas cortas e indeterminadas donde no conviene un skeleton: tres
   puntos en onda, anillo circular (SVG arc + variante por bordes) y un loader
   de marca con el glyph de musematic. El activo siempre en verde de marca; el
   color sale de text-* (currentColor) y el tamaño de width/height. Dominio
   musematic, todo en tokens, cero color hardcodeado (salvo el glyph de marca).
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, MusematicMark, Wordmark, useState, useRef, useEffect } = window;

/* keyframes propios del módulo (los demás usan animate-spin de Tailwind) */
const SPINNER_KEYFRAMES =
  '@keyframes museDot{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}' +
  '@keyframes museBreathe{0%,100%{opacity:.35;transform:scale(.88)}50%{opacity:1;transform:scale(1)}}';

const Variant = ({ title, desc, code, surface = 'dots', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-6 sm:p-8"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);
const Spec = ({ children }) => <span className="mt-3 block text-center font-mono text-[10.5px] text-muted-foreground/70">{children}</span>;
const Cell = ({ label, children }) => (
  <div className="flex flex-col items-center">
    <div className="flex h-12 items-center justify-center">{children}</div>
    <Spec>{label}</Spec>
  </div>
);

/* ── 1 · CIRCULAR (SVG arc) ──────────────────────────────────────────────── */
function Ring({ size = 24, stroke, tone = 'primary' }) {
  const sw = stroke || Math.max(2, Math.round(size * 0.11));
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const cls = tone === 'muted' ? 'text-muted-foreground' : tone === 'current' ? '' : 'text-primary';
  return (
    <svg width={size} height={size} role="status" aria-label="Cargando" className={"animate-spin " + cls} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeOpacity="0.22" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * 0.72} />
    </svg>
  );
}
/* variante por bordes — una sola etiqueta (igual que el loader de Monaco) */
const RingBorder = ({ size = 28, stroke = 3 }) => (
  <span role="status" aria-label="Cargando" className="inline-block rounded-full border-border border-t-primary animate-spin"
    style={{ width: size, height: size, borderWidth: stroke, borderStyle: 'solid' }} />
);
function CircularRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-9 gap-y-4">
      <Cell label="16">  <Ring size={16} /></Cell>
      <Cell label="22">  <Ring size={22} /></Cell>
      <Cell label="28">  <Ring size={28} /></Cell>
      <Cell label="44">  <Ring size={44} /></Cell>
      <Cell label="neutral"><Ring size={28} tone="muted" /></Cell>
      <Cell label="bordes"> <RingBorder size={28} /></Cell>
    </div>
  );
}

/* ── 2 · TRES PUNTOS (onda) ──────────────────────────────────────────────── */
function Dots({ dot = 7, gap = 5, tone = 'primary' }) {
  const color = tone === 'muted' ? 'bg-muted-foreground' : tone === 'current' ? 'bg-current' : 'bg-primary';
  return (
    <span role="status" aria-label="Cargando" className="inline-flex items-center" style={{ gap }}>
      {[0, 1, 2].map(i => (
        <span key={i} className={"rounded-full " + color}
          style={{ width: dot, height: dot, animation: 'museDot 1.05s ease-in-out infinite', animationDelay: (i - 2) * 0.16 + 's' }} />
      ))}
    </span>
  );
}
function DotsRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
      <Cell label="sm"><Dots dot={6} gap={4} /></Cell>
      <Cell label="md"><Dots dot={9} gap={6} /></Cell>
      <Cell label="lg"><Dots dot={13} gap={8} /></Cell>
      <Cell label="neutral"><Dots dot={9} gap={6} tone="muted" /></Cell>
      <Cell label="en botón">
        <button disabled className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground opacity-90">
          <Dots dot={5} gap={3.5} tone="current" />Guardando…
        </button>
      </Cell>
    </div>
  );
}

/* ── 3 · MUSEMATIC (marca) ───────────────────────────────────────────────── */
function BrandSpin({ size = 64 }) {
  const stroke = Math.max(2, Math.round(size * 0.05));
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const inner = Math.round(size * 0.46);
  return (
    <span role="status" aria-label="Cargando" className="relative inline-grid place-items-center text-primary" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="animate-spin absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeOpacity="0.18" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * 0.72} />
      </svg>
      <MusematicMark s={inner} />
    </span>
  );
}
const BrandBreathe = ({ size = 44 }) => (
  <span role="status" aria-label="Cargando" className="inline-block text-primary" style={{ animation: 'museBreathe 1.5s ease-in-out infinite' }}>
    <MusematicMark s={size} />
  </span>
);
function BrandRow() {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-x-9 gap-y-6">
      <Cell label="marca + anillo"><div className="flex h-16 items-center"><BrandSpin size={60} /></div></Cell>
      <Cell label="respiración"><div className="flex h-16 items-center"><BrandBreathe size={42} /></div></Cell>
      {/* boot splash — pantalla de arranque del producto */}
      <div className="flex flex-col items-center">
        <div className="flex h-16 items-center">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-chrome px-10 py-7 shadow-sm">
            <Wordmark s={30} fs={20} />
            <div className="flex items-center gap-2.5">
              <Ring size={15} tone="muted" />
              <span className="font-mono text-[11.5px] text-muted-foreground">Iniciando el Fleet…</span>
            </div>
          </div>
        </div>
        <Spec>boot splash</Spec>
      </div>
    </div>
  );
}

/* ── 4 · EN CONTEXTO (swap real, interactivo) ────────────────────────────── */
const AGENTS = [
  { name: 'support-triage', runs: '1.2k runs' },
  { name: 'invoice-parser', runs: '840 runs' },
  { name: 'lead-router', runs: '305 runs' },
];
function ContextDemo() {
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  const start = () => { clearTimeout(timer.current); setLoading(true); timer.current = setTimeout(() => setLoading(false), 1700); };
  useEffect(() => { start(); return () => clearTimeout(timer.current); }, []);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 text-muted-foreground">
          <Ring size={15} tone="current" />
          <span className="font-mono text-[12px]">{loading ? 'Sincronizando Fleet…' : 'Fleet sincronizado'}</span>
        </div>
        <button onClick={start} disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70 disabled:opacity-50">
          <Icon name="refresh" size={13} className={(loading ? 'animate-spin ' : '') + 'text-muted-foreground'} />Recargar
        </button>
      </div>
      <div className="relative h-[152px] overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <BrandSpin size={50} />
            <span className="font-mono text-[11px] text-muted-foreground">Cargando agentes…</span>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {AGENTS.map(a => (
              <li key={a.name} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid size-7 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="bot" size={15} /></span>
                <span className="flex-1 text-[13px] font-medium text-foreground">{a.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{a.runs}</span>
                <span className="size-1.5 rounded-full bg-primary" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_RING = `// Circular — pista a 0.22 de opacidad + arco con cap redondo, animate-spin.
// El color sale de text-* (currentColor); el tamaño, de width/height.
function Spinner({ size = 24, className = "text-primary" }) {
  const sw = Math.max(2, Math.round(size * 0.11));
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} role="status" className={"animate-spin " + className}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeOpacity="0.22" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * 0.72} />
    </svg>
  );
}

// Variante por bordes — una sola etiqueta, sin SVG:
<span className="inline-block size-7 rounded-full border-[3px] border-border border-t-primary animate-spin" />`;

const CODE_DOTS = `/* keyframes — añádelo una vez en tu CSS global */
@keyframes museDot { 0%,80%,100% { transform: scale(.5); opacity:.3 } 40% { transform: scale(1); opacity:1 } }

// Tres puntos — el desfase negativo arranca la onda a mitad de ciclo.
function Dots({ dot = 7, gap = 5, className = "bg-primary" }) {
  return (
    <span className="inline-flex items-center" style={{ gap }} role="status">
      {[0, 1, 2].map((i) => (
        <span key={i} className={"rounded-full " + className}
          style={{ width: dot, height: dot, animation: "museDot 1.05s ease-in-out infinite",
                   animationDelay: (i - 2) * 0.16 + "s" }} />
      ))}
    </span>
  );
}

// En un botón: hereda el color con bg-current sobre el verde de marca.
<button disabled className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-primary-foreground">
  <Dots dot={5} gap={3.5} className="bg-current" /> Guardando…
</button>`;

const CODE_BRAND = `/* keyframes — respiración del logo */
@keyframes museBreathe { 0%,100% { opacity:.35; transform:scale(.88) } 50% { opacity:1; transform:scale(1) } }

// A · marca fija + anillo girando alrededor (MusematicMark hereda text-primary)
<span className="relative inline-grid size-16 place-items-center text-primary">
  <svg width={64} height={64} className="absolute inset-0 animate-spin">
    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.18" />
    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * 0.72} />
  </svg>
  <MusematicMark s={30} />
</span>

// B · respiración de la marca
<span className="inline-block text-primary" style={{ animation: "museBreathe 1.5s ease-in-out infinite" }}>
  <MusematicMark s={44} />
</span>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function SpinnersSection() {
  return (
    <div>
      <style>{SPINNER_KEYFRAMES}</style>
      <SectionHead kicker="Feedback" title="Spinners" status="done"
        intro="El indicador para esperas cortas e indeterminadas — una llamada en vuelo, un guardado, un arranque — donde no se conoce el progreso ni conviene calcar el layout con un skeleton. Tres formas: puntos en onda para lo inline, anillo circular para lo general y un loader de marca para pantallas de arranque. El segmento activo siempre en verde de marca; el color se hereda de text-* y el tamaño se fija con width/height. Regla: si vas a mostrar contenido estructurado, prefiere un skeleton; el spinner es para lo breve o lo que no tiene forma previsible." />

      <Variant title="Circular"
        desc="El spinner de uso general: una pista tenue (currentColor al 22%) con un arco de cap redondo que gira. En SVG escala nítido a cualquier tamaño; la variante por bordes resuelve lo mismo con una sola etiqueta. Hereda el color de text-* — verde de marca por defecto, neutro para lo secundario."
        code={CODE_RING}>
        <CircularRow />
      </Variant>

      <Variant title="Tres puntos"
        desc="Tres puntos que laten en onda — el desfase negativo arranca a mitad de ciclo, así no hay un “salto” inicial. Pesa poco y cabe en línea: dentro de un botón mientras guarda, junto a una etiqueta de estado o en un input."
        code={CODE_DOTS}>
        <DotsRow />
      </Variant>

      <Variant title="Musematic"
        desc="El loader de marca para el arranque del producto: el glyph de musematic quieto con un anillo girando a su alrededor, o respirando en opacidad. Compuesto con el wordmark sobre bg-chrome da la pantalla de boot del Fleet."
        code={CODE_BRAND}>
        <BrandRow />
      </Variant>

      <Variant title="En contexto" surface="card"
        desc="El swap real: mientras llega la respuesta, el panel muestra el loader de marca centrado; al resolver, intercambia por la lista de agentes sin mover el marco. Pulsa “Recargar” para volver a verlo.">
        <ContextDemo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['spinners'] = SpinnersSection;
})();
