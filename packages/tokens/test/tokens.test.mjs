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

// Contrast pairing (pairing.css): aliases must point at existing brand tokens and
// meet WCAG AA (4.5:1) as text on the background, card and popover of every theme.
const pairing = fs.readFileSync(new URL('../src/pairing.css', import.meta.url), 'utf8');

function luminance(hslChannels) {
  const [h, s, l] = hslChannels.split(/\s+/).map((v) => parseFloat(v));
  const S = s / 100, L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(f(0)) + 0.7152 * lin(f(8)) + 0.0722 * lin(f(4));
}
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

test('pairing aliases resolve to existing tokens and meet WCAG AA', () => {
  const brand = parse(css);
  const aliases = parse(pairing);
  for (const theme of [':root', '.dark', '.high_contrast']) {
    // Themes inherit :root, so resolve against the merged set.
    const tokens = { ...brand[':root'], ...brand[theme] };
    for (const [alias, value] of Object.entries(aliases[theme])) {
      const m = /^var\((--[\w-]+)\)$/.exec(value);
      assert.ok(m, `${theme} ${alias} must be var(--token), got ${value}`);
      assert.ok(tokens[m[1]], `${theme} ${alias} points at unknown token ${m[1]}`);
      if (alias === '--focus-ring') continue; // non-text: 3:1, checked below
      for (const surface of ['--background', '--card', '--popover']) {
        const r = ratio(tokens[m[1]], tokens[surface]);
        assert.ok(r >= 4.5, `${theme} ${alias} on ${surface} is ${r.toFixed(2)}:1`);
      }
    }
    const ring = tokens[/var\((--[\w-]+)\)/.exec(aliases[theme]['--focus-ring'])[1]];
    assert.ok(ratio(ring, tokens['--background']) >= 3, `${theme} focus ring below 3:1`);
  }
});

test('runtime tokenHex converts brand HSL like the browser', async () => {
  const { tokenHex } = await import('../src/runtime.js');
  globalThis.document = { documentElement: {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => ' 145 61% 50%' });
  try {
    assert.equal(tokenHex('primary'), '#32cd73');
  } finally {
    delete globalThis.document;
    delete globalThis.getComputedStyle;
  }
});
