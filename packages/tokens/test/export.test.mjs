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
  assert.deepEqual(figma.variableCollections.map((c) => c.name), ['gntik']);
  assert.deepEqual(figma.variableModes.map((m) => m.name), THEMES);
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
