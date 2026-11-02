import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderScope } from '../scripts/build-scope.mjs';

const read = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('palette typography applies without a high-contrast guard and never carries colours', () => {
  const typography = {
    '--font-sans': '"Test Sans", sans-serif',
    '--font-mono': '"Test Mono", monospace',
    '--font-style-emphasis': 'normal',
    '--text-transform-label': 'none',
  };
  const css = renderScope(
    read('brand.css'),
    read('pairing.css'),
    {
      test: [
        { '--primary': 'var(--info)', ...typography },
        { '--primary': 'var(--success)', ...typography },
      ],
    },
    read('status.css'),
    read('typography.css'),
  );
  const unguarded = css.match(/\[data-palette="test"\]\s*\{([^}]+)\}/)?.[1];
  assert.ok(unguarded, 'typography must apply in high contrast too');
  const declarations = Object.fromEntries(
    [...unguarded.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]),
  );
  assert.deepEqual(declarations, { ...typography, 'font-family': 'var(--font-sans)' });
  assert.match(css, /\[data-palette="test"\]:not\(:where\(\.high_contrast, \.high_contrast \*\)\)/);
  const green = css.match(/\[data-palette="green"\]\s*\{([^}]+)\}/)?.[1];
  assert.match(green ?? '', /--font-sans: "Geist","Helvetica Neue",Arial,sans-serif;/);
  assert.match(green ?? '', /--font-mono: "Geist Mono",ui-monospace,"SFMono-Regular",Menlo,monospace;/);
  assert.match(green ?? '', /--font-style-emphasis: italic;/);
  assert.match(green ?? '', /--text-transform-label: uppercase;/);
});
