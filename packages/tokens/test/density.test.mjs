// Density tokens (density.css): the same keys for comfortable (default on :root) and compact,
// compact strictly smaller, comfortable equal to the kit's original sizes, bridged by tailwind.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/density.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const tw = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');

function block(selectorRe) {
  const m = new RegExp(`${selectorRe}\\s*\\{([^}]*)\\}`).exec(css);
  assert.ok(m, `block ${selectorRe}`);
  return Object.fromEntries([...m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
}
const rem = (v) => {
  assert.match(v, /^\d*\.?\d+rem$/, v);
  return parseFloat(v);
};

const comfortable = block(':root,\\s*\\[data-density="comfortable"\\]');
const compact = block('\\[data-density="compact"\\]');

test('both densities declare the same keys', () => {
  assert.ok(Object.keys(comfortable).length >= 10);
  assert.deepEqual(Object.keys(compact).sort(), Object.keys(comfortable).sort());
  for (const k of ['--control-h-sm', '--control-h-md', '--control-h-lg', '--control-px-md', '--row-h', '--cell-py', '--gap-tight']) {
    assert.ok(k in comfortable, k);
  }
});

test('compact values are smaller than comfortable', () => {
  for (const [k, v] of Object.entries(comfortable)) assert.ok(rem(compact[k]) < rem(v), `${k}: ${compact[k]} < ${v}`);
});

test('control heights are ordered sm < md < lg in each density', () => {
  for (const d of [comfortable, compact]) {
    assert.ok(rem(d['--control-h-sm']) < rem(d['--control-h-md']));
    assert.ok(rem(d['--control-h-md']) < rem(d['--control-h-lg']));
  }
});

test('comfortable equals the original kit sizes', () => {
  const original = {
    '--control-h-sm': '2rem', '--control-h-md': '2.25rem', '--control-h-lg': '2.75rem',
    '--control-px-sm': '0.75rem', '--control-px-md': '0.875rem', '--control-px-lg': '1.25rem',
    '--field-px': '0.75rem', '--gap-tight': '0.625rem', '--item-h': '2.125rem', '--tab-h': '2.5rem',
    '--chip-h': '1.375rem', '--token-h': '1.75rem', '--row-h': '2.5rem', '--cell-py': '0.75rem', '--bar-py': '0.625rem',
  };
  assert.deepEqual(comfortable, original);
});

test('tailwind.css imports density.css and bridges every variable', () => {
  assert.match(tw, /@import "\.\/density\.css";/);
  const used = new Set([...tw.matchAll(/@utility [\w-]+ \{[^}]*var\((--[\w-]+)\)/g)].map(([, v]) => v));
  for (const k of Object.keys(comfortable)) assert.ok(used.has(k), `${k} bridged`);
  for (const u of ['h-control', 'h-control-sm', 'h-control-lg', 'size-control', 'px-control', 'h-row', 'py-cell']) {
    assert.match(tw, new RegExp(`@utility ${u} \\{`), u);
  }
});
