import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

// Public build output: the interaction fixture belongs only to the browser test site.
test('production docs exclude the table labels interaction fixture and its translations', () => {
  const dist = new URL('../dist/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('.vite/manifest.json', dist), 'utf8'));
  assert.ok(Object.keys(manifest).includes('index.html'), 'Production docs were built');
  assert.equal(existsSync(new URL('table-labels.html', dist)), false);
  for (const file of readdirSync(new URL('assets/', dist))) {
    if (!file.endsWith('.js')) continue;
    const source = readFileSync(new URL(`assets/${file}`, dist), 'utf8');
    for (const translation of ['Elegir grupo', 'Custom Saved views'])
      assert.equal(source.includes(translation), false, `${file} includes test-only labels`);
  }
});
