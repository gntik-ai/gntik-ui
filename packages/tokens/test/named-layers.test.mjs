import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../..', import.meta.url));

test('brand lint rejects raw stacking utilities and permits named layers, zero and auto', async () => {
  const eslint = new ESLint({ cwd: root });
  const message = 'Use a named layer (z-raised, z-sticky, z-modal, z-toast…)';
  for (const filePath of ['packages/ui/src/layer-probe.tsx', 'apps/falcone/src/layer-probe.tsx']) {
    for (const utility of [
      'z-50',
      '-z-10',
      'z-[11]',
      'focus:z-50',
      'before:-z-10',
      'hover:z-[var(--custom)]',
      '-z-0',
    ]) {
      for (const quote of ['"', '`']) {
        const [result] = await eslint.lintText(`export const classes = ${quote}${utility}${quote};`, { filePath });
        assert.ok(
          result.messages.some((diagnostic) => diagnostic.message === message),
          `${filePath}: ${utility} ${quote}`,
        );
      }
    }
    for (const utility of ['z-0', 'z-auto', 'z-modal', 'focus:z-raised', 'before:z-behind', 'size-50']) {
      const [result] = await eslint.lintText(`export const classes = "${utility}";`, { filePath });
      assert.deepEqual(result.messages, [], utility);
    }
  }
});

test('published component sources use named stacking utilities', () => {
  const offenders = [];
  for (const file of fs.globSync('packages/*/src/**/*.{ts,tsx}', { cwd: root })) {
    if (/\/(test|fixtures|__snapshots__)\//.test(file) || /\.test\./.test(file)) continue;
    if (
      /(^|[\s:"'`])(-z-\d+\b|z-[1-9]\d*\b|-?z-\[)/m.test(
        fs.readFileSync(new URL(file, new URL('../../../', import.meta.url)), 'utf8'),
      )
    )
      offenders.push(file);
  }
  assert.deepEqual(offenders, [], 'Replace raw z-index utilities with named layers');
});
