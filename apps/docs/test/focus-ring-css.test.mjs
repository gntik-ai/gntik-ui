import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

test('compiled focus utilities resolve the focus colour on the focused element for nested theme scopes', async () => {
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
  const css = compiler.build(['focus-ring', 'focus-ring-inset']);
  for (const utility of ['focus-ring', 'focus-ring-inset']) {
    const rule = new RegExp(`\\.${utility}(?::focus-visible|\\s*\\{\\s*&:focus-visible)\\s*\\{([^}]+)\\}`).exec(css);
    assert.ok(rule, `${utility}: compiled keyboard selector`);
    assert.match(rule[1], /--color-focus-ring:\s*hsl\(var\(--focus-ring\)\);/);
    assert.match(rule[1], /outline-color:\s*var\(--color-focus-ring\);/);
  }
});
