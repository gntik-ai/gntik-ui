import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

it('exports the built Shiki adapter with an optional peer', () => {
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
  expect(pkg.exports['./code-highlight-shiki']).toEqual({
    types: './dist/code-highlight-shiki.d.ts',
    default: './dist/code-highlight-shiki.js',
  });
  expect(pkg.peerDependencies.shiki).toBeTruthy();
  expect(pkg.peerDependenciesMeta.shiki.optional).toBe(true);
  expect(readFileSync(resolve('dist/code-highlight-shiki.js'), 'utf8')).toContain('createShikiHighlighter');
  expect(readFileSync(resolve('dist/code-highlight-shiki.d.ts'), 'utf8')).toContain('createShikiHighlighter');
});

it('keeps Shiki out of the built root dependency graph', () => {
  const visited = new Set<string>();
  function inspect(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, 'utf8');
    expect(source, `${file} references Shiki`).not.toMatch(/shiki/i);
    for (const [, dependency] of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g)) {
      if (dependency?.startsWith('.')) inspect(resolve(dirname(file), dependency));
    }
  }
  inspect(resolve('dist/index.js'));
});
