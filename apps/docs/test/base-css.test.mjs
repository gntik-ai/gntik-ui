import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

const base = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => fs.readFile(new URL(file, import.meta.url), 'utf8');

test('all five Vite apps opt in without handwritten body classes', async () => {
  for (const app of ['docs', 'example-vite', 'sandbox', 'musematic', 'falcone']) {
    const css = await read(`../../${app}/src/${app === 'docs' ? 'styles' : 'index'}.css`);
    assert.match(css, /@import ["']@gntik-ai\/tokens\/base\.css["'];/, app);
    assert.match(await read(`../../${app}/index.html`), /<body>/, app);
  }
  for (const entry of ['preview', 'chart-export', 'block-labels']) {
    assert.match(await read(`../${entry}.html`), /<body>/, entry);
  }
});

test('compiling ui styles keeps the baseline opt-in and emits the fixed backdrop fallback', async () => {
  const entry = '@import "./node_modules/tailwindcss/index.css"; @import "../../packages/ui/src/styles.css";';
  const options = {
    base,
    async loadStylesheet(id, directory) {
      const file = id.startsWith('.')
        ? path.resolve(directory, id)
        : createRequire(path.join(directory, 'package.json')).resolve(
            id === 'tailwindcss' ? 'tailwindcss/index.css' : id,
          );
      return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
    },
  };
  const classes = ['bg-card', '[position:var(--backdrop-position,fixed)]', 'min-h-dvh', 'fixed', 'inset-0'];
  const without = (await compile(entry, options)).build(classes);
  assert.doesNotMatch(without, /::selection|background-color: hsl\(var\(--background\)\)/);
  assert.match(without, /position: var\(--backdrop-position,\s*fixed\);/);
  assert.match(without, /min-height: 100dvh;/);
  const previous = (await compile(entry, options)).build(['bg-card', 'fixed', 'inset-0']);
  const withoutNewUtilities = without.replace(
    / {2}[^\n]+\{\n {4}(?:position: var\(--backdrop-position,\s*fixed\);|min-height: 100dvh;)\n {2}\}\n/g,
    '',
  );
  assert.equal(withoutNewUtilities, previous, 'opting out changes only the two backdrop utilities');
  const withBase = (await compile(`${entry} @import "../../packages/tokens/src/base.css";`, options)).build(classes);
  assert.match(withBase, /@layer base\s*\{[\s\S]*?body\s*\{\s*background-color: hsl\(var\(--background\)\)/);
  assert.match(withBase, /@layer utilities[\s\S]*\.bg-card\s*\{\s*background-color: hsl\(var\(--card\)\)/);
  assert.match(withBase, /::selection/);

  // Compile the real opt-out preview entry too: the browser must load a page
  // whose stylesheet never imported base.css, rather than deleting CSSOM rules.
  const optOut = (
    await compile(await read('../src/base-layer-without-base.css'), { ...options, base: path.join(base, 'src') })
  ).build(classes);
  assert.doesNotMatch(optOut, /::selection|isolation: isolate|background-color: hsl\(var\(--background\)\)/);
  assert.match(optOut, /position: var\(--backdrop-position,\s*fixed\);/);
  assert.match(optOut, /min-height: 100dvh;/);
});
