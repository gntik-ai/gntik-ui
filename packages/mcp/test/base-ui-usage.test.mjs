import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadKit, usageOf } from '../dist/kit.js';

const root = fileURLToPath(new URL('../../..', import.meta.url));

test('toggle controls keep representative canonical usage alongside label-precedence demos', () => {
  const kit = loadKit(root);
  for (const [id, example] of [
    ['checkbox', 'CheckboxList.tsx'],
    ['switch', 'SwitchSettings.tsx'],
    ['radio-group', 'RadioGroupCards.tsx'],
  ]) {
    const item = kit.byId.get(id);
    assert.ok(item);
    const usage = usageOf(root, item);
    assert.equal(usage.source, 'example');
    assert.equal(path.posix.basename(usage.file), example);
  }
});
