import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadKit } from '../dist/kit.js';
import { mdKitList, mdKitItem } from '../dist/kit-tools.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

test('label metadata preserves the existing block summaries in list_kit and llms.txt', () => {
  // Original summaries from dde54ce; label signatures must not become the catalog copy.
  const summaries = {
    'data-table': 'Generic typed table: sortable headers with aria-sort,',
    'filter-bar':
      'Search Input, saved views Select, an Add filter Menu with multi-select per field, removable filter chips and Clear all.',
    'pagination-footer':
      'Table footer with a rows-per-page Select, a "1–10 of 97" summary and numbered Pagination; controlled or uncontrolled.',
  };
  const kit = loadKit(ROOT);
  const index = fs.readFileSync(path.join(ROOT, 'apps/docs/public/llms.txt'), 'utf8');
  for (const [id, summary] of Object.entries(summaries)) {
    const item = kit.byId.get(id);
    assert.ok(item);
    assert.ok(item.description.startsWith(summary), `${id}: original description`);
    const listing = mdKitList([item], 1)
      .split('\n')
      .find((line) => line.startsWith(`- \`${id}\``));
    assert.ok(listing?.includes(`): ${summary}`), `${id}: list_kit summary`);
    const entry = index.split('\n').find((line) => line.endsWith(`id \`${id}\`)`));
    assert.ok(entry?.includes(`): ${summary}`), `${id}: llms.txt summary`);
  }
});

test('list_kit and get_block expose every label key, type and interaction state', () => {
  const expected = {
    'pagination-footer': ['rowsPerPage', 'rangeSummary', 'pagination', 'previous', 'next', 'page'],
    'filter-bar': [
      'region',
      'search',
      'placeholder',
      'savedView',
      'savedViews',
      'addFilter',
      'activeFilters',
      'filters',
      'clearAll',
      'removeFilter',
      'resultCount',
    ],
    'data-table': [
      'columnMenu.trigger',
      'density.compact',
      'views.close',
      'selection.selectedCount',
      'grouping.selectGroup',
      'edit.maximum',
      'pagination.rangeSummary',
    ],
  };
  const kit = loadKit(ROOT);
  const fullDocs = fs.readFileSync(path.join(ROOT, 'apps/docs/public/llms-full.txt'), 'utf8');
  for (const [id, keys] of Object.entries(expected)) {
    const item = kit.byId.get(id);
    assert.ok(item);
    assert.ok(Array.isArray(item.labels), `${id} must have structured label metadata`);
    const listed = mdKitList([item], 1);
    const detail = mdKitItem(ROOT, item, { source: false });
    const fullEntry = fullDocs.split(`### ${item.name} (\`${id}\`)`)[1]?.split('\n### ')[0];
    assert.ok(detail.includes('## Labels\n'), `${id}: get_block labels section`);
    assert.ok(fullEntry?.includes('Labels:\n'), `${id}: llms-full labels section`);
    for (const key of keys)
      assert.ok(
        item.labels.some((label) => label.key === key),
        `${id}: ${key}`,
      );
    for (const label of item.labels) {
      for (const output of [listed, detail, fullEntry]) {
        assert.ok(output);
        assert.ok(output.includes(label.key), `${id}: missing ${label.key}`);
        assert.ok(output.includes(label.type), `${id}: missing type for ${label.key}`);
        assert.ok(output.includes(label.state), `${id}: missing state for ${label.key}`);
      }
    }
    assert.equal(new Set(item.labels.map((label) => label.key)).size, item.labels.length);
  }
});
