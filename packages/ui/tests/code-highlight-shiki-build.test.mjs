import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the optional Shiki entry is exported and isolated from the core bundle', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(pkg.exports['./code-highlight-shiki'], {
    types: './dist/code-highlight-shiki.d.ts',
    default: './dist/code-highlight-shiki.js',
  });
  assert.equal(pkg.peerDependenciesMeta.shiki.optional, true);
  assert.ok(pkg.peerDependencies.shiki);
  const main = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /shiki/i);
  const entry = await import('../dist/code-highlight-shiki.js');
  const highlighter = entry.createShikiHighlighter();
  assert.equal(highlighter.tokenize('name: "api"', 'yaml'), null);
  assert.equal(await highlighter.load('yaml'), true);
  assert.ok(
    highlighter
      .tokenize('name: "api"', 'yaml')
      .flat()
      .some((token) => token.kind === 'property' && token.value === 'name'),
  );
});
