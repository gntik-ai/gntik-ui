// Motion tokens (motion.css): only durations and easings, collapsed under reduced motion,
// and bridged to Tailwind by tailwind.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/motion.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const tw = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
const decls = [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]);
const reduced = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*:root\s*\{([^}]*)\}\s*\}/.exec(css);

test('motion.css declares only durations and easings', () => {
  const names = new Set(decls.map(([k]) => k));
  assert.deepEqual([...names].sort(), ['--duration-fast', '--duration-normal', '--duration-slow', '--ease-emphasized', '--ease-exit', '--ease-standard']);
  for (const [k, v] of decls) {
    if (k.startsWith('--duration-')) assert.match(v, /^\d+ms$/, k);
    else assert.match(v, /^cubic-bezier\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*[\d.]+\s*\)$/, k);
  }
});

test('durations are ordered and collapse to 0ms under prefers-reduced-motion', () => {
  const base = Object.fromEntries(decls.filter(([k]) => k.startsWith('--duration-')).slice(0, 3));
  assert.ok(parseInt(base['--duration-fast']) < parseInt(base['--duration-normal']));
  assert.ok(parseInt(base['--duration-normal']) < parseInt(base['--duration-slow']));
  assert.ok(reduced, 'reduced-motion block present');
  for (const k of ['--duration-fast', '--duration-normal', '--duration-slow']) {
    assert.match(reduced[1], new RegExp(`${k}\\s*:\\s*0ms`), k);
  }
  assert.doesNotMatch(reduced[1], /--ease-/);
});

test('tailwind.css imports motion.css and bridges easings and durations', () => {
  assert.match(tw, /@import "\.\/motion\.css";/);
  for (const e of ['standard', 'emphasized', 'exit']) assert.match(tw, new RegExp(`--ease-${e}: var\\(--ease-${e}\\);`));
  for (const d of ['fast', 'normal', 'slow']) assert.match(tw, new RegExp(`@utility duration-${d} \\{[^}]*transition-duration: var\\(--duration-${d}\\);`));
  assert.match(tw, /--default-transition-duration: var\(--duration-[a-z]+\);/);
});
