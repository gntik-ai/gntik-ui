// Colours are frozen (CLAUDE.md): brand.css must keep exactly the values
// recorded in frozen-values.json for :root, .dark and .high_contrast.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/brand.css', import.meta.url), 'utf8');
const frozen = JSON.parse(fs.readFileSync(new URL('./frozen-values.json', import.meta.url), 'utf8'));

function parse(text) {
  const out = {};
  const re = /(:root|\.dark|\.high_contrast)\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const vars = (out[m[1]] = {});
    for (const decl of m[2].replace(/\/\*[\s\S]*?\*\//g, '').split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const key = decl.slice(0, i).trim();
      if (key.startsWith('--')) vars[key] = decl.slice(i + 1).trim();
    }
  }
  return out;
}

test('brand.css values match the frozen snapshot in every theme', () => {
  assert.deepEqual(parse(css), frozen);
});

test('tailwind.css only references tokens, never defines colour values', () => {
  const tw = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
  assert.doesNotMatch(tw, /#[0-9a-f]{3,8}\b/i);
  for (const m of tw.matchAll(/--color-[\w-]+:\s*([^;]+);/g)) {
    assert.match(m[1], /^hsl\(var\(--[\w-]+\)\)$/);
  }
});
