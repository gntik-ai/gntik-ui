import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

// Exercise emitted assets, rather than Vite options: run after the production docs build.
test('production fonts load from bundled assets under the builder font-src self policy', () => {
  const dist = new URL('../dist/', import.meta.url);
  const html = readFileSync(new URL('builders.html', dist), 'utf8');
  assert.match(html, /font-src 'self';/);
  const origin = 'https://example.test';
  let fonts = 0;
  for (const file of readdirSync(new URL('assets/', dist))) {
    if (!file.endsWith('.css')) continue;
    const stylesheet = new URL(`assets/${file}`, dist);
    const css = readFileSync(stylesheet, 'utf8');
    for (const face of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      for (const source of face[1].matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
        const url = new URL(source[1], `${origin}/assets/${file}`);
        assert.equal(url.origin, origin, `${file}: font source must satisfy font-src 'self'`);
        assert.ok(existsSync(new URL(`.${url.pathname}`, dist)), `${file}: bundled font must exist`);
        fonts++;
      }
    }
  }
  assert.ok(fonts > 0, 'The production styles must include font sources');
});
