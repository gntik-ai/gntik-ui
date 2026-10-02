/* ============================================================================
   Gntik UI · textareas.jsx — áreas de texto (grupo "Formularios").
   La textarea de marca en sus tres usos: simple con contador, compositor con
   toolbar que publica nota al run, y etiqueta-a-la-izquierda para descripciones
   largas. Dominio musematic (runs, agentes, policies). Tokens, cero hardcode.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef } = window;

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

const taBase =
  "block w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-6 text-foreground " +
  "placeholder:text-muted-foreground shadow-sm transition-colors resize-none " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

/* avatar de iniciales (igual que en feeds/stacked-lists) */
const Avatar = ({ initials, size = 28 }) => (
  <span className="inline-grid place-items-center rounded-full bg-accent text-accent-foreground font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.4 }}>{initials}</span>
);

/* ── 1 · SIMPLE con contador ─────────────────────────────────────────────── */
function SimpleTA() {
  const MAX = 280;
  const [v, setV] = useState('El agente de checkout reintenta 3× antes de caer al fallback.');
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor="ta-note" className="block text-[13px] font-medium text-foreground">Nota del run</label>
        <span className={"font-mono text-[11px] " + (v.length > MAX ? 'text-destructive' : 'text-muted-foreground')}>{v.length}/{MAX}</span>
      </div>
      <textarea id="ta-note" rows={4} value={v} maxLength={MAX + 40} onChange={e => setV(e.target.value)} className={taBase} placeholder="Añade contexto para el siguiente operador…" />
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>Markdown básico permitido. La nota queda en la auditoría del run.</p>
    </div>
  );
}

/* ── 2 · COMPOSITOR con toolbar (publica al hilo) ────────────────────────── */
const TOOLS = [['paperclip', 'Adjuntar'], ['users', 'Mencionar'], ['code', 'Código'], ['tag', 'Etiqueta']];
function ComposerTA() {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const submit = (e) => {
    if (e) e.preventDefault();
    const t = text.trim(); if (!t) return;
    setPosts(p => [{ id: Date.now(), body: t }, ...p].slice(0, 3));
    setText('');
  };
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0"><Avatar initials="TÚ" size={32} /></span>
        <form onSubmit={submit} className="flex-auto">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
            <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Comenta sobre este run del Fleet…"
              className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <div className="flex items-center justify-between border-t border-border/70 bg-secondary/30 px-2 py-1.5">
              <div className="flex items-center gap-0.5">
                {TOOLS.map(([ic, lbl]) => (
                  <button key={ic} type="button" title={lbl} aria-label={lbl}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <Icon name={ic} size={15} />
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!text.trim()}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                Comentar
              </button>
            </div>
          </div>
        </form>
      </div>

      {posts.length > 0 && (
        <ul className="mt-5 space-y-3">
          {posts.map(p => (
            <li key={p.id} className="flex gap-3">
              <span className="mt-0.5 shrink-0"><Avatar initials="TÚ" size={28} /></span>
              <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
                <div className="text-[12px] text-muted-foreground"><span className="font-semibold text-foreground">Tú</span> comentó · <span className="font-mono text-[11px]">ahora</span></div>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/85" style={{ textWrap: 'pretty' }}>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── 3 · ETIQUETA A LA IZQUIERDA + auto-grow ─────────────────────────────── */
function LabeledTA() {
  const ref = useRef(null);
  const [v, setV] = useState('Agente de soporte tier-1. Responde tickets de facturación, escala a humano si detecta intención de cancelación. Idiomas: ES, EN.');
  const grow = (e) => {
    setV(e.target.value);
    const el = ref.current; if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
  };
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-3">
        <div>
          <label htmlFor="ta-desc" className="block text-[13px] font-semibold text-foreground">Instrucciones del agente</label>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>El system prompt que define el comportamiento. Crece con el contenido.</p>
        </div>
        <div className="md:col-span-2">
          <textarea id="ta-desc" ref={ref} value={v} onInput={grow}
            className={taBase + " min-h-[88px] overflow-hidden"} placeholder="Describe qué hace este agente…" />
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Icon name="info" size={13} className="shrink-0" />
            Se versiona en cada guardado; puedes revertir desde el historial.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `const MAX = 280;
const [v, setV] = useState('');

<div className="flex items-baseline justify-between mb-2">
  <label className="text-[13px] font-medium text-foreground">Nota del run</label>
  <span className={\`font-mono text-[11px] \${v.length > MAX ? 'text-destructive' : 'text-muted-foreground'}\`}>{v.length}/{MAX}</span>
</div>
<textarea rows={4} value={v} onChange={(e) => setV(e.target.value)}
  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-6 resize-none
             shadow-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25" />`;

const CODE_COMPOSER = `// Toolbar dentro del borde — el ring vive en el wrapper (focus-within)
<div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm
                focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
  <textarea rows={3} className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] focus:outline-none" />
  <div className="flex items-center justify-between border-t border-border/70 bg-secondary/30 px-2 py-1.5">
    <div className="flex gap-0.5">
      {tools.map((t) => <button key={t} className="grid h-7 w-7 place-items-center rounded-md
        text-muted-foreground hover:bg-secondary hover:text-foreground"><Icon name={t} /></button>)}
    </div>
    <button disabled={!text.trim()} className="h-7 rounded-md bg-primary px-3 text-[12.5px] font-semibold
      text-primary-foreground disabled:opacity-40">Comentar</button>
  </div>
</div>`;

const CODE_GROW = `// Auto-grow: resetea height y la lleva a scrollHeight en cada input
const ref = useRef(null);
const grow = (e) => {
  setV(e.target.value);
  const el = ref.current; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
};
<textarea ref={ref} value={v} onInput={grow}
  className="... resize-none min-h-[88px] overflow-hidden" />`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function TextareasSection() {
  return (
    <div>
      <SectionHead kicker="Formularios" title="Textareas" status="done"
        intro="La textarea de marca en sus tres papeles: una nota simple con contador de caracteres, un compositor con toolbar que publica al hilo del run, y un campo de instrucciones con etiqueta a la izquierda que crece con el contenido. Recessed sobre la card, ring verde al enfocar y la toolbar integrada dentro del borde." />

      <Variant title="Simple con contador"
        desc="Label + contador alineado a la derecha que se pone rojo al pasar el límite, y una nota de ayuda debajo. El caso por defecto."
        code={CODE_SIMPLE}>
        <SimpleTA />
      </Variant>

      <Variant title="Compositor con toolbar"
        desc="Toolbar de acciones (adjuntar, mencionar, código, etiqueta) y botón de envío integrados dentro del borde; el anillo de marca envuelve toda la pieza. Escribe y comenta: la nota se añade al hilo."
        code={CODE_COMPOSER}>
        <ComposerTA />
      </Variant>

      <Variant title="Etiqueta a la izquierda + auto-grow"
        desc="El layout de ajustes: descripción a la izquierda, campo a la derecha. La textarea de instrucciones del agente crece a medida que escribes y se versiona en cada guardado."
        code={CODE_GROW}>
        <LabeledTA />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['textareas'] = TextareasSection;
})();
