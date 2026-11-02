import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { readPalettes } from '../scripts/palette-model.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const frozen = JSON.parse(read('./frozen-values.json'));
const declarations = (css, selector) => {
  const body = css.split(`${selector} {`)[1]?.split('}')[0] ?? '';
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+|color-scheme)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
};

test('light restores exactly the frozen theme overrides and root pairing aliases', () => {
  const keys = new Set([...Object.keys(frozen['.dark']), ...Object.keys(frozen['.high_contrast'])]);
  const expected = Object.fromEntries(Object.entries(frozen[':root']).filter(([key]) => keys.has(key)));
  Object.assign(expected, declarations(read('../src/pairing.css'), ':root'), { 'color-scheme': 'light' });
  assert.deepEqual(declarations(read('../src/scope.css'), '.light'), expected);
});

test('each non-light scope declares a dark color scheme', () => {
  const css = read('../src/scope.css');
  assert.deepEqual(declarations(css, '.dark'), { 'color-scheme': 'dark' });
  const { 'color-scheme': scheme, ...rest } = declarations(css, '.high_contrast');
  assert.equal(scheme, 'dark');
  // High contrast ignores palette colours, so it only clears inherited chart series.
  assert.deepEqual(Object.values(rest), Array(12).fill('initial'));
  assert.deepEqual(
    Object.keys(rest),
    Array.from({ length: 12 }, (_, index) => `--chart-series-${index + 1}`),
  );
});

test('chart series tokens reach only corporate and are cleared everywhere else', () => {
  const css = read('../src/scope.css');
  const seriesOf = (block) => Object.keys(block).filter((key) => key.startsWith('--chart-series-'));
  const blocks = [...css.matchAll(/(\[data-palette="(\w+)"\][^{}]*)\{([^{}]*)\}/g)].filter(([, selector]) =>
    selector.includes(':not('),
  );
  assert.ok(blocks.length >= 6, 'green, navy and corporate each have a light and a dark block');
  for (const [, selector, id, body] of blocks) {
    const values = Object.fromEntries([...body.matchAll(/(--chart-series-\d+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
    assert.equal(seriesOf(values).length, 12, `${selector} declares all twelve series tokens`);
    for (const value of Object.values(values))
      assert.equal(id === 'corporate' ? value !== 'initial' : value === 'initial', true, `${id}: ${value}`);
  }
});

test('generation is byte-idempotent without writing to the source checkout', async (t) => {
  const brand = read('../src/brand.css');
  // Immutable source snapshot at issue assignment; checks bytes, including whitespace.
  assert.equal(
    createHash('sha256').update(brand).digest('hex'),
    'ddf125ca24e0005969ebeaee5839ab9f65a08cb6673269f029359747044f0735',
  );
  const directory = mkdtempSync(join(tmpdir(), 'theme-scope-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, 'scripts'));
  mkdirSync(join(directory, 'src'));
  copyFileSync(new URL('../scripts/palette-model.mjs', import.meta.url), join(directory, 'scripts/palette-model.mjs'));
  copyFileSync(new URL('../src/palettes.js', import.meta.url), join(directory, 'src/palettes.js'));
  const generator = join(directory, 'scripts/build-scope.mjs');
  copyFileSync(new URL('../scripts/build-scope.mjs', import.meta.url), generator);
  // Importing the renderer must work without a writable or even present src directory.
  const { renderScope } = await import(pathToFileURL(generator).href);
  const pairing = read('../src/pairing.css');
  const expected = read('../src/scope.css');
  assert.equal(
    renderScope(
      brand,
      pairing,
      readPalettes((file) => read('../src/' + file)),
      read('../src/status.css'),
      read('../src/typography.css'),
    ),
    expected,
  );
  assert.equal(
    renderScope(
      brand,
      pairing,
      readPalettes((file) => read('../src/' + file)),
      read('../src/status.css'),
      read('../src/typography.css'),
    ),
    expected,
  );

  assert.equal(read('../src/scope.css'), expected);
  assert.equal(read('../src/pairing.css'), pairing);
  assert.equal(read('../src/brand.css'), brand);
});

test('generated palette scopes reapply navy values and aliases at theme boundaries', () => {
  const css = read('../src/scope.css');
  assert.match(css, /@scope \(\[data-palette="navy"\]\) to \(\[data-palette\]\)/);
  assert.match(css, /--primary: 223 54% 23%;/);
  assert.match(css, /--primary: 221 90% 78%;/);
  assert.match(css, /--success-text: var\(--success-strong\);/);
  assert.match(css, /:where\(\.high_contrast\) :is\(\[data-palette\], \.light, \.dark\)/);
});
