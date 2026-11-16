import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../../../', import.meta.url);
const read = (file) => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));

test('data-table copy installs include the header help dependency', () => {
  const kit = read('kit-registry.json').items.find((item) => item.id === 'data-table');
  assert.ok(kit.registryDependencies.includes('info-tip'));
  const copy = read('apps/docs/public/r/data-table.json');
  assert.ok(copy.registryDependencies.includes('https://ui.gntik.ai/r/info-tip.json'));
});
