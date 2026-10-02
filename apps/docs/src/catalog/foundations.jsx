/* ============================================================================
   Gntik UI · foundations.jsx — color · tipografía · espaciado · radios ·
   sombras · iconos. Todo referencia tokens de tokens/brand.css.
   ============================================================================ */
(function () {
const { Card, SectionHead, Icon, CodeBlock, LogoMark, Wordmark, MusematicMark } = window;

const Block = ({ title, hint, children }) => (
  <div className="mb-14">
    <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-border">
      <h2 className="font-sans font-semibold text-[17px] text-foreground tracking-tight">{title}</h2>
      {hint && <span className="font-mono text-[11px] text-muted-foreground">{hint}</span>}
    </div>
    {children}
  </div>
);

const Swatch = ({ label, cls, cl, ring }) => (
  <div className="min-w-0">
    <div className={"h-16 rounded-md border " + (ring ? 'border-2 border-ring ' : 'border-border ') + cls} />
    <div className="font-sans text-[12.5px] text-foreground mt-2 font-medium truncate">{label}</div>
    <code className="font-mono text-[11px] text-muted-foreground block truncate">{cl}</code>
  </div>
);
const SwatchRow = ({ items }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-6">
    {items.map(([label, cls, cl, ring]) => <Swatch key={label} label={label} cls={cls} cl={cl} ring={ring} />)}
  </div>
);

function FoundationsSection() {
  const surface = [
    ['Background', 'bg-background', '--background'], ['Foreground', 'bg-foreground', '--foreground'],
    ['Card', 'bg-card', '--card'], ['Muted', 'bg-muted', '--muted'],
    ['Secondary', 'bg-secondary', '--secondary'], ['Accent', 'bg-accent', '--accent'],
    ['Border', 'bg-border', '--border'], ['Input', 'bg-input', '--input'],
    ['Chrome', 'bg-chrome', '--chrome'],
  ];
  const brand = [
    ['Primary', 'bg-primary', '--primary'], ['Primary fg', 'bg-primary-foreground', '--primary-foreground'],
    ['Accent fg', 'bg-accent-foreground', '--accent-foreground'],
    ['Brand secondary', 'bg-brand-secondary', '--brand-secondary'], ['Brand accent', 'bg-brand-accent', '--brand-accent'],
    ['Ring', 'bg-ring', '--ring', true],
  ];
  const status = [
    ['Success', 'bg-success', '--success'], ['Warning', 'bg-warning', '--warning'],
    ['Info', 'bg-info', '--info'], ['Destructive', 'bg-destructive', '--destructive'],
  ];
  const charts = [
    ['Rose', 'bg-category-rose', '--category-rose'], ['Violet', 'bg-category-violet', '--category-violet'],
    ['Amber', 'bg-category-amber', '--category-amber'], ['Cyan', 'bg-category-cyan', '--category-cyan'],
  ];

  const typeScale = [
    ['Display', 'text-[2.875rem] leading-[1.04] font-bold tracking-tight', '46 / 1.04 · -0.035em', 'text-[2.875rem]'],
    ['Heading 1', 'text-[1.875rem] leading-tight font-bold tracking-tight', '30 / 1.1 · -0.03em', 'text-[1.875rem]'],
    ['Heading 2', 'text-[1.5rem] leading-snug font-bold tracking-tight', '24 / 1.15 · -0.025em', 'text-2xl'],
    ['Heading 3', 'text-xl font-semibold', '20 / 1.2 · -0.015em', 'text-xl'],
    ['Body large', 'text-[1.0625rem] leading-relaxed', '17 / 1.5', 'text-[1.0625rem]'],
    ['Body', 'text-[0.9375rem] leading-relaxed', '15 / 1.55', 'text-[0.9375rem]'],
    ['Small', 'text-sm', '13 / 1.5', 'text-sm'],
  ];
  const spacing = [['1', 'w-1'], ['2', 'w-2'], ['3', 'w-3'], ['4', 'w-4'], ['6', 'w-6'], ['8', 'w-8'], ['12', 'w-12'], ['16', 'w-16'], ['18', 'w-18'], ['24', 'w-24']];
  const radii = [['sm', 'rounded-sm', '6px'], ['md', 'rounded-md', '8px'], ['lg', 'rounded-lg', '10px'], ['xl', 'rounded-xl', '16px'], ['full', 'rounded-full', '9999px']];
  const shadows = [['sm', 'shadow-sm'], ['md', 'shadow-md'], ['lg', 'shadow-lg']];
  const icons = ['home','chat','store','bot','book','net','flow','flask','line','coin','finger','activity','cog','fleet','audit','settings','bell','search','plus','minus','check','arrow','filter','sliders','chart','bolt','shield','chevron','chevronRight','dot3','spark','play','pause','x','info','alert','trash','download','upload','copy','external','calendar','user','users','grid','code','sun','moon','contrast','type','palette','box','layout','heading','list','table','form','compass','layers','flowGraph','database','toggle','creditcard','menu','inbox','logout','eye','refresh'];

  return (
    <div>
      <SectionHead kicker="Fundamentos" title="Foundations" status="done"
        intro="La base del sistema: color, tipografía, espaciado, radios y sombras — todo como token en tokens/brand.css. Cambia el bloque de marca y todo el catálogo se reskinea. Tres temas: light · dark · high_contrast." />

      <Block title="Marca / logo" hint="no recolorear · clear-space ≥ altura de la m">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center gap-4"><LogoMark s={72} /><code className="font-mono text-[11px] text-muted-foreground">Monograma · app icon</code></div>
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center gap-4"><Wordmark s={40} fs={26} /><code className="font-mono text-[11px] text-muted-foreground">Wordmark</code></div>
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center gap-4 text-foreground"><MusematicMark s={64} /><code className="font-mono text-[11px] text-muted-foreground">Símbolo · currentColor</code></div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {[['Noche', '#0C2017'], ['Verde', '#33CE73'], ['Crema', '#EEF1E6']].map(([n, hex]) => (
            <div key={hex} className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2">
              <span className="w-5 h-5 rounded border border-border" style={{ background: hex }} />
              <div className="leading-tight"><div className="font-sans text-[11.5px] text-foreground font-medium">{n}</div><code className="font-mono text-[10.5px] text-muted-foreground">{hex}</code></div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Color" hint="hsl(var(--token)) · soporta /opacidad">
        <div className="flex flex-col gap-8">
          <div><div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-3.5">Superficie & texto</div><SwatchRow items={surface} /></div>
          <div><div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-3.5">Marca (mono-brand · verde 145)</div><SwatchRow items={brand} /></div>
          <div><div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-3.5">Estado / semántico</div><SwatchRow items={status} /></div>
          <div><div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-3.5">Categórico (gráficas · tags)</div><SwatchRow items={charts} /></div>
        </div>
        <CodeBlock lang="tsx" code={`<div className="bg-card text-card-foreground border border-border" />\n<button className="bg-primary text-primary-foreground" />\n<span className="text-primary/70" />   {/* opacidad sobre token */}`} />
      </Block>

      <Block title="Tipografía" hint="Geist · 400 / 500 / 600 / 700">
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {typeScale.map(([name, cls, spec, tw]) => (
            <div key={name} className="flex items-center justify-between gap-6 px-6 py-4">
              <div className={"text-foreground min-w-0 truncate " + cls}>musematic</div>
              <div className="text-right shrink-0">
                <div className="font-sans text-[12.5px] text-foreground font-medium">{name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{spec}</div>
                <code className="font-mono text-[11px] text-primary">{tw}</code>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 px-6 py-4">
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-muted-foreground">tag · mono · label</div>
            <div className="text-right shrink-0"><div className="font-sans text-[12.5px] text-foreground font-medium">Mono / label</div><code className="font-mono text-[11px] text-primary">font-mono tracking-wider uppercase</code></div>
          </div>
        </div>
      </Block>

      <Block title="Espaciado" hint="escala Tailwind + 18 custom">
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-2.5">
          {spacing.map(([n, w]) => (
            <div key={n} className="flex items-center gap-4">
              <code className="font-mono text-[11.5px] text-muted-foreground w-8 shrink-0">{n}</code>
              <div className={"h-4 rounded-sm bg-primary " + w} />
              <code className="font-mono text-[11px] text-muted-foreground/70">{(parseInt(n) * 0.25).toString()}rem</code>
            </div>
          ))}
        </div>
      </Block>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Block title="Radios" hint="--radius: 0.625rem (sm/md/lg/xl)">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {radii.map(([n, cls, v]) => (
              <div key={n}>
                <div className={"h-20 bg-accent border border-border " + cls} />
                <div className="font-sans text-[12.5px] text-foreground mt-2 font-medium">{n} · {v}</div>
                <code className="font-mono text-[11px] text-muted-foreground">{cls}</code>
              </div>
            ))}
          </div>
        </Block>
        <Block title="Sombras" hint="planas · brand-tinted · sin glow">
          <div className="grid grid-cols-3 gap-4">
            {shadows.map(([n, cls]) => (
              <div key={n}>
                <div className={"h-20 rounded-lg bg-card border border-border/60 " + cls} />
                <div className="font-sans text-[12.5px] text-foreground mt-2 font-medium">{n}</div>
                <code className="font-mono text-[11px] text-muted-foreground">{cls}</code>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <Block title="Iconos" hint="stroke 1.7 · currentColor · 24px grid">
        <div className="rounded-lg border border-border bg-card p-5 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-x-3 gap-y-5">
          {icons.map(n => (
            <div key={n} className="flex flex-col items-center gap-2 text-foreground">
              <div className="w-11 h-11 rounded-md border border-border bg-background flex items-center justify-center"><Icon name={n} size={19} /></div>
              <code className="font-mono text-[10px] text-muted-foreground truncate w-full text-center">{n}</code>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS.foundations = FoundationsSection;
})();
