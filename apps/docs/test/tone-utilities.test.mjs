import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

test('tone opacity utilities emit the same oklab mixing operation as literal opacity utilities', async () => {
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
  const output = compiler.build([
    'bg-tone/15',
    'text-tone-text',
    'text-tone-chip-text',
    'bg-tone',
    'bg-tone/(--badge-bg-alpha)',
    'border-tone/(--badge-border-alpha)',
    'bg-tone/(--token-bg-alpha)',
    'border-tone/(--token-border-alpha)',
    'border-tone/(--alert-border-alpha)',
    '[--badge-bg-alpha:14%]',
    '[--badge-border-alpha:45%]',
    '[--token-bg-alpha:12%]',
    '[--token-border-alpha:40%]',
    '[--alert-border-alpha:30%]',
    'bg-success/15',
    'border-warning/30',
  ]);
  assert.ok(output.includes('background-color: color-mix(in oklab, hsl(var(--success)) 15%, transparent);'));
  assert.ok(output.includes('border-color: color-mix(in oklab, hsl(var(--warning)) 30%, transparent);'));
  assert.ok(output.includes('background-color: color-mix(in oklab, hsl(var(--tone)) 15%, transparent);'));
  for (const [property, alpha] of [
    ['background-color', 'badge-bg'],
    ['border-color', 'badge-border'],
    ['background-color', 'token-bg'],
    ['border-color', 'token-border'],
    ['border-color', 'alert-border'],
  ]) {
    assert.ok(
      output.includes(`${property}: color-mix(in oklab, hsl(var(--tone)) var(--${alpha}-alpha), transparent);`),
      alpha,
    );
  }
  for (const declaration of [
    '--badge-bg-alpha: 14%;',
    '--badge-border-alpha: 45%;',
    '--token-bg-alpha: 12%;',
    '--token-border-alpha: 40%;',
    '--alert-border-alpha: 30%;',
  ])
    assert.ok(output.includes(declaration), declaration);
  assert.ok(output.includes('color: hsl(var(--tone-text));'));
  assert.ok(output.includes('color: hsl(var(--tone-chip-text));'));
  assert.ok(output.includes('background-color: hsl(var(--tone));'));
});
