/* ============================================================================
   Gntik UI · pagination.jsx — paginación (grupo "Navegación").
   Numerada con elipsis y prev/next, prev/next minimal con "Página X de Y", y
   pie de tabla con rango ("1–20 de 1.284") + selector de tamaño. El activo en
   verde de marca. Dominio musematic, todo en tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* rango con elipsis: 1 … (cur-1) cur (cur+1) … total */
function pageRange(cur, total) {
  const out = [];
  const push = n => out.push(n);
  push(1);
  const lo = Math.max(2, cur - 1), hi = Math.min(total - 1, cur + 1);
  if (lo > 2) out.push('…l');
  for (let i = lo; i <= hi; i++) push(i);
  if (hi < total - 1) out.push('…r');
  if (total > 1) push(total);
  return out;
}

const Arrow = ({ dir, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled} aria-label={dir === 'l' ? 'Anterior' : 'Siguiente'}
    className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-ring/50 disabled:opacity-40 disabled:pointer-events-none">
    <Icon name={dir === 'l' ? 'chevronLeft' : 'chevronRight'} size={16} />
  </button>
);

/* ── 1 · NUMERADA con elipsis ────────────────────────────────────────────── */
function Numbered() {
  const total = 42;
  const [cur, setCur] = useState(6);
  return (
    <nav className="flex items-center justify-center gap-1.5">
      <Arrow dir="l" disabled={cur === 1} onClick={() => setCur(c => Math.max(1, c - 1))} />
      {pageRange(cur, total).map((p, i) =>
        typeof p === 'string'
          ? <span key={p + i} className="grid size-9 place-items-center text-muted-foreground/50"><Icon name="dot3" size={15} /></span>
          : <button key={p} onClick={() => setCur(p)}
              className={"grid size-9 place-items-center rounded-lg text-[13px] font-medium transition-colors " +
                (p === cur ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>{p}</button>
      )}
      <Arrow dir="r" disabled={cur === total} onClick={() => setCur(c => Math.min(total, c + 1))} />
    </nav>
  );
}

/* ── 2 · PREV/NEXT minimal ───────────────────────────────────────────────── */
function PrevNext() {
  const total = 12;
  const [cur, setCur] = useState(3);
  const Btn = ({ dir, label, disabled, onClick }) => (
    <button onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground transition-colors hover:border-ring/50 disabled:opacity-40 disabled:pointer-events-none">
      {dir === 'l' && <Icon name="chevronLeft" size={15} />}{label}{dir === 'r' && <Icon name="chevronRight" size={15} />}
    </button>
  );
  return (
    <div className="flex items-center justify-between gap-4">
      <Btn dir="l" label="Anterior" disabled={cur === 1} onClick={() => setCur(c => Math.max(1, c - 1))} />
      <span className="text-[13px] text-muted-foreground">Página <span className="font-mono font-semibold text-foreground">{cur}</span> de <span className="font-mono text-foreground">{total}</span></span>
      <Btn dir="r" label="Siguiente" disabled={cur === total} onClick={() => setCur(c => Math.min(total, c + 1))} />
    </div>
  );
}

/* ── 3 · PIE DE TABLA con rango ──────────────────────────────────────────── */
function TableFooter() {
  const totalRows = 1284;
  const [size, setSize] = useState(20);
  const [cur, setCur] = useState(1);
  const pages = Math.ceil(totalRows / size);
  const from = (cur - 1) * size + 1, to = Math.min(cur * size, totalRows);
  const setSizeReset = n => { setSize(n); setCur(1); };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="text-[12.5px] text-muted-foreground">Filas</span>
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/40">
          {[20, 50, 100].map(n => (
            <button key={n} onClick={() => setSizeReset(n)}
              className={"h-7 px-2.5 rounded-md font-mono text-[12px] transition-colors " + (size === n ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground')}>{n}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-muted-foreground tabular-nums">
          <span className="font-mono text-foreground">{from.toLocaleString('es')}–{to.toLocaleString('es')}</span> de <span className="font-mono text-foreground">{totalRows.toLocaleString('es')}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <Arrow dir="l" disabled={cur === 1} onClick={() => setCur(c => Math.max(1, c - 1))} />
          <Arrow dir="r" disabled={cur === pages} onClick={() => setCur(c => Math.min(pages, c + 1))} />
        </div>
      </div>
    </div>
  );
}

const CODE_NUM = `// Numerada — rango con elipsis alrededor de la página actual
function pageRange(cur, total) {
  const out = [1];
  const lo = Math.max(2, cur - 1), hi = Math.min(total - 1, cur + 1);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

<nav className="flex items-center justify-center gap-1.5">
  <ArrowButton dir="prev" disabled={cur === 1} onClick={() => setCur(cur - 1)} />
  {pageRange(cur, total).map((p, i) =>
    p === "…"
      ? <Ellipsis key={i} />
      : <button key={p} onClick={() => setCur(p)}
          className={"grid size-9 place-items-center rounded-lg text-[13px] font-medium transition-colors " +
            (p === cur ? "bg-primary text-primary-foreground font-semibold"
                       : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>{p}</button>
  )}
  <ArrowButton dir="next" disabled={cur === total} onClick={() => setCur(cur + 1)} />
</nav>`;

const CODE_TABLE = `// Pie de tabla — tamaño de página + rango "desde–hasta de total"
const pages = Math.ceil(totalRows / size);
const from = (cur - 1) * size + 1, to = Math.min(cur * size, totalRows);

<span className="text-[12.5px] text-muted-foreground tabular-nums">
  <span className="font-mono text-foreground">{from}–{to}</span> de <span className="font-mono text-foreground">{totalRows}</span>
</span>`;

function PaginationSection() {
  return (
    <div>
      <SectionHead kicker="Navegación" title="Pagination" status="done"
        intro="Paginación para tablas y listados largos del operador. Numerada con elipsis para saltar lejos, prev/next minimal cuando solo importa avanzar, y el pie de tabla con rango “desde–hasta de total” y selector de filas por página. La página activa va en verde de marca." />

      <Variant title="Numerada"
        desc="Con elipsis alrededor de la página actual y primera/última siempre visibles. Pulsa un número o las flechas; el rango se recalcula."
        code={CODE_NUM}>
        <Numbered />
      </Variant>

      <Variant title="Prev / Next"
        desc="Minimal, para cuando solo se avanza secuencialmente. Las flechas se deshabilitan en los extremos.">
        <PrevNext />
      </Variant>

      <Variant title="Pie de tabla"
        desc="El patrón de un listado: filas por página a la izquierda, rango y navegación a la derecha. Cambiar el tamaño vuelve a la página 1."
        code={CODE_TABLE}>
        <TableFooter />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['pagination'] = PaginationSection;
})();
