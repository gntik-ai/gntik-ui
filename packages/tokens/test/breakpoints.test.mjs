import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { breakpoints, breakpointQuery } from '../src/runtime.js';

test('runtime breakpoints equal Tailwind defaults and the CSS bridge', () => {
  assert.deepEqual(breakpoints, { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' });
  const css = readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
  const parsed = Object.fromEntries([...css.matchAll(/--breakpoint-([\w]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
  assert.deepEqual(breakpoints, parsed);
  assert.equal(breakpointQuery('lg'), '(min-width: 64rem)');
});
