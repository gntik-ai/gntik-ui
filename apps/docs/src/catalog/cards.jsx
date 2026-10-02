/* ============================================================================
   Gntik UI · cards.jsx — la tarjeta como superficie de contenido (grupo "Layout").
   El contenedor base que envuelve casi todo el catálogo: simple, con cabecera,
   con footer, con secciones a tope (divididas), sobre un well gris, y con media.
   Aquí se enseña la superficie (borde, radio, padding, sombra plana), no su
   contenido. Dominio musematic · solo tokens, sin color hardcodeado.
   Variantes: simple · con cabecera · con footer · seccionada · en well · con media.
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
    <div className="preview-surface rounded-lg border border-border p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── placeholder de imagen — bandas sutiles + etiqueta mono ──────────────── */
const Media = ({ label = 'imagen 16:9', ratio = '16 / 9' }) => (
  <div className="relative w-full overflow-hidden bg-secondary" style={{ aspectRatio: ratio }}>
    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(135deg, hsl(var(--border) / 0.5) 0 1px, transparent 1px 11px)' }} />
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
    </div>
  </div>
);

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — borde + radio + padding + sombra plana. La superficie base.
<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
  <h3 className="text-[14px] font-semibold text-foreground">support-triage</h3>
  <p className="mt-1 text-[13px] text-muted-foreground">
    Clasifica tickets entrantes y enruta al equipo correcto.
  </p>
</div>`;

const CODE_HEADER = `// Con cabecera — título + acción arriba, separados por un borde del cuerpo
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
    <h3 className="text-[14px] font-semibold text-foreground">Política de reintentos</h3>
    <button className="text-muted-foreground hover:text-foreground"><DotsIcon /></button>
  </div>
  <div className="px-5 py-4 text-[13px] text-muted-foreground">{/* cuerpo */}</div>
</div>`;

const CODE_FOOTER = `// Con footer — acción primaria abajo, sobre un well sutil
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <div className="px-5 py-4">{/* cuerpo */}</div>
  <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3">
    <button className="...secondary">Descartar</button>
    <button className="...primary">Aprobar</button>
  </div>
</div>`;

const CODE_SECTIONED = `// Seccionada — varias filas a tope divididas por borde; sin padding exterior
<div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
  {rows.map((r) => (
    <div key={r.k} className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[13px] text-muted-foreground">{r.k}</span>
      <span className="font-mono text-[12.5px] text-foreground">{r.v}</span>
    </div>
  ))}
</div>`;

const CODE_WELL = `// En well — card de menor jerarquía: fondo secundario, sin sombra
<div className="rounded-xl border border-border bg-secondary/50 p-5">
  <p className="text-[13px] text-muted-foreground">
    Esta region no acepta nuevos despliegues hasta revisar la cuota.
  </p>
</div>`;

const CODE_MEDIA = `// Con media — imagen a tope arriba, contenido debajo
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
  <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
  <div className="p-5">
    <h3 className="text-[14px] font-semibold text-foreground">Runbook · incidentes</h3>
    <p className="mt-1 text-[13px] text-muted-foreground">{/* … */}</p>
  </div>
</div>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function CardsSection() {
  return (
    <div>
      <SectionHead kicker="Layout" title="Cards" status="done"
        intro="La tarjeta es la superficie sobre la que se monta casi todo el catálogo: borde de 1px, radio del token, padding generoso y una sombra plana brand-tinted — nunca glow ni degradado. Aquí se muestra la superficie en sí: simple, con cabecera, con footer de acciones, seccionada a tope, en well para bajar jerarquía, y con media. El contenido es lo de menos." />

      {/* 1 · SIMPLE */}
      <Variant title="Simple" desc="Borde, radio, padding y sombra plana. La unidad base — un agente, una nota, un resumen — cuando no necesita ni cabecera ni acciones." code={CODE_SIMPLE}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/14 text-primary shrink-0"><Icon name="bot" size={18} /></span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-foreground truncate">support-triage</h3>
              <p className="font-mono text-[11px] text-muted-foreground">agent · v2.3.0</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Clasifica los tickets entrantes y los enruta al equipo correcto. 1.2M runs en los últimos 30 días.</p>
        </div>
      </Variant>

      {/* 2 · CON CABECERA */}
      <Variant title="Con cabecera" desc="Una cabecera con título y acción, separada del cuerpo por un borde. El patrón para un panel del dashboard o un bloque de ajustes." code={CODE_HEADER}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h3 className="text-[14px] font-semibold text-foreground">Política de reintentos</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="dot3" size={18} /></button>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Hasta 3 reintentos con backoff exponencial; a partir del cuarto fallo el run se marca como <span className="text-foreground font-medium">failed</span> y se notifica al operador.</p>
          </div>
        </div>
      </Variant>

      {/* 3 · CON FOOTER */}
      <Variant title="Con footer de acciones" desc="El cuerpo arriba y una barra de acciones abajo sobre un well sutil. Para tarjetas que piden una decisión — aprobar, descartar, confirmar." code={CODE_FOOTER}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="text-[14px] font-semibold text-foreground">Subir el límite de gasto</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>El namespace <span className="font-mono text-[12px] text-foreground">production</span> alcanzó el 92% de su tope diario. ¿Aumentar de $2k a $3k?</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3">
            <button className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground hover:bg-accent/50 transition-colors">Descartar</button>
            <button className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Aumentar</button>
          </div>
        </div>
      </Variant>

      {/* 4 · SECCIONADA */}
      <Variant title="Seccionada" desc="Filas a tope divididas por un borde, sin padding exterior. Para detalle de un recurso: pares clave-valor o sub-bloques apilados dentro de un único marco." code={CODE_SECTIONED}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
          {[['namespace', 'production'], ['region', 'eu-west-1'], ['modelo', 'claude-sonnet'], ['gasto/día', '$1.84k'], ['estado', 'activo']].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[13px] text-muted-foreground">{k}</span>
              <span className="font-mono text-[12.5px] text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </Variant>

      {/* 5 · EN WELL */}
      <Variant title="En well" desc="Fondo secundario y sin sombra: una tarjeta de menor jerarquía, para notas inline, contexto o avisos suaves dentro de otra superficie." code={CODE_WELL}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-secondary/50 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-7 place-items-center rounded-md bg-muted-foreground/15 text-muted-foreground shrink-0 mt-0.5"><Icon name="info" size={15} /></span>
            <p className="text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>La región <span className="font-mono text-[12px] text-foreground">eu-residency</span> no acepta nuevos despliegues hasta revisar la cuota de cómputo asignada.</p>
          </div>
        </div>
      </Variant>

      {/* 6 · CON MEDIA */}
      <Variant title="Con media" desc="Una imagen a tope en la cabecera y el contenido debajo. Para entradas de catálogo o documentación donde la visual importa — overflow-hidden recorta la media al radio." code={CODE_MEDIA}>
        <div className="mx-auto max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Media label="cover 16:9" />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-[20px] items-center rounded-md bg-primary/14 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">runbook</span>
              <span className="font-mono text-[11px] text-muted-foreground">actualizado hoy</span>
            </div>
            <h3 className="mt-2 text-[14px] font-semibold text-foreground">Respuesta a incidentes</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>Pasos para contener un agente con comportamiento anómalo y revertir su política activa.</p>
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['cards'] = CardsSection;
})();
