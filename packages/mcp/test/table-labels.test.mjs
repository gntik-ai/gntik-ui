import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadKit } from '../dist/kit.js';
import { mdKitList, mdKitItem } from '../dist/kit-tools.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

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
  for (const [id, keys] of Object.entries(expected)) {
    const item = kit.byId.get(id);
    assert.ok(item);
    assert.ok(Array.isArray(item.labels), `${id} must have structured label metadata`);
    const listed = mdKitList([item], 1);
    const detail = mdKitItem(ROOT, item, { source: false });
    for (const key of keys)
      assert.ok(
        item.labels.some((label) => label.key === key),
        `${id}: ${key}`,
      );
    for (const label of item.labels) {
      for (const output of [listed, detail]) {
        assert.ok(output.includes(label.key), `${id}: missing ${label.key}`);
        assert.ok(output.includes(label.type), `${id}: missing type for ${label.key}`);
        assert.ok(output.includes(label.state), `${id}: missing state for ${label.key}`);
      }
    }
    assert.equal(new Set(item.labels.map((label) => label.key)).size, item.labels.length);
  }
});
