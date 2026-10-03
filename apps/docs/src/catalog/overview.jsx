/* ============================================================================
   Gntik UI · overview.jsx — landing + live INVENTORY.
   Reads REGISTRY: overall progress, per-group breakdown (clickable) and how to adopt.
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
  const codeTw = `// tailwind.config.ts → maps each token to hsl(var(--token))\nconst hsl = (v) => \`hsl(var(\${v}) / <alpha-value>)\`;\nmodule.exports = {\n  darkMode: ["class", ".dark"],\n  theme: { extend: { colors: {\n    background: hsl("--background"), foreground: hsl("--foreground"),\n    card: { DEFAULT: hsl("--card"), foreground: hsl("--card-foreground") },\n    primary: { DEFAULT: hsl("--primary"), foreground: hsl("--primary-foreground") },\n    chrome: hsl("--chrome"), border: hsl("--border"), ring: hsl("--ring"),\n    success: hsl("--success"), warning: hsl("--warning"), info: hsl("--info"),\n  }}}},\n};`;

  return (
    <div>
      {/* Hero */}
      <div className="flex items-center gap-3 mb-6"><LogoMark s={40} /><span className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">Gntik UI · brand template</span></div>
      <h1 className="font-sans font-bold text-[2.75rem] leading-[1.05] tracking-tight text-foreground max-w-3xl" style={{ letterSpacing: '-0.035em' }}>
        The <span className="text-primary">gntik</span> design system, ready to clone.
      </h1>
      <p className="font-sans text-[16px] text-muted-foreground mt-5 max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
        Product-agnostic layout and styles — app shell + React + Tailwind components, on a single token layer.
        Every block ships an interactive preview and code to paste. Re-skinning a product = editing <code className="font-mono text-[14px] text-foreground">tokens/brand.css</code> and swapping the logo.
      </p>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-7 mt-10 flex flex-col sm:flex-row items-center gap-7">
        <Ring pct={pct} />
        <div className="flex-1 min-w-0 w-full">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-2">Template progress</div>
          <div className="font-sans text-[15px] text-foreground"><b className="text-[20px]">{c.done}</b> of {c.total} components done · {c.todo} to do</div>
          <div className="h-2.5 rounded-full bg-secondary mt-4 overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: `${(c.done / c.total) * 100}%` }} />
            <div className="h-full bg-warning" style={{ width: `${(c.wip / c.total) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Done · {c.done}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" />In progress · {c.wip}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/50" />To do · {c.todo}</span>
          </div>
        </div>
      </div>

      {/* Inventory by group */}
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mt-14 mb-5">Component inventory</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {REGISTRY.filter(g => !['Get started'].includes(g.group)).map(grp => {
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

      {/* Adopt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
        <div className="rounded-lg border border-border bg-card p-7">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-5">Adopt in a product</div>
          <div className="flex flex-col gap-5">
            {[['1', 'Import the tokens', codeCss, 'css'], ['2', 'Wire Tailwind to the tokens', codeTw, 'ts'], ['3', 'Enable the theme by class', `<html class="dark">   {/* or "" (light) · "high_contrast" */}`, 'html']].map(([n, t, code, lang]) => (
              <div key={n} className="flex gap-4">
                <span className="shrink-0 w-7 h-7 rounded-md bg-accent text-accent-foreground flex items-center justify-center font-mono text-[12px] font-semibold">{n}</span>
                <div className="min-w-0 flex-1 pt-0.5"><div className="font-sans font-semibold text-[14px] text-foreground">{t}</div><div className="mt-1.5"><CodeBlock code={code} lang={lang} /></div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-5">Brand rules (hard)</div>
          <ul className="flex flex-col gap-3.5">
            {['Dark is the primary surface; light derives from it; high_contrast is functional.',
              'Mono-brand: green (hue 145) is the only brand colour.',
              'Sober — no gradients, no glow; flat brand-tinted shadows.',
              'Primary is never confused with severity (red / amber / info-blue).',
              'The chrome (sidebar/topbar) uses --chrome: green-black in dark.',
              'HSL without hsl() in the variables → enables bg-primary/50 in Tailwind.'].map(x => (
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
