import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { exportTokens } from '../scripts/export-tokens.mjs';

const layers = {
  behind: -1,
  base: 0,
  raised: 1,
  sticky: 10,
  'sticky-pinned': 11,
  docked: 20,
  dropdown: 1000,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  'skip-link': 1600,
  toast: 1700,
  tooltip: 1800,
};

test('the thirteen public CSS layers are ordered and have one static Tailwind utility each', () => {
  const css = fs.readFileSync(new URL('../src/layers.css', import.meta.url), 'utf8');
  const root = /:root\s*\{([^}]+)\}/.exec(css);
  assert.ok(root);
  const declarations = [...root[1].matchAll(/--z-([\w-]+):\s*(-?\d+);/g)];
  assert.deepEqual(
    declarations.map(([, key, value]) => [key, Number(value)]),
    Object.entries(layers),
  );
  const values = declarations.map(([, , value]) => Number(value));
  assert.ok(values.every((value, index) => index === 0 || value > values[index - 1]));

  const tw = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
  assert.match(tw, /@import "\.\/layers\.css";/);
  assert.doesNotMatch(tw, /--z-index-/);
  const utilities = [...tw.matchAll(/@utility z-([\w-]+)\s*\{\s*z-index:\s*var\(--z-([\w-]+)\);\s*\}/g)];
  assert.deepEqual(
    utilities.map(([, utility, variable]) => [utility, variable]),
    Object.keys(layers).map((key) => [key, key]),
  );
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.exports['./layers.css'], './src/layers.css');
});

test('DTCG and typed JavaScript exports expose identical number layers', async (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gntik-layers-'));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  exportTokens(out);
  const dtcg = JSON.parse(fs.readFileSync(path.join(out, 'tokens.json'), 'utf8'));
  assert.deepEqual(Object.keys(dtcg.zIndex), Object.keys(layers));
  for (const [name, value] of Object.entries(layers)) {
    assert.equal(dtcg.zIndex[name].$type, 'number');
    assert.equal(dtcg.zIndex[name].$value, value);
  }
  const js = await import(pathToFileURL(path.join(out, 'tokens.js')));
  const ts = await import(pathToFileURL(path.join(out, 'tokens.ts')));
  assert.deepEqual(js.zIndex, layers);
  assert.deepEqual(ts.zIndex, layers);
  const dts = fs.readFileSync(path.join(out, 'tokens.d.ts'), 'utf8');
  for (const [name, value] of Object.entries(layers)) {
    assert.ok(dts.includes(`readonly "${name}": ${value}`));
  }
});
