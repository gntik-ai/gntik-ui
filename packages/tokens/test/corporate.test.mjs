import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PALETTES } from '../src/palettes.js';
import { parsePalette } from '../scripts/palette-model.mjs';

const css = fs.readFileSync(new URL('../src/palettes/corporate.css', import.meta.url), 'utf8');
const [light, dark] = parsePalette(css);
const pairing = fs.readFileSync(new URL('../src/pairing.css', import.meta.url), 'utf8');

function rgb(channels) {
  const [h, s, l] = channels.split(/\s+/).map((v) => parseFloat(v));
  const S = s / 100,
    L = l / 100,
    a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}
const luminance = (channels) => {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb(channels);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const hexHue = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    d = max - Math.min(r, g, b);
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
const hueDistance = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

test('corporate is a registered palette after green and navy', () => {
  assert.deepEqual([...PALETTES], ['green', 'navy', 'corporate']);
});

test('corporate surfaces keep filled fields, field boundaries, focus and primary readable', () => {
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ]) {
    for (const text of ['--foreground', '--muted-foreground'])
      assert.ok(ratio(tokens[text], tokens['--secondary']) >= 4.5, `${theme} ${text} on secondary`);
    for (const boundary of ['--border', '--input', '--ring'])
      for (const surface of ['--background', '--card', '--popover'])
        assert.ok(ratio(tokens[boundary], tokens[surface]) >= 3, `${theme} ${boundary} on ${surface}`);
    const focus = parseBlocksAlias(theme === 'light' ? ':root' : '.dark', '--focus-ring');
    assert.ok(ratio(tokens[focus], tokens['--background']) >= 3, `${theme} focus ring`);
    assert.ok(ratio(tokens['--primary'], tokens['--background']) >= 3, `${theme} primary`);
  }
});

function parseBlocksAlias(selector, alias) {
  const block = pairing.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  return new RegExp(`${alias}:\\s*var\\((--[\\w-]+)\\)`).exec(block)[1];
}

// Source colour of every role, category and series token. Achromatic white and shadows are not listed.
const identity = {
  navy: '#00205b',
  ink: '#081b3c',
  teal: '#005587',
  sky: '#0085ad',
  steel: '#6399ae',
  mist: '#b7c9d3',
  green: '#84bd00',
  yellow: '#e1e000',
  orange: '#fe5000',
  red: '#e4002b',
  pink: '#da1884',
  purple: '#a51890',
  cyan: '#00aec7',
};
const series = ['navy', 'teal', 'sky', 'steel', 'mist', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'cyan'];
const common = {
  '--success': 'green',
  '--warning': 'orange',
  '--info': 'cyan',
  '--destructive': 'red',
  '--success-strong': 'green',
  '--category-rose': 'red',
  '--category-violet': 'purple',
  '--category-amber': 'orange',
  '--category-cyan': 'cyan',
  ...Object.fromEntries(series.map((name, index) => [`--chart-series-${index + 1}`, name])),
};
const roles = {
  light: {
    '--primary': 'navy',
    '--brand-secondary': 'ink',
    '--brand-accent': 'teal',
    '--ring': 'sky',
    '--background': 'mist',
    '--foreground': 'ink',
    '--card-foreground': 'ink',
    '--popover-foreground': 'ink',
    '--muted': 'mist',
    '--muted-foreground': 'steel',
    '--secondary': 'mist',
    '--secondary-foreground': 'ink',
    '--accent': 'steel',
    '--accent-foreground': 'teal',
    '--border': 'steel',
    '--input': 'steel',
    '--chrome': 'mist',
    ...common,
  },
  dark: {
    '--primary': 'steel',
    '--primary-foreground': 'ink',
    '--brand-secondary': 'teal',
    '--brand-accent': 'mist',
    '--ring': 'steel',
    '--background': 'ink',
    '--foreground': 'mist',
    '--card': 'navy',
    '--card-foreground': 'mist',
    '--popover': 'navy',
    '--popover-foreground': 'mist',
    '--muted': 'navy',
    '--muted-foreground': 'mist',
    '--secondary': 'navy',
    '--secondary-foreground': 'mist',
    '--accent': 'teal',
    '--accent-foreground': 'mist',
    '--border': 'teal',
    '--input': 'teal',
    '--chrome': 'ink',
    ...common,
  },
};

test('every corporate role, category and series token keeps the hue of its source colour within 1 degree', () => {
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ])
    for (const [token, name] of Object.entries(roles[theme])) {
      const distance = hueDistance(parseFloat(tokens[token]), hexHue(identity[name]));
      assert.ok(distance <= 1, `corporate ${theme} ${token} is ${distance.toFixed(2)}° from ${name}`);
    }
});

test('corporate palette CSS holds channel values only', () => {
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(css, /gradient|glow|rgb\(/i);
  assert.equal(css.match(/\[data-palette="corporate"\]/g).length, 3, 'one light selector, two dark selectors');
});
