import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

it('the built root dependency graph does not load the optional forms peer', () => {
  const visited = new Set<string>();
  function inspect(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, 'utf8');
    for (const [, dependency] of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g)) {
      expect(dependency, `${file} loads react-hook-form`).not.toBe('react-hook-form');
      if (dependency?.startsWith('.')) inspect(resolve(dirname(file), dependency));
    }
  }
  inspect(resolve('dist/index.js'));
  const source = readFileSync(resolve('src/index.ts'), 'utf8');
  expect(source).not.toMatch(/FieldArray|from\s*['"][^'"]*forms/);
});

it('exports the schema renderer only through the optional forms entry', async () => {
  const forms = await import('./index');
  expect(forms.SchemaForm).toBeTypeOf('function');
  expect(forms.SchemaFields).toBeTypeOf('function');
  expect(forms.schemaFormDoc.name).toBe('SchemaForm');
  expect(readFileSync(resolve('src/index.ts'), 'utf8')).not.toMatch(/SchemaForm|SchemaFields|schema-form/);
});
