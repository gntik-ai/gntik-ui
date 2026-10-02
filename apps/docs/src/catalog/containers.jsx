/* ============================================================================
   Gntik UI · containers.jsx — anchos de contenido y padding de página (grupo "Layout").
   El esqueleto invisible: la escala de anchos máximos, el contenedor centrado de
   lectura, los gutters responsivos de la página y el patrón full-bleed con
   contenido constreñido. No pinta UI nueva, ordena el espacio. Dominio musematic.
   Variantes: escala de anchos · centrado · gutters · full-bleed constreñido.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

/* ── envoltura de variante ───────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── barra de medida — representa un max-w con su etiqueta mono ───────────── */
const WIDTHS = [
  { cls: 'max-w-sm', px: '24rem', use: 'modal / aside' },
  { cls: 'max-w-md', px: '28rem', use: 'formulario' },
  { cls: 'max-w-2xl', px: '42rem', use: 'lectura / detalle' },
  { cls: 'max-w-4xl', px: '56rem', use: 'contenido de página' },
  { cls: 'max-w-7xl', px: '80rem', use: 'shell / dashboard' },
];

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SCALE = `// Anchos máximos — siempre con mx-auto para centrar el bloque
<div className="mx-auto max-w-2xl">{/* lectura / detalle de recurso */}</div>
<div className="mx-auto max-w-7xl">{/* el shell completo del dashboard */}</div>`;

const CODE_CENTER = `// Contenedor centrado de lectura — columna estrecha sobre la página
<main className="px-6 py-10">
  <div className="mx-auto max-w-2xl space-y-6">
    <h1 className="text-[22px] font-bold tracking-tight text-foreground">Editar agente</h1>
    {/* el formulario nunca se estira más allá de ~42rem */}
  </div>
</main>`;

const CODE_GUTTER = `// Gutters responsivos — el padding lateral crece con el viewport
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* el contenido respira en pantallas anchas y se pega en móvil */}
</div>`;

const CODE_BLEED = `// Full-bleed con contenido constreñido — banda al ancho total,
// contenido centrado dentro. La cabecera sangra, el cuerpo no.
<header className="border-b border-border bg-card">
  <div className="mx-auto max-w-7xl px-6 py-4">{/* título + acciones */}</div>
</header>
<main className="mx-auto max-w-7xl px-6 py-8">{/* contenido */}</main>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ContainersSection() {
  return (
    <div>
      <SectionHead kicker="Layout" title="Containers" status="done"
        intro="El esqueleto invisible de cada pantalla: la escala de anchos máximos que evita líneas de texto demasiado largas, el contenedor centrado para lectura y formularios, los gutters que crecen con el viewport, y el patrón full-bleed donde una banda ocupa todo el ancho pero su contenido queda constreñido. No pinta componentes — ordena el espacio en el que viven." />

      {/* 1 · ESCALA DE ANCHOS */}
      <Variant title="Escala de anchos" desc="Los anchos máximos que usa la template, del modal al shell completo. Cada bloque se centra con mx-auto; la barra muestra su ancho relativo y para qué se usa." code={CODE_SCALE}>
        <div className="space-y-3.5">
          {WIDTHS.map((w) => (
            <div key={w.cls} className="flex items-center gap-4">
              <code className="w-24 shrink-0 font-mono text-[11.5px] text-foreground">{w.cls}</code>
              <div className="relative h-8 flex-1 rounded-md bg-secondary/60 overflow-hidden">
                <div className="h-full rounded-md bg-primary/14 border border-primary/30" style={{ width: `calc(${w.px} / 80rem * 100%)` }} />
                <span className="absolute inset-y-0 left-3 flex items-center font-mono text-[10.5px] text-primary">{w.px}</span>
              </div>
              <span className="hidden w-32 shrink-0 text-right text-[11.5px] text-muted-foreground sm:block">{w.use}</span>
            </div>
          ))}
        </div>
      </Variant>

      {/* 2 · CENTRADO */}
      <Variant title="Contenedor centrado" desc="Una columna estrecha (max-w-2xl) centrada sobre el ancho de la página: el patrón para detalle de recurso, lectura o un formulario, donde estirarse sería ilegible." code={CODE_CENTER}>
        <div className="rounded-lg bg-secondary/40 px-4 py-6 [background-image:repeating-linear-gradient(135deg,hsl(var(--border)/0.35)_0_1px,transparent_1px_12px)]">
          <div className="mx-auto max-w-[440px] rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary">max-w-2xl · mx-auto</div>
            <h3 className="mt-2 text-[15px] font-semibold text-foreground">Editar agente</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>La columna se mantiene legible aunque la página crezca: el contenido nunca pasa de ~42rem y el resto queda como margen.</p>
            <div className="mt-4 space-y-2">
              <div className="h-9 rounded-md border border-border bg-background/60" />
              <div className="h-9 rounded-md border border-border bg-background/60" />
            </div>
          </div>
        </div>
      </Variant>

      {/* 3 · GUTTERS */}
      <Variant title="Gutters responsivos" desc="El padding lateral del contenedor crece por breakpoint (px-4 → sm:px-6 → lg:px-8): el contenido respira en pantallas anchas y se pega a los bordes en móvil. Las zonas rayadas son los gutters." code={CODE_GUTTER}>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-stretch">
            <div className="w-8 shrink-0 [background-image:repeating-linear-gradient(135deg,hsl(var(--primary)/0.18)_0_1px,transparent_1px_8px)]" />
            <div className="flex-1 py-6">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] text-muted-foreground">px-4 · sm:px-6 · lg:px-8</div>
                <span className="inline-flex h-[22px] items-center gap-1.5 rounded-md bg-primary/14 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary"><Icon name="layout" size={12} />contenido</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg border border-border bg-secondary/50" />)}
              </div>
            </div>
            <div className="w-8 shrink-0 [background-image:repeating-linear-gradient(135deg,hsl(var(--primary)/0.18)_0_1px,transparent_1px_8px)]" />
          </div>
        </div>
      </Variant>

      {/* 4 · FULL-BLEED */}
      <Variant title="Full-bleed con contenido constreñido" desc="Una banda — cabecera o footer — ocupa el ancho total con su propio fondo y borde, pero su contenido se centra en el mismo max-w que el cuerpo. Así el separador sangra de lado a lado y el contenido queda alineado." code={CODE_BLEED}>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* banda a sangre */}
          <div className="border-b border-border bg-secondary/40">
            <div className="mx-auto flex max-w-[520px] items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="fleet" size={15} /></span>
                <span className="text-[13.5px] font-semibold text-foreground">Fleet</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">banda full-bleed</span>
            </div>
          </div>
          {/* cuerpo constreñido al mismo ancho */}
          <div className="mx-auto max-w-[520px] px-5 py-6">
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>El fondo de la cabecera llega a los dos bordes, pero su título se alinea con este párrafo porque ambos comparten <code className="font-mono text-[12px] text-foreground">max-w</code> y <code className="font-mono text-[12px] text-foreground">px</code>.</p>
            <div className="mt-4 h-20 rounded-lg border border-border bg-secondary/40" />
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['containers'] = ContainersSection;
})();
