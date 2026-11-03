import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(file, import.meta.url), 'utf8');

test('base.css is an opt-in, layered baseline using existing theme tokens', () => {
  assert.equal(JSON.parse(read('../package.json')).exports['./base.css'], './src/base.css');
  assert.equal(import.meta.resolve('@gntik-ai/tokens/base.css'), new URL('../src/base.css', import.meta.url).href);
  const css = read('../src/base.css')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  assert.match(css, /^@layer base\s*\{/);
  // Every declaration must remain within the single outer base layer.
  let depth = 0;
  for (const [index, char] of [...css].entries()) {
    if (char === '{') depth++;
    if (char === '}') depth--;
    assert.ok(depth > 0 || index === css.length - 1 || index < css.indexOf('{'));
  }
  assert.equal(depth, 0);
  const body = /body\s*\{([^}]+)\}/.exec(css)?.[1] ?? '';
  for (const declaration of [
    'background-color: hsl(var(--background));',
    'color: hsl(var(--foreground));',
    'font-family: var(--font-sans);',
    '-webkit-font-smoothing: antialiased;',
    '-moz-osx-font-smoothing: grayscale;',
  ])
    assert.ok(body.includes(declaration), declaration);
  assert.match(css, /::selection\s*\{\s*background-color: hsl\(var\(--primary\) \/ 0\.28\);\s*\}/);
  assert.match(css, /html\s*\{\s*scrollbar-color: hsl\(var\(--border\)\) transparent;\s*\}/);
  assert.match(css, /html\[data-scroll-gutter=["']stable["']\]\s*\{\s*scrollbar-gutter: stable;\s*\}/);
  assert.equal([...css.matchAll(/scrollbar-gutter:/g)].length, 1);
  assert.match(css, /:where\(#root,\s*#__next,\s*\[data-app-root\]\)\s*\{\s*isolation: isolate;\s*\}/);
  assert.match(
    css,
    /@supports\s*\(-webkit-touch-callout: none\)\s*\{\s*body\s*\{\s*position: relative;\s*--backdrop-position: absolute;\s*\}\s*\}/,
  );
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|hsla?\(\s*(?!var\()/i);
  const brand = read('../src/brand.css');
  for (const [, token] of css.matchAll(/var\((--[\w-]+)\)/g)) assert.ok(brand.includes(`${token}:`), token);
  for (const file of ['../src/tailwind.css', '../../ui/src/styles.css', '../../templates/src/styles.css']) {
    assert.doesNotMatch(read(file), /base\.css/);
  }
});
