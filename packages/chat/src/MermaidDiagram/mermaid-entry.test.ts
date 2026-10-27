import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('exports a built optional-peer adapter and isolates the main dependency graph', () => {
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
  expect(pkg.exports['./mermaid']).toEqual({ types: './dist/mermaid.d.ts', default: './dist/mermaid.js' });
  expect(pkg.peerDependencies.mermaid).toBe('12.2.0');
  expect(pkg.peerDependenciesMeta.mermaid.optional).toBe(true);
  expect(readFileSync(resolve('dist/mermaid.js'), 'utf8')).toContain('mermaid');
  expect(readFileSync(resolve('dist/mermaid.d.ts'), 'utf8')).toContain('MermaidDiagram');
  expect(readFileSync(resolve('src/index.ts'), 'utf8')).not.toMatch(/mermaid/i);
  const visited = new Set<string>();
  function inspect(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, 'utf8');
    expect(source, file).not.toMatch(/mermaid/i);
    for (const [, dependency] of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g)) {
      if (dependency?.startsWith('.')) inspect(resolve(dirname(file), dependency));
    }
  }
  inspect(resolve('dist/index.js'));
});
