/* ============================================================================
   Gntik UI · section-headings.jsx — cabeceras de bloque dentro del contenido.
   Mismo sistema que las page headings: rótulo verde mono (opcional) + título
   en blanco + divisor inferior. Sin iconos. Dominio musematic · tokens.
   Variantes: simple · con acciones · con rótulo · con contador.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock } = window;

const SecBtn = ({ children }) => (
  <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const SecLink = ({ children }) => (
  <button className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">{children}</button>
);

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card">
      <div className="p-7">{children}</div>
    </div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const CODE_SIMPLE = `// Simple — título + descripción, con divisor inferior
<div className="pb-3 border-b border-border">
  <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Recent runs</h2>
  <p className="mt-1 text-[13px] text-muted-foreground">Last 24 hours across every agent in this namespace.</p>
</div>`;

const CODE_ACTIONS = `// Con acciones — título + descripción a la izquierda, acción a la derecha
<div className="flex items-end justify-between gap-4 flex-wrap pb-3 border-b border-border">
  <div>
    <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Policies</h2>
    <p className="mt-1 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
  </div>
  <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold">Add policy</button>
</div>`;

const CODE_COUNT = `// Con contador — título + total + acción de texto
<div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
  <div className="flex items-center gap-2.5">
    <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Members</h2>
    <span className="font-mono text-[11px] px-2 h-[20px] inline-flex items-center rounded-full bg-secondary text-muted-foreground">8</span>
  </div>
  <button className="text-[13px] font-semibold text-primary">Invite</button>
</div>`;

function SectionHeadingsSection() {
  return (
    <div>
      <SectionHead kicker="Headings" title="Section headings" status="done"
        intro="Cabeceras de bloque dentro de una vista: dividen el contenido en bloques (Health, Recent runs, Budget…). A diferencia de la page heading no llevan rótulo verde —el verde marca la ubicación de la página— ni repiten el nombre de la página o de la tab activa. Título en blanco a menor escala, sin iconos." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Título y descripción con un divisor inferior. El separador de bloque por defecto." code={CODE_SIMPLE}>
        <div className="pb-3 border-b border-border">
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Recent runs</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Last 24 hours across every agent in this namespace.</p>
        </div>
      </Variant>

      {/* 2 · Con acciones */}
      <Variant title="Con acciones" desc="Título y descripción a la izquierda; una acción de bloque a la derecha." code={CODE_ACTIONS}>
        <div className="flex items-end justify-between gap-4 flex-wrap pb-3 border-b border-border">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Policies</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
          </div>
          <SecBtn>Add policy</SecBtn>
        </div>
      </Variant>

      {/* 3 · Con contador */}
      <Variant title="Con contador" desc="Título con el total al lado y una acción de texto. Para cabeceras de lista o colección." code={CODE_COUNT}>
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Members</h2>
            <span className="font-mono text-[11px] px-2 h-[20px] inline-flex items-center rounded-full bg-secondary text-muted-foreground">8</span>
          </div>
          <SecLink>Invite</SecLink>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['section-headings'] = SectionHeadingsSection;
})();
