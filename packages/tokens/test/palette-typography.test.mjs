import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderScope } from '../scripts/build-scope.mjs';
import { parseBlocks } from '../scripts/export-tokens.mjs';

const read = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('html palette emphasis and label case outrank defaults even when typography is imported last', () => {
  // ThemeProvider and themeScript put data-palette on html. The shipped bridge
  // imports scope.css before typography.css, as does the standalone README.
  const css = renderScope(
    read('brand.css'),
    read('pairing.css'),
    { test: [{ '--font-style-emphasis': 'normal', '--text-transform-label': 'none' }, {}] },
    read('status.css'),
    read('typography.css'),
  );
  const palette = parseBlocks(css)['[data-palette="test"]'];
  assert.equal(palette['--font-style-emphasis'], 'normal');
  assert.equal(palette['--text-transform-label'], 'none');

  // :where(:root) matches html with zero specificity, so the attribute selector
  // wins regardless of import order in dark, light and high contrast.
  const defaults = parseBlocks(read('typography.css'));
  for (const [key, fallback] of [
    ['--font-style-emphasis', 'italic'],
    ['--text-transform-label', 'uppercase'],
  ]) {
    const selectors = Object.entries(defaults)
      .filter(([, declarations]) => key in declarations)
      .map(([selector]) => selector);
    assert.deepEqual(selectors, [':where(:root)'], `${key} must have zero specificity`);
    assert.equal(defaults[':where(:root)'][key], fallback);
  }
});

test('palette font and emphasis defaults leave explicit Tailwind utilities in control', () => {
  const typographyCss = read('typography.css');
  const base = typographyCss.match(/@layer base\s*\{([\s\S]*)\}\s*$/)?.[1];
  assert.ok(base, 'inherited font and emphasis rules belong to the base layer below utilities');
  assert.match(
    base,
    /:where\(\[data-palette\],\s*\[data-theme-scope-portal\]\)\s*\{\s*font-family: var\(--font-sans\);/,
  );
  assert.match(base, /:where\(em,\s*i\)\s*\{\s*font-style: var\(--font-style-emphasis\);/);
  const scopes = renderScope(read('brand.css'), read('pairing.css'), {}, read('status.css'), typographyCss);
  assert.doesNotMatch(
    scopes,
    /(?:^|[;{])\s*font-family\s*:/m,
    'generated scopes only set tokens, leaving font-mono usable',
  );
});

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
  assert.deepEqual(declarations, typography);
  assert.match(css, /\[data-palette="test"\]:not\(:where\(\.high_contrast, \.high_contrast \*\)\)/);
  const green = css.match(/\[data-palette="green"\]\s*\{([^}]+)\}/)?.[1];
  assert.match(green ?? '', /--font-sans: "Geist","Helvetica Neue",Arial,sans-serif;/);
  assert.match(green ?? '', /--font-mono: "Geist Mono",ui-monospace,"SFMono-Regular",Menlo,monospace;/);
  assert.match(green ?? '', /--font-style-emphasis: italic;/);
  assert.match(green ?? '', /--text-transform-label: uppercase;/);
});
