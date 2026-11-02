import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('opt-in Inter uses only packaged upright variable WOFF2 fonts and includes its licence', () => {
  const root = new URL('../', import.meta.url);
  const css = readFileSync(new URL('fonts/inter.css', root), 'utf8');
  assert.doesNotMatch(css, /https?:|\/\//i);
  const urls = [...css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g)].map((match) => match[1]);
  assert.equal(urls.length, 7);
  assert.equal([...css.matchAll(/font-style:\s*normal/g)].length, 7);
  assert.equal([...css.matchAll(/font-weight:\s*100 900/g)].length, 7);
  for (const url of urls) {
    assert.match(url, /-normal\.woff2$/);
    assert.equal(
      readFileSync(new URL('fonts/' + url, root))
        .subarray(0, 4)
        .toString(),
      'wOF2',
    );
  }
  const licence = readFileSync(new URL('fonts/OFL.txt', root), 'utf8');
  assert.match(licence, /SIL OPEN FONT LICENSE Version 1.1/);
  assert.match(licence, /Copyright.*Inter/);
  const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  assert.equal(manifest.exports['./fonts/inter.css'], './fonts/inter.css');
  assert.ok(manifest.files.includes('fonts'));
});
