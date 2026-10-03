/* ============================================================================
   Gntik UI · theme-builder.jsx — brand preset builder.
   A product name + an SVG mark → a BrandPreset module (packages/ui/src/theme/
   presets.tsx shape). Previews the mark as Logo + wordmark in the three themes
   and in a mini console, checks its contrast against the chrome and background
   tokens, and exports the preset. Colours are frozen: it never edits a token.
   ============================================================================ */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Field, FieldDescription, FieldLabel, Input, LinkProvider, Logo, Textarea, Toggle, ToggleGroup } from '@gntik-ai/ui';
import { AppSidebarNav, KPI_ITEMS, KpiRow } from '@gntik-ai/blocks';
import { Download, Upload } from '@gntik-ai/icons';
import brandCss from '../../../../packages/tokens/src/brand.css?raw';
import pairingCss from '../../../../packages/tokens/src/pairing.css?raw';

const { SectionHead, CodeBlock } = window;

const THEME_LIST = [['dark', 'Dark'], ['light', 'Light'], ['high_contrast', 'High contrast']];
const MAX_SVG_BYTES = 200 * 1024;

/* ── Tokens: read the frozen values per theme (never written) ─────────────── */
function parseBlocks(css) {
  const out = { root: {}, dark: {}, high_contrast: {} };
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, sel, body] of clean.matchAll(/(:root|\.dark|\.high_contrast)\s*\{([^}]*)\}/g)) {
    const key = sel === ':root' ? 'root' : sel.slice(1);
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[key][name] = value.trim();
  }
  return out;
}
const BRAND = parseBlocks(brandCss);
const PAIRING = parseBlocks(pairingCss);
/** Every custom property of a theme, resolved root → theme. Applied inline, it scopes a subtree to that theme. */
const THEME_VARS = Object.fromEntries(THEME_LIST.map(([t]) => [t, {
  ...BRAND.root, ...PAIRING.root,
  ...(t === 'light' ? {} : { ...BRAND[t], ...PAIRING[t] }),
}]));
const themeStyle = (t) => ({ ...THEME_VARS[t], colorScheme: t === 'light' ? 'light' : 'dark' });

function hslToRgb(channels) {
  const [h = 0, s = 0, l = 0] = (channels || '').split(/\s+/).map((x) => parseFloat(x) || 0);
  const S = s / 100, L = l / 100, a = S * Math.min(L, 1 - L);
  const f = (n) => { const k = (n + h / 30) % 12; return Math.round((L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255); };
  return [f(0), f(8), f(4)];
}
const luminance = ([r, g, b]) => {
  const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

/* ── SVG: sanitise (no scripts, handlers, foreign content, external refs) ─── */
const BLOCKED = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video', 'canvas', 'set', 'animate', 'animatemotion', 'animatetransform', 'handler', 'listener']);
const SAFE_REF = /^(#|data:image\/(png|jpe?g|gif|webp);)/i;

function sanitizeSvg(text) {
  if (!text.trim()) return { error: 'Paste an SVG or upload a file.' };
  if (new Blob([text]).size > MAX_SVG_BYTES) return { error: 'The SVG is larger than 200 KB. Export a simplified mark.' };
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  if (doc.getElementsByTagName('parsererror').length || svg.localName !== 'svg') return { error: 'This is not valid SVG markup (the root element must be <svg>).' };
  const removed = { elements: 0, handlers: 0, links: 0 };
  for (const el of [...svg.querySelectorAll('*')]) {
    const name = el.localName.toLowerCase();
    if (BLOCKED.has(name)) { el.remove(); removed.elements++; continue; }
    if (name === 'a') { el.replaceWith(...el.childNodes); removed.links++; continue; }
    if (name === 'style' && /@import|url\(\s*['"]?(?!#)/i.test(el.textContent)) { el.remove(); removed.elements++; }
  }
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    for (const attr of [...el.attributes]) {
      const n = attr.name.toLowerCase(), v = attr.value;
      if (n.startsWith('on')) { el.removeAttribute(attr.name); removed.handlers++; }
      else if ((n === 'href' || n.endsWith(':href') || n === 'src') && !SAFE_REF.test(v.trim())) { el.removeAttribute(attr.name); removed.links++; }
      else if (/javascript:|url\(\s*['"]?(?!#)/i.test(v)) { el.removeAttribute(attr.name); removed.links++; }
    }
  }
  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
    if (w > 0 && h > 0) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const [, , vw, vh] = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  const markup = new XMLSerializer().serializeToString(svg);
  const bytes = new TextEncoder().encode(markup);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { markup, src: 'data:image/svg+xml;base64,' + btoa(bin), removed, square: !(vw && vh) || Math.abs(vw / vh - 1) < 0.05 };
}

/** Sample artwork: the neutral monogram drawn with the dark theme's own token values. */
function sampleMark() {
  const d = THEME_VARS.dark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="hsl(${d['--chrome']})"/>
  <path d="M20 44V20l24 24V20" fill="none" stroke="hsl(${d['--primary']})" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/* ── Contrast: rasterise the mark, weigh its colours by coverage ──────────── */
function useMarkColours(src) {
  const [result, setResult] = useState({ src: null, colours: [] });
  useEffect(() => {
    if (!src) return undefined;
    let alive = true;
    const img = new Image();
    img.onload = () => {
      const size = 64, canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      let data;
      try { data = ctx.getImageData(0, 0, size, size).data; } catch { return; }
      const bins = new Map();
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 160) continue;
        total++;
        const key = [data[i], data[i + 1], data[i + 2]].map((v) => Math.round(v / 24) * 24).join(',');
        const bin = bins.get(key) || { n: 0, sum: [0, 0, 0] };
        bin.n++; bin.sum[0] += data[i]; bin.sum[1] += data[i + 1]; bin.sum[2] += data[i + 2];
        bins.set(key, bin);
      }
      const colours = [...bins.values()]
        .map(({ n, sum }) => ({ rgb: sum.map((v) => Math.round(v / n)), share: n / Math.max(total, 1) }))
        .filter((c) => c.share >= 0.05)
        .sort((a, b) => b.share - a.share)
        .slice(0, 4);
      if (alive) setResult({ src, colours });
    };
    img.src = src;
    return () => { alive = false; };
  }, [src]);
  return result.src === src ? result.colours : [];
}

function ContrastTable({ colours }) {
  const rows = THEME_LIST.flatMap(([t, label]) => ['--chrome', '--background'].map((token) => {
    const surface = hslToRgb(THEME_VARS[t][token]);
    const best = Math.max(0, ...colours.map((c) => contrast(c.rgb, surface)));
    return { key: t + token, label, token, best };
  }));
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-[12.5px]">
        <caption className="sr-only">Contrast of the mark against the shell surfaces</caption>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">Theme</th>
            <th scope="col" className="px-3 py-2 font-medium">Surface token</th>
            <th scope="col" className="px-3 py-2 font-medium">Best contrast</th>
            <th scope="col" className="px-3 py-2 font-medium">Non-text 3:1</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-2 text-foreground">{r.label}</td>
              <td className="px-3 py-2 font-mono text-[11.5px] text-muted-foreground">{r.token}</td>
              <td className="px-3 py-2 font-mono tabular-nums text-foreground">{colours.length ? r.best.toFixed(2) + ':1' : '…'}</td>
              <td className="px-3 py-2">
                {colours.length > 0 && (r.best >= 3
                  ? <Badge tone="success" dot>Passes</Badge>
                  : <Badge tone="warning" dot>Low contrast</Badge>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Export: the BrandPreset module ───────────────────────────────────────── */
const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
const camel = (s) => slug(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^(\d)/, '_$1');

function presetModule(name, src) {
  const id = slug(name);
  return `import type { BrandPreset } from '@gntik-ai/ui';

/** ${name} mark (sanitised SVG). Artwork is the one place literal colours live. */
const MARK_SRC =
  '${src}';

/**
 * ${name} — brand preset: name and logo only. Colours are the frozen tokens of
 * @gntik-ai/tokens, the same for every product.
 */
export const ${camel(name)}Preset: BrandPreset = {
  id: '${id}',
  name: ${JSON.stringify(name.trim() || 'Product')},
  mark: (size) => (
    <img src={MARK_SRC} width={size} height={size} alt="" aria-hidden="true" draggable={false} className="block shrink-0" />
  ),
};
`;
}

/* ── Previews ─────────────────────────────────────────────────────────────── */
function InertLink(props) {
  return <a {...props} onClick={(e) => { props.onClick?.(e); e.preventDefault(); }} />;
}

function ThemePanel({ theme, label, preset }) {
  return (
    <div style={themeStyle(theme)} className="overflow-hidden rounded-lg border border-border bg-background text-foreground">
      <div className="flex h-11 items-center justify-between gap-3 border-b border-border bg-chrome px-3">
        <Logo brand={preset} size={22} wordmark />
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end gap-5 px-4 py-5">
        <Logo brand={preset} size={40} wordmark />
        <Logo brand={preset} size={28} />
        <Logo brand={preset} size={20} />
      </div>
    </div>
  );
}

function MiniConsole({ theme, preset }) {
  const [href, setHref] = useState('/projects');
  return (
    <LinkProvider component={InertLink}>
      <div style={themeStyle(theme)} className="flex h-[340px] overflow-hidden rounded-lg border border-border bg-background text-foreground">
        <div className="flex w-52 shrink-0 flex-col gap-3 border-r border-border bg-chrome p-3 max-sm:hidden">
          <Logo brand={preset} size={24} wordmark className="px-1" />
          <AppSidebarNav currentHref={href} onNavigate={(item) => item.href && setHref(item.href)} label="Preview navigation" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-border bg-chrome px-4">
            <span className="sm:hidden"><Logo brand={preset} size={22} /></span>
            <span className="text-[12.5px] text-muted-foreground">Projects</span>
            <span className="text-[12.5px] text-muted-foreground">/</span>
            <span className="text-[12.5px] font-medium text-foreground">acme-web</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-4">
            <KpiRow variant="strip" items={KPI_ITEMS.slice(0, 3)} showTrends={false} label="Preview metrics" />
          </div>
        </div>
      </div>
    </LinkProvider>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
function ThemeBuilderSection() {
  const ids = useId();
  const fileInput = useRef(null);
  const [name, setName] = useState('Acme Cloud');
  const [svgText, setSvgText] = useState(sampleMark);
  const [consoleTheme, setConsoleTheme] = useState('dark');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => sanitizeSvg(svgText), [svgText]);
  const shown = result.error ? null : result;
  const colours = useMarkColours(shown?.src);

  const productName = name.trim() || 'Product';
  const preset = useMemo(() => shown && ({
    id: slug(productName),
    name: productName,
    mark: (size) => <img src={shown.src} width={size} height={size} alt="" aria-hidden="true" draggable={false} className="block shrink-0" />,
  }), [shown, productName]);
  const moduleCode = shown ? presetModule(productName, shown.src) : '';
  const fileName = `${slug(productName)}-preset.tsx`;

  const readFile = (file) => {
    if (!file) return;
    if (file.size > MAX_SVG_BYTES) { setSvgText(''); return; }
    file.text().then(setSvgText);
  };
  const copy = () => navigator.clipboard.writeText(moduleCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }, () => {});
  const download = () => {
    const url = URL.createObjectURL(new Blob([moduleCode], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const removedTotal = shown ? shown.removed.elements + shown.removed.handlers + shown.removed.links : 0;

  return (
    <div>
      <SectionHead kicker="Brand" title="Theme builder" status="done"
        intro="Turn a product name and an SVG mark into a BrandPreset for ThemeProvider. Preview it in the three themes and in a console frame, check its contrast against the shell surfaces, then export the module." />

      <Alert tone="info" role="note" className="mb-8 max-w-3xl" title="Colours are frozen"
        description="Presets change only the name and the logo. Every product renders the same token values from @gntik-ai/tokens, so this builder never edits a colour; if the mark has low contrast, adjust the artwork, not the tokens." />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <Field>
            <FieldLabel>Product name</FieldLabel>
            <Input value={name} onValueChange={setName} maxLength={40} />
            <FieldDescription>Wordmark and the logo’s accessible name. Preset id: <code className="font-mono text-[12px] text-foreground">{slug(productName)}</code></FieldDescription>
          </Field>
          <Field invalid={Boolean(result.error)}>
            <FieldLabel>SVG mark</FieldLabel>
            <Textarea value={svgText} onChange={(e) => setSvgText(e.target.value)} rows={9} spellCheck={false}
              aria-describedby={ids + '-svg-help'}
              className="font-mono text-[11.5px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); readFile(e.dataTransfer.files[0]); }} />
            <p id={ids + '-svg-help'} className="text-[12px] leading-5 text-muted-foreground">
              Paste markup, drop a file or upload one. Square artwork (viewBox) reads best. Scripts, event handlers, foreign objects and external links are stripped; the mark renders as an image, never as live markup.
            </p>
          </Field>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileInput.current?.click()}>Upload SVG</Button>
            <Button variant="ghost" size="sm" onClick={() => setSvgText(sampleMark())}>Use sample</Button>
            <input ref={fileInput} type="file" accept=".svg,image/svg+xml" className="sr-only" tabIndex={-1} aria-hidden="true"
              onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          <div className="grid gap-2">
            {result.error && <Alert tone="destructive" title="Can’t use this SVG" description={result.error} />}
            {shown && removedTotal > 0 && (
              <Alert tone="warning" title="Unsafe content removed"
                description={`${shown.removed.elements} element(s), ${shown.removed.handlers} event handler(s) and ${shown.removed.links} link(s) were stripped.`} />
            )}
            {shown && !shown.square && <Alert tone="warning" title="The mark isn’t square" description="It renders in a square box, so it will be letterboxed. Crop the viewBox to a square." />}
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          {preset ? (
            <>
              <div className="grid gap-3 lg:grid-cols-3">
                {THEME_LIST.map(([t, label]) => <ThemePanel key={t} theme={t} label={label} preset={preset} />)}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[14px] font-semibold text-foreground">In the console</h2>
                  <ToggleGroup aria-label="Console theme" size="sm" value={[consoleTheme]} onValueChange={(v) => v[0] && setConsoleTheme(v[0])}>
                    {THEME_LIST.map(([t, label]) => <Toggle key={t} value={t}>{label}</Toggle>)}
                  </ToggleGroup>
                </div>
                <MiniConsole theme={consoleTheme} preset={preset} />
              </div>
              <div>
                <h2 className="mb-1 text-[14px] font-semibold text-foreground">Contrast</h2>
                <p className="mb-3 max-w-2xl text-[12.5px] leading-5 text-muted-foreground">
                  The mark’s main colours (each ≥ 5% of its area) against the chrome (sidebar, topbar) and background tokens. A logo needs at least one substantial part at 3:1 (WCAG 1.4.11) to stay recognisable.
                </p>
                <ContrastTable colours={colours} />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[14px] font-semibold text-foreground">Export · <span className="font-mono text-[12.5px] font-normal text-muted-foreground">{fileName}</span></h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={copy}>{copied ? 'Copied' : 'Copy module'}</Button>
                    <Button size="sm" icon={Download} onClick={download}>Download</Button>
                  </div>
                </div>
                <CodeBlock code={moduleCode} open />
                <p className="mt-3 text-[12.5px] leading-5 text-muted-foreground">
                  Use it with <code className="font-mono text-[12px] text-foreground">{`<ThemeProvider brand={${camel(productName)}Preset}>`}</code>; <code className="font-mono text-[12px] text-foreground">Logo</code>, the sidebar and the auth pages pick it up.
                </p>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">Add a valid SVG mark to see the previews.</p>
          )}
        </div>
      </div>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['theme-builder'] = ThemeBuilderSection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
