import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const oldClasses = ['focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-focus-ring'];

test('brand lint directs component authors to focus-ring in literals and template elements', async () => {
  const eslint = new ESLint({ cwd: root });
  for (const pkg of ['ui', 'blocks', 'templates', 'chat', 'charts', 'flow', 'editor']) {
    const filePath = `packages/${pkg}/src/focus-probe.tsx`;
    for (const expression of [
      JSON.stringify(oldClasses.join(' ')),
      '`px-2 ' + oldClasses.join(' ') + ' ${size}`',
      JSON.stringify('px-2 ' + oldClasses.join('\n') + ' py-2'),
    ]) {
      const [result] = await eslint.lintText(`const size = ''; export const classes = ${expression} + size;`, {
        filePath,
      });
      assert.ok(
        result.messages.some(
          (diagnostic) => diagnostic.ruleId === 'no-restricted-syntax' && /focus-ring/.test(diagnostic.message),
        ),
        `${filePath}: ${expression}`,
      );
    }
  }
});

test('brand lint permits state-keyed outlines, other offsets and the shared utilities', async () => {
  const eslint = new ESLint({ cwd: root });
  const allowed = ['focus-ring', 'focus-ring-inset', oldClasses.join(' ').replace('offset-2', 'offset-1')];
  for (const state of ['has-[:focus-visible]', 'focus-within', 'group-focus-visible', 'peer-focus-visible']) {
    allowed.push(oldClasses.map((value) => value.replace('focus-visible:', `${state}:`)).join(' '));
    allowed.push(`${state}:` + oldClasses.join(' '));
  }
  for (const value of allowed) {
    for (const quote of ['"', '`']) {
      const [result] = await eslint.lintText(`export const classes = ${quote}${value}${quote};`, {
        filePath: 'packages/ui/src/focus-probe.tsx',
      });
      assert.deepEqual(result.messages, [], value);
    }
  }
});

test('component package sources no longer ship the repeated focus string', () => {
  const offenders = [];
  for (const file of fs.globSync('packages/*/src/**/*.{ts,tsx,json,snap}', { cwd: root })) {
    if (fs.readFileSync(new URL(file, new URL('../../../', import.meta.url)), 'utf8').includes(oldClasses.join(' '))) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], 'Use focus-ring in component source and class expectations');
});
