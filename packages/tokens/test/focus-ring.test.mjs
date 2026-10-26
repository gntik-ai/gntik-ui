import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');

function declarations(name) {
  const utility = new RegExp(`@utility ${name}\\s*\\{\\s*&:focus-visible\\s*\\{([^}]+)\\}\\s*\\}`).exec(css);
  assert.ok(utility, `${name} must only style :focus-visible`);
  return Object.fromEntries([...utility[1].matchAll(/([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value]));
}

test('focus-ring exposes the token outline only on keyboard focus', () => {
  assert.deepEqual(declarations('focus-ring'), {
    '--color-focus-ring': 'hsl(var(--focus-ring))',
    'outline-style': 'solid',
    'outline-width': '2px',
    'outline-color': 'var(--color-focus-ring)',
    'outline-offset': '2px',
  });
});

test('focus-ring-inset keeps the keyboard outline inside the border box', () => {
  assert.deepEqual(declarations('focus-ring-inset'), {
    '--color-focus-ring': 'hsl(var(--focus-ring))',
    'outline-style': 'solid',
    'outline-width': '2px',
    'outline-color': 'var(--color-focus-ring)',
    'outline-offset': '-2px',
  });
});
