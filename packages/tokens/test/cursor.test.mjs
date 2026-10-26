import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('cursor tokens expose overridable defaults through CSS exports and utilities', () => {
  const cursor = read('../src/cursor.css');
  const root = /:root\s*\{([^}]+)\}/.exec(cursor)?.[1];
  assert.ok(root, 'cursor defaults belong on :root');
  assert.deepEqual(
    Object.fromEntries([...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value])),
    { '--cursor-interactive': 'pointer', '--cursor-disabled': 'not-allowed' },
  );
  const bridge = read('../src/tailwind.css');
  assert.match(bridge, /@import ["']\.\/cursor\.css["'];/);
  for (const name of ['interactive', 'disabled']) {
    assert.match(bridge, new RegExp(`@utility cursor-${name}\\s*\\{\\s*cursor: var\\(--cursor-${name}\\);\\s*\\}`));
    assert.doesNotMatch(bridge, new RegExp(`--cursor-${name}\\s*:`));
  }
  assert.equal(JSON.parse(read('../package.json')).exports['./cursor.css'], './src/cursor.css');
});
