import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

// Scan shipped UI source literals, rather than supplying the expected candidates to the compiler.
async function candidatesFrom(directory) {
  const candidates = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) candidates.push(...(await candidatesFrom(file)));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|doc)\./.test(entry.name)) {
      const source = await fs.readFile(file, 'utf8');
      for (const match of source.matchAll(/['"]([^'"\n]+)['"]/g)) candidates.push(...match[1].split(/\s+/));
    }
  }
  return candidates;
}

test('Tailwind generates responsive Grid and Section utilities from shipped literal tables', async () => {
  const base = fileURLToPath(new URL('..', import.meta.url));
  const compiler = await compile(
    '@import "./node_modules/tailwindcss/index.css"; @import "../../packages/tokens/src/tailwind.css";',
    {
      base,
      async loadStylesheet(id, directory) {
        const file = path.resolve(directory, id);
        return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
      },
    },
  );
  const css = compiler.build(await candidatesFrom(path.resolve(base, '../../packages/ui/src')));
  for (const selector of [
    '.\\32 xl\\:grid-cols-6',
    '.\\32 xl\\:col-span-6',
    '.\\32 xl\\:col-span-full',
    '.lg\\:gap-6',
    '.md\\:gap-y-3',
    '.xl\\:gap-x-8',
    '.md\\:p-8',
    '.md\\:mb-5',
    '.md\\:gap-5',
    '.md\\:pb-5',
  ])
    assert.ok(css.includes(`${selector} {`), `missing compiled selector ${selector}`);
});
