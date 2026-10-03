#!/usr/bin/env node
// @gntik-ai/tokens · export-tokens.mjs — brand.css (+ pairing.css, motion.css) → design-tool formats.
//
//   node scripts/export-tokens.mjs [outDir]     (default: dist/)
//
// Writes, with no dependencies:
//   tokens.json           W3C Design Tokens (DTCG 2025.10): colours per theme (HSL components + hex),
//                         pairing aliases as references, fontFamily, dimension, shadow, duration,
//                         cubicBezier.
//   figma-variables.json  Figma Variables REST payload (POST /v1/files/:key/variables): collection
//                         "gntik", modes dark · light · high_contrast, aliases as VARIABLE_ALIAS.
//   tokens.ts             typed constants (token names + per-theme hex), plus tokens.js/.d.ts.
// brand.css stays the single source of truth: nothing here defines a value.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = new URL('../src/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, SRC), 'utf8');

/** Theme ids, in the kit's order (dark is the default theme). CSS selector per theme. */
export const THEMES = /** @type {const} */ (['dark', 'light', 'high_contrast']);
const SELECTOR = { light: ':root', dark: '.dark', high_contrast: '.high_contrast' };
const ROOT_PX = 16;

/** Parses `selector { --x: v; }` blocks (top level only) into { selector: { '--x': 'v' } }. */
export function parseBlocks(text) {
  const out = {};
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /(?<=^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const vars = (out[m[1].trim()] ??= {});
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const key = decl.slice(0, i).trim();
      if (key.startsWith('--')) vars[key] = decl.slice(i + 1).trim();
    }
  }
  return out;
}

const HSL = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/;
const isColor = (v) => HSL.test(v);

/** HSL channels "145 61% 50%" → [r,g,b] in 0–1 (same maths as runtime tokenHex). */
export function hslToRgb(ch) {
  const [, h, s, l] = HSL.exec(ch).map(Number);
  const S = s / 100, L = l / 100, a = S * Math.min(L, 1 - L);
  const f = (n) => { const k = (n + h / 30) % 12; return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)];
}
const byte = (c) => Math.round(c * 255).toString(16).padStart(2, '0');
export const hex = (ch, alpha = 1) => '#' + hslToRgb(ch).map(byte).join('') + (alpha < 1 ? byte(alpha) : '');

/** "calc(var(--radius) - 4px)" | "0.625rem" | "var(--radius)" → px, resolved against `vars`. */
function toPx(v, vars) {
  const ref = /^var\((--[\w-]+)\)$/.exec(v);
  if (ref) return toPx(vars[ref[1]], vars);
  const calc = /^calc\(var\((--[\w-]+)\)\s*([+-])\s*([\d.]+)px\)$/.exec(v);
  if (calc) return toPx(vars[calc[1]], vars) + (calc[2] === '+' ? 1 : -1) * Number(calc[3]);
  const unit = /^([\d.]+)(px|rem)$/.exec(v);
  if (unit) return Number(unit[1]) * (unit[2] === 'rem' ? ROOT_PX : 1);
  throw new Error(`Cannot resolve dimension: ${v}`);
}
const dim = (v) => { const m = /^(-?[\d.]+)(px|rem)?$/.exec(v); return { value: Number(m[1]), unit: m[2] || 'px' }; };
const fontStack = (v) => v.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
const name = (k) => k.replace(/^--/, '');

/** "0 1px 2px -1px hsl(152 40% 4% / .16),0 …" → DTCG shadow layers. */
function shadowLayers(v) {
  return v.split(/,(?![^(]*\))/).map((layer) => {
    const m = /^(.*?)hsl\(([^/)]+?)(?:\s*\/\s*([\d.]+))?\)$/.exec(layer.trim());
    const [x, y, blur = '0', spread = '0'] = m[1].trim().split(/\s+/);
    const alpha = m[3] == null ? 1 : Number(m[3]);
    return { color: colorValue(m[2].trim(), alpha), offsetX: dim(x), offsetY: dim(y), blur: dim(blur), spread: dim(spread) };
  });
}
function colorValue(ch, alpha = 1) {
  const [, h, s, l] = HSL.exec(ch).map(Number);
  return { colorSpace: 'hsl', components: [h, s, l], alpha, hex: hex(ch) };
}
const ext = (cssVar, extra = {}) => ({ 'ai.gntik': { cssVar, ...extra } });

/** Reads the CSS sources into one resolved model shared by every output. */
export function readModel() {
  const brand = parseBlocks(read('brand.css'));
  const pairing = parseBlocks(read('pairing.css'));
  const motion = parseBlocks(read('motion.css'))[':root'];
  const root = brand[':root'];
  const themes = {};
  for (const t of THEMES) {
    const vars = { ...root, ...brand[SELECTOR[t]] };
    const aliases = { ...pairing[':root'], ...pairing[SELECTOR[t]] };
    themes[t] = {
      colors: Object.fromEntries(Object.entries(vars).filter(([, v]) => isColor(v))),
      aliases: Object.fromEntries(Object.entries(aliases).map(([k, v]) => [k, /^var\((--[\w-]+)\)$/.exec(v)[1]])),
      shadows: Object.fromEntries(Object.entries(vars).filter(([k]) => k.startsWith('--shadow-'))),
    };
  }
  const fonts = Object.fromEntries(Object.entries(root).filter(([k]) => k.startsWith('--font-')));
  const radii = Object.fromEntries(Object.entries(root).filter(([k]) => k.startsWith('--radius')).map(([k, v]) => [k, { css: v, px: toPx(v, root) }]));
  return { themes, fonts, radii, motion };
}

export function toDtcg(model) {
  const doc = {
    $description: 'gntik-ui brand tokens, generated from @gntik-ai/tokens/brand.css. Do not edit.',
    font: { $type: 'fontFamily' },
    radius: { $type: 'dimension' },
    duration: { $type: 'duration' },
    easing: { $type: 'cubicBezier' },
  };
  for (const [k, v] of Object.entries(model.fonts)) doc.font[name(k).replace('font-', '')] = { $value: fontStack(v), $extensions: ext(k) };
  for (const [k, { css, px }] of Object.entries(model.radii)) {
    const key = k === '--radius' ? 'base' : name(k).replace('radius-', '');
    const ref = /^var\(--radius\)$/.test(css);
    doc.radius[key] = { $value: ref ? '{radius.base}' : { value: px, unit: 'px' }, $extensions: ext(k, { css }) };
  }
  for (const [k, v] of Object.entries(model.motion)) {
    if (k.startsWith('--duration-')) doc.duration[name(k).replace('duration-', '')] = { $value: { value: parseFloat(v), unit: 'ms' }, $extensions: ext(k, { reducedMotion: { value: 0, unit: 'ms' } }) };
    else if (k.startsWith('--ease-')) doc.easing[name(k).replace('ease-', '')] = { $value: v.match(/[\d.]+/g).map(Number), $extensions: ext(k) };
  }
  for (const t of THEMES) {
    const { colors, aliases, shadows } = model.themes[t];
    const color = { $type: 'color' };
    for (const [k, v] of Object.entries(colors)) color[name(k)] = { $value: colorValue(v), $extensions: ext(k) };
    for (const [k, target] of Object.entries(aliases)) color[name(k)] = { $value: `{${t}.color.${name(target)}}`, $extensions: ext(k, { alias: true }) };
    const shadow = { $type: 'shadow' };
    for (const [k, v] of Object.entries(shadows)) shadow[name(k).replace('shadow-', '')] = { $value: shadowLayers(v), $extensions: ext(k) };
    doc[t] = { $description: `Theme "${t}" (${SELECTOR[t]})`, color, shadow };
  }
  return doc;
}

export function toFigma(model) {
  const collectionId = 'collection_gntik';
  const modeId = (t) => `mode_${t}`;
  const varId = (k) => `var_${name(k)}`;
  const payload = {
    variableCollections: [{ action: 'CREATE', id: collectionId, name: 'gntik', initialModeId: modeId(THEMES[0]) }],
    variableModes: THEMES.map((t, i) => (i === 0
      ? { action: 'UPDATE', id: modeId(t), name: t, variableCollectionId: collectionId }
      : { action: 'CREATE', id: modeId(t), name: t, variableCollectionId: collectionId })),
    variables: [],
    variableModeValues: [],
  };
  const addVar = (k, figmaName, resolvedType, scopes, codeSyntax) =>
    payload.variables.push({ action: 'CREATE', id: varId(k), name: figmaName, variableCollectionId: collectionId, resolvedType, scopes, codeSyntax: { WEB: codeSyntax } });
  const setValue = (k, t, value) => payload.variableModeValues.push({ variableId: varId(k), modeId: modeId(t), value });
  const alias = (k) => ({ type: 'VARIABLE_ALIAS', id: varId(k) });

  const first = model.themes[THEMES[0]];
  for (const k of Object.keys(first.colors)) addVar(k, `color/${name(k)}`, 'COLOR', ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'], `hsl(var(${k}))`);
  for (const k of Object.keys(first.aliases)) addVar(k, `color/${name(k)}`, 'COLOR', ['TEXT_FILL', 'STROKE_COLOR'], `hsl(var(${k}))`);
  for (const t of THEMES) {
    for (const [k, v] of Object.entries(model.themes[t].colors)) { const [r, g, b] = hslToRgb(v); setValue(k, t, { r, g, b, a: 1 }); }
    for (const [k, target] of Object.entries(model.themes[t].aliases)) setValue(k, t, alias(target));
  }
  for (const [k, { css, px }] of Object.entries(model.radii)) {
    addVar(k, `radius/${k === '--radius' ? 'base' : name(k).replace('radius-', '')}`, 'FLOAT', ['CORNER_RADIUS'], `var(${k})`);
    for (const t of THEMES) setValue(k, t, css === 'var(--radius)' ? alias('--radius') : px);
  }
  for (const [k, v] of Object.entries(model.fonts)) {
    addVar(k, `font/${name(k).replace('font-', '')}`, 'STRING', ['FONT_FAMILY'], `var(${k})`);
    for (const t of THEMES) setValue(k, t, fontStack(v)[0]);
  }
  for (const [k, v] of Object.entries(model.motion)) {
    if (!k.startsWith('--duration-')) continue; // Figma variables have no easing type
    addVar(k, `motion/${name(k)}`, 'FLOAT', [], `var(${k})`);
    for (const t of THEMES) setValue(k, t, parseFloat(v));
  }
  return payload; // Shadows have no Figma variable type: publish them as effect styles from tokens.json.
}

export function toTs(model) {
  const colorNames = [...Object.keys(model.themes.dark.colors), ...Object.keys(model.themes.dark.aliases)].map(name);
  const hexes = Object.fromEntries(THEMES.map((t) => {
    const { colors, aliases } = model.themes[t];
    const map = Object.fromEntries(Object.entries(colors).map(([k, v]) => [name(k), hex(v)]));
    for (const [k, target] of Object.entries(aliases)) map[name(k)] = hex(colors[target]);
    return [t, map];
  }));
  const radius = Object.fromEntries(Object.entries(model.radii).map(([k, { px }]) => [k === '--radius' ? 'base' : name(k).replace('radius-', ''), px]));
  const fonts = Object.fromEntries(Object.entries(model.fonts).map(([k, v]) => [name(k).replace('font-', ''), v]));
  const shadows = Object.fromEntries(THEMES.map((t) => [t, Object.fromEntries(Object.entries(model.themes[t].shadows).map(([k, v]) => [name(k).replace('shadow-', ''), v]))]));
  const motion = Object.fromEntries(Object.entries(model.motion).map(([k, v]) => [name(k), v]));
  const j = (v) => JSON.stringify(v, null, 2);
  const body = (ts) => `// Generated by @gntik-ai/tokens/scripts/export-tokens.mjs from brand.css. Do not edit.
export const themes = ${j(THEMES)}${ts ? ' as const' : ''};
export const colorTokens = ${j(colorNames)}${ts ? ' as const' : ''};
${ts ? `export type Theme = (typeof themes)[number];
export type ColorToken = (typeof colorTokens)[number];
` : ''}/** sRGB hex per theme (aliases resolved). Prefer CSS classes; use these for canvas/SVG/design tools. */
export const colors${ts ? ': Record<Theme, Record<ColorToken, string>>' : ''} = ${j(hexes)};
/** CSS custom property for a token: cssVar('primary') → "--primary". */
export const cssVar = (token${ts ? ': ColorToken' : ''}) => \`--\${token}\`;
/** Radii in px (16px root). */
export const radius = ${j(radius)}${ts ? ' as const' : ''};
export const fonts = ${j(fonts)}${ts ? ' as const' : ''};
/** CSS box-shadow value per theme. */
export const shadows = ${j(shadows)}${ts ? ' as const' : ''};
/** Motion tokens (durations collapse to 0ms under prefers-reduced-motion in CSS). */
export const motion = ${j(motion)}${ts ? ' as const' : ''};
`;
  const dts = `// Generated by @gntik-ai/tokens/scripts/export-tokens.mjs. Do not edit.
export declare const themes: readonly ${j(THEMES).replace(/\n\s*/g, ' ')};
export type Theme = (typeof themes)[number];
export declare const colorTokens: readonly [${colorNames.map((n) => `"${n}"`).join(', ')}];
export type ColorToken = (typeof colorTokens)[number];
export declare const colors: Record<Theme, Record<ColorToken, string>>;
export declare const cssVar: (token: ColorToken) => string;
export declare const radius: Readonly<Record<${Object.keys(radius).map((k) => `"${k}"`).join(' | ')}, number>>;
export declare const fonts: Readonly<Record<${Object.keys(fonts).map((k) => `"${k}"`).join(' | ')}, string>>;
export declare const shadows: Readonly<Record<Theme, Readonly<Record<${Object.keys(shadows.dark).map((k) => `"${k}"`).join(' | ')}, string>>>>;
export declare const motion: Readonly<Record<${Object.keys(motion).map((k) => `"${k}"`).join(' | ')}, string>>;
`;
  return { ts: body(true), js: body(false), dts };
}

export function exportTokens(outDir) {
  const model = readModel();
  fs.mkdirSync(outDir, { recursive: true });
  const { ts, js, dts } = toTs(model);
  const files = {
    'tokens.json': JSON.stringify(toDtcg(model), null, 2) + '\n',
    'figma-variables.json': JSON.stringify(toFigma(model), null, 2) + '\n',
    'tokens.ts': ts,
    'tokens.js': js,
    'tokens.d.ts': dts,
  };
  for (const [f, content] of Object.entries(files)) fs.writeFileSync(path.join(outDir, f), content);
  return Object.keys(files).map((f) => path.join(outDir, f));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.resolve(process.argv[2] ?? fileURLToPath(new URL('../dist/', import.meta.url)));
  for (const f of exportTokens(out)) console.log('wrote', path.relative(process.cwd(), f));
}
