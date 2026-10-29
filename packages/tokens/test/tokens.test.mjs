import { PALETTES } from '../src/palettes.js';
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
  const S = s / 100,
    L = l / 100;
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
    const status = parse(fs.readFileSync(new URL('../src/status.css', import.meta.url), 'utf8'));
    const tokens = { ...brand[':root'], ...brand[theme], ...status[':root'], ...status[theme] };
    for (const [alias, value] of Object.entries(aliases[theme])) {
      const m = /^var\((--[\w-]+)\)$/.exec(value);
      assert.ok(m, `${theme} ${alias} must be var(--token), got ${value}`);
      assert.ok(tokens[m[1]], `${theme} ${alias} points at unknown token ${m[1]}`);
      if (alias === '--focus-ring') continue; // non-text: 3:1, checked below
      if (alias.endsWith('-chip-text')) continue; // checked on tints below
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

// Chip text sits on its tone's tint (bg-<tone>/10 … /20) over the background, card or popover.
function hslToRgb(ch) {
  const [h, s, l] = ch.split(/\s+/).map((v) => parseFloat(v));
  const S = s / 100,
    L = l / 100,
    a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}
const lum = ([r, g, b]) => {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const rgbRatio = (x, y) => {
  const [p, q] = [lum(x), lum(y)].sort((m, n) => n - m);
  return (p + 0.05) / (q + 0.05);
};

test('chip text aliases meet WCAG AA on their tint in every theme', () => {
  const brand = parse(css);
  const aliases = parse(pairing);
  const TONE = {
    '--primary-chip-text': '--primary',
    '--success-chip-text': '--success',
    '--warning-chip-text': '--warning',
    '--destructive-chip-text': '--destructive',
  };
  for (const theme of [':root', '.dark', '.high_contrast']) {
    const status = parse(fs.readFileSync(new URL('../src/status.css', import.meta.url), 'utf8'));
    const tokens = { ...brand[':root'], ...brand[theme], ...status[':root'], ...status[theme] };
    for (const [alias, tone] of Object.entries(TONE)) {
      const text = hslToRgb(tokens[/var\((--[\w-]+)\)/.exec(aliases[theme][alias])[1]]);
      for (const surface of ['--background', '--card', '--popover']) {
        for (const alpha of [0.1, 0.15, 0.2]) {
          const bg = hslToRgb(tokens[surface]).map((c, i) => c * (1 - alpha) + hslToRgb(tokens[tone])[i] * alpha);
          const r = rgbRatio(text, bg);
          assert.ok(r >= 4.5, `${theme} ${alias} on ${tone}/${alpha * 100} over ${surface} is ${r.toFixed(2)}:1`);
        }
      }
    }
  }
});

test('filled field text and placeholders meet AA on secondary in every theme', () => {
  const brand = parse(css);
  for (const theme of [':root', '.dark', '.high_contrast']) {
    const status = parse(fs.readFileSync(new URL('../src/status.css', import.meta.url), 'utf8'));
    const tokens = { ...brand[':root'], ...brand[theme], ...status[':root'], ...status[theme] };
    for (const text of ['--foreground', '--muted-foreground']) {
      const contrast = ratio(tokens[text], tokens['--secondary']);
      assert.ok(contrast >= 4.5, `${theme} ${text} on secondary is ${contrast.toFixed(2)}:1`);
    }
  }
});

test('light success aliases use the independent success-strong status token', () => {
  const aliases = parse(pairing)[':root'];
  assert.equal(aliases['--success-text'], 'var(--success-strong)');
  assert.equal(aliases['--success-chip-text'], 'var(--success-strong)');
  const status = parse(fs.readFileSync(new URL('../src/status.css', import.meta.url), 'utf8'));
  assert.equal(status[':root']['--success-strong'], '153 55% 22%');
  assert.equal(status['.dark']['--success-strong'], '145 61% 50%');
});

// Palette files are tested as shipped, independently of the export pipeline.
const paletteBlocks = (text) =>
  [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => !selector.trim().startsWith('@'))
    .map(([, , body]) =>
      Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])),
    );
function assertComplete(palette, theme, actual) {
  const expected = Object.keys(frozen['.dark']).concat('--success-strong');
  for (const key of expected) assert.ok(key in actual, `${palette} ${theme} missing ${key}`);
  for (const key of Object.keys(actual)) assert.ok(expected.includes(key), `${palette} ${theme} unexpected ${key}`);
}

for (const palette of PALETTES.filter((id) => id !== 'green'))
  test(`${palette} ships complete light and dark palettes`, () => {
    const blocks = paletteBlocks(fs.readFileSync(new URL(`../src/palettes/${palette}.css`, import.meta.url), 'utf8'));
    assert.equal(blocks.length, 2);
    assertComplete(palette, 'light', blocks[0]);
    assertComplete(palette, 'dark', blocks[1]);
    if (palette !== 'navy') return;
    assert.equal(blocks[0]['--primary'], '223 54% 23%');
    assert.equal(blocks[0]['--background'], '222 28% 96%');
    assert.equal(blocks[1]['--primary'], '221 90% 78%');
    assert.equal(blocks[0]['--success-strong'], '150 60% 24%');
  });

test('completeness failures name palette, theme and missing or extra token', () => {
  const fixture = { ...frozen['.dark'], '--success-strong': '145 61% 50%' };
  delete fixture['--chrome'];
  assert.throws(() => assertComplete('fixture', 'dark', fixture), /fixture dark missing --chrome/);
  fixture['--chrome'] = '222 38% 5%';
  fixture['--extra'] = '0 0% 0%';
  assert.throws(() => assertComplete('fixture', 'dark', fixture), /fixture dark unexpected --extra/);
});

test('every palette passes text, chips, focus, button and hue separation contracts', () => {
  for (const palette of PALETTES) {
    const blocks =
      palette === 'green'
        ? [frozen[':root'], frozen['.dark']]
        : paletteBlocks(fs.readFileSync(new URL(`../src/palettes/${palette}.css`, import.meta.url), 'utf8'));
    for (const [index, tokens] of blocks.entries()) {
      const theme = index === 0 ? 'light' : 'dark';
      const aliases = parse(pairing)[index === 0 ? ':root' : '.dark'];
      const colors = { '--success-strong': index === 0 ? '153 55% 22%' : '145 61% 50%', ...tokens };
      const label = `${palette} ${theme}`;
      for (const [alias, value] of Object.entries(aliases)) {
        const color = colors[/var\((--[\w-]+)\)/.exec(value)[1]];
        if (alias === '--focus-ring') {
          assert.ok(ratio(color, colors['--background']) >= 3, `${label} ${alias}`);
        } else
          for (const surface of ['--background', '--card', '--popover']) {
            if (alias.endsWith('-chip-text')) {
              const tone = alias.replace('-chip-text', '');
              for (const alpha of [0.1, 0.15, 0.2]) {
                const tint = hslToRgb(colors[surface]).map(
                  (v, i) => v * (1 - alpha) + hslToRgb(colors[tone])[i] * alpha,
                );
                assert.ok(rgbRatio(hslToRgb(color), tint) >= 4.5, `${label} ${alias} ${surface} ${alpha}`);
              }
            } else assert.ok(ratio(color, colors[surface]) >= 4.5, `${label} ${alias} ${surface}`);
          }
      }
      assert.ok(ratio(colors['--primary-foreground'], colors['--primary']) >= 4.5, `${label} primary-foreground`);
      const hue = parseFloat(colors['--primary']);
      for (const token of ['--info', '--warning', '--destructive']) {
        const distance = Math.abs(hue - parseFloat(colors[token]));
        assert.ok(Math.min(distance, 360 - distance) >= 30, `${label} primary vs ${token}`);
      }
    }
  }
});
