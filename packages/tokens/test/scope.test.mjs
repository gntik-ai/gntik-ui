import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

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
  for (const selector of ['.dark', '.high_contrast']) {
    assert.deepEqual(declarations(css, selector), { 'color-scheme': 'dark' });
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
  const generator = join(directory, 'scripts/build-scope.mjs');
  copyFileSync(new URL('../scripts/build-scope.mjs', import.meta.url), generator);
  // Importing the renderer must work without a writable or even present src directory.
  const { renderScope } = await import(pathToFileURL(generator).href);
  const pairing = read('../src/pairing.css');
  const expected = read('../src/scope.css');
  assert.equal(renderScope(brand, pairing), expected);
  assert.equal(renderScope(brand, pairing), expected);

  assert.equal(read('../src/scope.css'), expected);
  assert.equal(read('../src/pairing.css'), pairing);
  assert.equal(read('../src/brand.css'), brand);
});
