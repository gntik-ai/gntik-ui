import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdKitItem, mdKitList } from '../dist/kit-tools.js';

const item = {
  id: 'pagination-footer',
  kind: 'block',
  name: 'Pagination footer',
  package: '@gntik-ai/blocks',
  group: 'tables',
  status: 'beta',
  description: 'A footer.',
  files: [],
  dependencies: [],
  registryDependencies: [],
  labels: [
    {
      key: 'rangeSummary',
      type: '(from: number, to: number, total: number) => string',
      state: 'Every page and page-size change; polite live region',
    },
  ],
};

test('list_kit and get_block document label keys, formatter signatures and interaction states', () => {
  for (const text of [mdKitList([item], 1), mdKitItem('/tmp', item, { source: false })]) {
    assert.ok(text.includes('`rangeSummary`'));
    assert.ok(text.includes('`(from: number, to: number, total: number) => string`'));
    assert.ok(text.includes('Every page and page-size change; polite live region'));
  }
});
