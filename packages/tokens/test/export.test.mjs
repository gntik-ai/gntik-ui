// Token export pipeline (scripts/export-tokens.mjs): every output must round-trip to brand.css,
// and the export must never touch the frozen source values.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { exportTokens, parseBlocks, hslToRgb, THEMES } from '../scripts/export-tokens.mjs';

const brandUrl = new URL('../src/brand.css', import.meta.url);
const brand = parseBlocks(fs.readFileSync(brandUrl, 'utf8'));
const pairing = parseBlocks(fs.readFileSync(new URL('../src/pairing.css', import.meta.url), 'utf8'));
const frozen = JSON.parse(fs.readFileSync(new URL('./frozen-values.json', import.meta.url), 'utf8'));
const SELECTOR = { light: ':root', dark: '.dark', high_contrast: '.high_contrast' };
const HSL = /^[\d.]+\s+[\d.]+%\s+[\d.]+%$/;
const vars = (t) => ({ ...brand[':root'], ...brand[SELECTOR[t]] });

const before = fs.readFileSync(brandUrl, 'utf8');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gntik-tokens-'));
exportTokens(out);
const json = (f) => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
const dtcg = json('tokens.json');
const figma = json('figma-variables.json');

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const close = (a, b, msg) => a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) <= 0.5 / 255 + 1e-9, msg));

test('export leaves brand.css byte-identical and the frozen snapshot intact', () => {
  assert.equal(fs.readFileSync(brandUrl, 'utf8'), before);
  for (const sel of Object.keys(frozen)) assert.deepEqual(brand[sel], frozen[sel]);
});

test('export identifies an unsupported typography declaration', (t) => {
  const readFileSync = fs.readFileSync;
  t.mock.method(fs, 'readFileSync', (file, ...options) => {
    const content = readFileSync(file, ...options);
    return String(file).endsWith('/src/typography.css')
      ? content.replace(':root {', ':root { --type-unrecognised: 1;')
      : content;
  });
  assert.throws(() => exportTokens(out), /Unknown typography variable: --type-unrecognised/);
});

test('tokens.json colours round-trip to brand.css in every theme (HSL exact, hex within rounding)', () => {
  for (const t of THEMES) {
    const colours = Object.entries(vars(t)).filter(([, v]) => HSL.test(v));
    assert.ok(colours.length > 20);
    for (const [k, v] of colours) {
      const tok = dtcg[t].color[k.slice(2)];
      assert.ok(tok, `${t} ${k} missing`);
      assert.equal(dtcg[t].color.$type, 'color');
      assert.deepEqual(tok.$value.components, v.split(/\s+/).map(parseFloat), `${t} ${k} components`);
      assert.match(tok.$value.hex, /^#[0-9a-f]{6}$/);
      close(hexToRgb(tok.$value.hex), hslToRgb(v), `${t} ${k} hex`);
    }
  }
});

test('pairing aliases are DTCG references to existing tokens of the same theme', () => {
  for (const t of THEMES) {
    const aliases = { ...pairing[':root'], ...pairing[SELECTOR[t]] };
    for (const [k, v] of Object.entries(aliases)) {
      const target = /var\(--([\w-]+)\)/.exec(v)[1];
      assert.equal(dtcg[t].color[k.slice(2)].$value, `{${t}.color.${target}}`);
      assert.ok(dtcg[t].color[target].$value.hex, `${t} ${k} → ${target} must resolve`);
    }
  }
});

test('typography, radius, shadow and motion use DTCG types', () => {
  assert.equal(dtcg.font.$type, 'fontFamily');
  assert.equal(dtcg.font.sans.$value[0], 'Geist');
  assert.equal(dtcg.font.mono.$value[0], 'Geist Mono');
  assert.equal(dtcg.radius.$type, 'dimension');
  assert.deepEqual(dtcg.radius.base.$value, { value: 10, unit: 'px' });
  assert.deepEqual(dtcg.radius.sm.$value, { value: 6, unit: 'px' });
  assert.equal(dtcg.radius.lg.$value, '{radius.base}');
  assert.equal(dtcg.duration.$type, 'duration');
  assert.equal(dtcg.easing.$type, 'cubicBezier');
  for (const e of ['standard', 'emphasized', 'exit']) assert.equal(dtcg.easing[e].$value.length, 4);
  for (const t of THEMES) {
    assert.equal(dtcg[t].shadow.$type, 'shadow');
    for (const s of ['sm', 'md', 'lg']) {
      for (const layer of dtcg[t].shadow[s].$value) {
        assert.ok(layer.color.alpha > 0 && layer.color.alpha <= 1);
        for (const d of ['offsetX', 'offsetY', 'blur', 'spread']) assert.equal(layer[d].unit, 'px');
      }
    }
  }
});

test('figma-variables.json: one "gntik" collection, three modes, values and aliases for every variable', () => {
  assert.deepEqual(
    figma.variableCollections.map((c) => c.name),
    ['gntik'],
  );
  assert.deepEqual(
    figma.variableModes.map((m) => m.name),
    THEMES,
  );
  const ids = new Set(figma.variables.map((v) => v.id));
  assert.equal(ids.size, figma.variables.length);
  assert.equal(figma.variableModeValues.length, figma.variables.length * THEMES.length);
  for (const mv of figma.variableModeValues) {
    assert.ok(ids.has(mv.variableId));
    if (mv.value?.type === 'VARIABLE_ALIAS') assert.ok(ids.has(mv.value.id), `${mv.variableId} alias target`);
  }
  for (const t of THEMES) {
    for (const [k, v] of Object.entries(vars(t)).filter(([, x]) => HSL.test(x))) {
      const mv = figma.variableModeValues.find((x) => x.variableId === `var_${k.slice(2)}` && x.modeId === `mode_${t}`);
      close([mv.value.r, mv.value.g, mv.value.b], hslToRgb(v), `figma ${t} ${k}`);
    }
  }
  const alias = figma.variableModeValues.find((x) => x.variableId === 'var_primary-text' && x.modeId === 'mode_light');
  assert.deepEqual(alias.value, { type: 'VARIABLE_ALIAS', id: 'var_accent-foreground' });
});

test('tokens.js exposes typed constants with the same per-theme hex as tokens.json', async () => {
  assert.ok(fs.existsSync(path.join(out, 'tokens.ts')) && fs.existsSync(path.join(out, 'tokens.d.ts')));
  const mod = await import(path.join(out, 'tokens.js'));
  assert.deepEqual(mod.themes, THEMES);
  assert.equal(mod.colors.dark.primary, '#32cd73');
  for (const t of THEMES) {
    for (const name of mod.colorTokens) {
      const tok = dtcg[t].color[name];
      const ref = typeof tok.$value === 'string' ? /\{[\w]+\.color\.([\w-]+)\}/.exec(tok.$value)[1] : name;
      assert.equal(mod.colors[t][name], dtcg[t].color[ref].$value.hex, `${t} ${name}`);
    }
  }
  assert.equal(mod.cssVar('ring'), '--ring');
});

test('named type roles export DTCG composites with px dimensions and optional inheritance', () => {
  assert.equal(Object.keys(dtcg.typography ?? {}).length, 11);
  assert.equal(dtcg.typography?.label.$type, 'typography');
  assert.deepEqual(dtcg.typography.label.$value, {
    fontFamily: '{font.sans}',
    fontSize: { value: 13, unit: 'px' },
    lineHeight: 1.25,
    fontWeight: 500,
  });
  assert.deepEqual(dtcg.typography['heading-sm'].$value, {
    fontFamily: '{font.sans}',
    fontSize: { value: 17, unit: 'px' },
    lineHeight: 1.375,
    letterSpacing: { value: -0.425, unit: 'px' },
    fontWeight: 600,
  });
  assert.deepEqual(dtcg.typography.body.$value, {
    fontFamily: '{font.sans}',
    fontSize: { value: 15, unit: 'px' },
    lineHeight: 1.625,
  });
  for (const role of ['body', 'supporting', 'caption']) {
    assert.equal(dtcg.typography[role].$value.fontWeight, undefined);
    assert.equal(dtcg.typography[role].$value.letterSpacing, undefined);
  }
});

test('Figma type variables have text scopes and resolved values in all modes', () => {
  const expected = [
    ['label', 'font-size', 'FONT_SIZE', 13],
    ['label', 'line-height', 'LINE_HEIGHT', 16.25],
    ['label', 'font-weight', 'FONT_WEIGHT', 500],
    ['heading-sm', 'font-size', 'FONT_SIZE', 17],
    ['heading-sm', 'line-height', 'LINE_HEIGHT', 23.375],
    ['body', 'font-size', 'FONT_SIZE', 15],
    ['body', 'line-height', 'LINE_HEIGHT', 24.375],
  ];
  for (const [role, field, scope, value] of expected) {
    const variable = figma.variables.find((v) => v.name === `type/${role}/${field}`);
    assert.ok(variable, `${role}/${field}`);
    assert.equal(variable.resolvedType, 'FLOAT');
    assert.deepEqual(variable.scopes, [scope]);
    for (const theme of THEMES) {
      assert.equal(
        figma.variableModeValues.find((v) => v.variableId === variable.id && v.modeId === `mode_${theme}`).value,
        value,
      );
    }
  }
  for (const role of ['body', 'supporting', 'caption']) {
    assert.equal(
      figma.variables.some((v) => v.name === `type/${role}/font-weight`),
      false,
    );
  }
});

test('TypeScript, JavaScript and declarations expose all eleven CSS type roles', async () => {
  const mod = await import(path.join(out, 'tokens.js'));
  assert.equal(Object.keys(mod.typeScale ?? {}).length, 11);
  assert.deepEqual(mod.typeScale['heading-sm'], {
    fontSize: 17,
    lineHeight: 1.375,
    letterSpacing: -0.425,
    fontWeight: 600,
  });
  assert.deepEqual(mod.typeScale.body, { fontSize: 15, lineHeight: 1.625 });
  for (const file of ['tokens.ts', 'tokens.d.ts']) {
    const source = fs.readFileSync(path.join(out, file), 'utf8');
    assert.match(source, /export (?:declare )?const typeScale/);
    for (const role of Object.keys(mod.typeScale)) assert.ok(source.includes(`"${role}"`), `${file}: ${role}`);
  }
});
