import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

it('components use cursor tokens for interactive and disabled states in all shipped sources', () => {
  const root = resolve(import.meta.dirname, '../components');
  const violations = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(entry.parentPath, entry.name))
    .filter((file) => /cursor-(?:pointer|not-allowed)\b/.test(readFileSync(file, 'utf8')));
  expect(violations).toEqual([]);
});

it('the catalog does not override the kit button cursor policy', () => {
  const css = readFileSync(resolve(import.meta.dirname, '../../../../apps/docs/src/styles.css'), 'utf8');
  const cursorRules = [...css.matchAll(/([^{}]+)\{[^{}]*\bcursor\s*:[^{}]*\}/g)];
  expect(cursorRules.filter(([, selector]) => /\bbutton\b/.test(selector ?? ''))).toEqual([]);
});
