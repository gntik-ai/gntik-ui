/* ============================================================================
   Gntik UI · overview.jsx — landing + INVENTARIO vivo.
   Lee REGISTRY: progreso global, desglose por grupo (clicable) y cómo adoptar.
   ============================================================================ */
(function () {
const { Icon, LogoMark, CodeBlock, StatusTag, REGISTRY, regCounts } = window;
const go = (id) => window.__goto && window.__goto(id);

function Ring({ pct, size = 116 }) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="9" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-sans font-bold" style={{ fontSize: 26 }}>{pct}%</text>
    </svg>
  );
}

function OverviewSection() {
  const c = regCounts();
  const pct = Math.round((c.done / c.total) * 100);
  const codeCss = `/* globals.css */\n@import "./tokens/brand.css";   /* :root · .dark · .high_contrast */`;
  const codeTw = `// tailwind.config.ts → mapea cada token a hsl(var(--token))\nconst hsl = (v) => \`hsl(var(\${v}) / <alpha-value>)\`;\nmodule.exports = {\n  darkMode: ["class", ".dark"],\n  theme: { extend: { colors: {\n    background: hsl("--background"), foreground: hsl("--foreground"),\n    card: { DEFAULT: hsl("--card"), foreground: hsl("--card-foreground") },\n    primary: { DEFAULT: hsl("--primary"), foreground: hsl("--primary-foreground") },\n    chrome: hsl("--chrome"), border: hsl("--border"), ring: hsl("--ring"),\n    success: hsl("--success"), warning: hsl("--warning"), info: hsl("--info"),\n  }}}},\n};`;

  return (
    <div>
      {/* Hero */}
      <div className="flex items-center gap-3 mb-6"><LogoMark s={40} /><span className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">Gntik UI · template de marca</span></div>
      <h1 className="font-sans font-bold text-[2.75rem] leading-[1.05] tracking-tight text-foreground max-w-3xl" style={{ letterSpacing: '-0.035em' }}>
        La template de <span className="text-primary">musematic</span>, lista para clonar.
      </h1>
      <p className="font-sans text-[16px] text-muted-foreground mt-5 max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
        Layout y estilos extraídos de la app — app-shell + componentes en React + Tailwind, sobre una única capa de tokens.
        Cada bloque trae su preview interactivo y su código para pegar. Re-skinear un producto = editar <code className="font-mono text-[14px] text-foreground">tokens/brand.css</code> y cambiar el logo.
      </p>

      {/* Progreso */}
      <div className="rounded-xl border border-border bg-card p-7 mt-10 flex flex-col sm:flex-row items-center gap-7">
        <Ring pct={pct} />
        <div className="flex-1 min-w-0 w-full">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-2">Progreso de la template</div>
          <div className="font-sans text-[15px] text-foreground"><b className="text-[20px]">{c.done}</b> de {c.total} componentes listos · {c.todo} pendientes</div>
          <div className="h-2.5 rounded-full bg-secondary mt-4 overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: `${(c.done / c.total) * 100}%` }} />
            <div className="h-full bg-warning" style={{ width: `${(c.wip / c.total) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Listo · {c.done}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" />En curso · {c.wip}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/50" />Pendiente · {c.todo}</span>
          </div>
        </div>
      </div>

      {/* Inventario por grupo */}
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mt-14 mb-5">Inventario de componentes</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {REGISTRY.filter(g => !['Empezar'].includes(g.group)).map(grp => {
          const done = grp.items.filter(i => i.status === 'done').length;
          return (
            <div key={grp.group} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 h-12 border-b border-border/70">
                <span className="w-7 h-7 rounded-md bg-accent text-accent-foreground flex items-center justify-center"><Icon name={grp.icon} size={15} /></span>
                <span className="font-sans font-semibold text-[13.5px] text-foreground">{grp.group}</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">{done}/{grp.items.length}</span>
              </div>
              <div className="divide-y divide-border/60">
                {grp.items.map(it => (
                  <button key={it.id} onClick={() => go(it.id)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-secondary/50 transition-colors group">
                    <Icon name={it.icon} size={15} className="text-muted-foreground shrink-0" />
                    <span className="font-sans text-[13px] text-foreground truncate group-hover:text-primary transition-colors">{it.label}</span>
                    <span className="ml-auto shrink-0"><StatusTag status={it.status} /></span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adoptar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
        <div className="rounded-lg border border-border bg-card p-7">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-5">Adoptar en un producto</div>
          <div className="flex flex-col gap-5">
            {[['1', 'Importa los tokens', codeCss, 'css'], ['2', 'Conecta Tailwind a los tokens', codeTw, 'ts'], ['3', 'Activa el tema por clase', `<html class="dark">   {/* o "" (light) · "high_contrast" */}`, 'html']].map(([n, t, code, lang]) => (
              <div key={n} className="flex gap-4">
                <span className="shrink-0 w-7 h-7 rounded-md bg-accent text-accent-foreground flex items-center justify-center font-mono text-[12px] font-semibold">{n}</span>
                <div className="min-w-0 flex-1 pt-0.5"><div className="font-sans font-semibold text-[14px] text-foreground">{t}</div><div className="mt-1.5"><CodeBlock code={code} lang={lang} /></div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-5">Reglas de marca (duras)</div>
          <ul className="flex flex-col gap-3.5">
            {['Dark es la superficie principal; light deriva; high_contrast es funcional.',
              'Mono-brand: el verde (hue 145) es el único color de marca.',
              'Sobrio — sin degradados, sin glow; sombras planas brand-tinted.',
              'El primario no se confunde con severidad (rojo / ámbar / azul-info).',
              'El chrome (sidebar/topbar) usa --chrome: negro-verde en dark.',
              'HSL sin hsl() en las variables → habilita bg-primary/50 en Tailwind.'].map(x => (
              <li key={x} className="flex gap-3 font-sans text-[13.5px] text-muted-foreground leading-snug"><Icon name="check" size={16} className="text-primary shrink-0 mt-0.5" />{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS.overview = OverviewSection;
})();
