import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

// Both distribution paths must supply their own motion utilities: the docs scan
// UI source, while registry installs scan the copied component source.
for (const distribution of ['docs', 'registry']) {
  test(`TreeList height motion compiles from ${distribution} source without global tree styles`, async () => {
    const base = fileURLToPath(new URL('..', import.meta.url));
    const source =
      distribution === 'docs'
        ? await fs.readFile(
            path.resolve(base, '../../packages/ui/src/components/TreeList/tree-list.variants.ts'),
            'utf8',
          )
        : JSON.parse(await fs.readFile(path.join(base, 'public/r/tree-list.json'), 'utf8')).files.find((file) =>
            file.path.endsWith('/tree-list.variants.ts'),
          ).content;
    const candidates = [...source.matchAll(/['"]([^'"\n]+)['"]/g)].flatMap((match) => match[1].split(/\s+/));
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
    const css = compiler.build(candidates);
    assert.ok(css.includes('height: var(--collapsible-panel-height);'), 'measured panel height');
    assert.ok(css.includes('overflow: hidden;'), 'clip transitioning contents');
    assert.ok(css.includes('transition-property: height;'), 'height transition');
    assert.ok(css.includes('transition-duration: var(--duration-normal);'), 'normal duration token');
    assert.ok(css.includes('transition-timing-function: var(--ease-standard);'), 'standard easing token');
    assert.ok(/\[data-starting-style\][^{]*\{\s*height: 0/.test(css), 'starting height zero');
    assert.ok(/\[data-ending-style\][^{]*\{\s*height: 0/.test(css), 'ending height zero');
    assert.ok(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*transition-property: none;/.test(css),
      'reduced motion',
    );
    const uiStyles = await fs.readFile(path.resolve(base, '../../packages/ui/src/styles.css'), 'utf8');
    assert.doesNotMatch(uiStyles, /\[role\s*=/, 'UI styles must not alter unrelated ARIA trees');
  });
}
