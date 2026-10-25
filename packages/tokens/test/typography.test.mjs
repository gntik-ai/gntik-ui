import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseBlocks } from '../scripts/export-tokens.mjs';

const roles = {
  display: ['2.875rem', '1.04', '-0.025em', '700'],
  'heading-xl': ['1.875rem', '1.25', '-0.025em', '700'],
  'heading-lg': ['1.5rem', '1.375', '-0.025em', '700'],
  'heading-md': ['1.25rem', '1.375', '-0.025em', '600'],
  'heading-sm': ['17px', '1.375', '-0.025em', '600'],
  'heading-xs': ['15px', '1.375', '-0.025em', '600'],
  'heading-2xs': ['13px', '1.375', undefined, '600'],
  body: ['0.9375rem', '1.625'],
  label: ['13px', '1.25', undefined, '500'],
  supporting: ['13px', '1.375'],
  caption: ['12px', '1.375'],
};

test('eleven type roles preserve the specified values, units and inheritance', () => {
  const vars = parseBlocks(fs.readFileSync(new URL('../src/typography.css', import.meta.url), 'utf8'))[':root'];
  const expected = {};
  for (const [role, values] of Object.entries(roles)) {
    ['size', 'leading', 'tracking', 'weight'].forEach((property, i) => {
      if (values[i] !== undefined) expected[`--type-${role}-${property}`] = values[i];
    });
  }
  assert.deepEqual(vars, expected);
});

test('every declared type variable has an inline Tailwind alias, with no extra defaults', () => {
  const bridge = fs.readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
  assert.match(bridge, /@import "\.\/typography.css";/);
  const aliases = [...bridge.matchAll(/@theme inline\s*\{([^}]+)\}/g)].map((m) => m[1]).join('\n');
  for (const [role, values] of Object.entries(roles)) {
    ['size', 'leading', 'tracking', 'weight'].forEach((property, i) => {
      const suffix = ['', '--line-height', '--letter-spacing', '--font-weight'][i];
      const alias = `--text-${role}${suffix}: var(--type-${role}-${property});`;
      assert.equal(aliases.includes(alias), values[i] !== undefined, alias);
    });
  }
  const manifest = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.exports['./typography.css'], './src/typography.css');
});
