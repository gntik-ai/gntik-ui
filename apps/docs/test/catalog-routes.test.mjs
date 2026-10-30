import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRoute, routeHash } from '../src/catalog/routes.js';

const sections = ['overview', 'ui-components', 'blocks', 'layouts', 'templates'];
const items = [
  { section: 'ui-components', id: 'select', name: 'Select', folder: 'Select' },
  { section: 'layouts', id: 'canvas-layout', name: 'CanvasLayout' },
];

test('section and item hashes resolve on direct loads and history changes', () => {
  assert.deepEqual(parseRoute('#ui-components', sections, items), { section: 'ui-components', id: null, item: null });
  assert.deepEqual(parseRoute('#ui-components/select', sections, items), {
    section: 'ui-components',
    id: 'select',
    item: items[0],
  });
  assert.equal(parseRoute('#layouts/canvas-layout', sections, items).item.name, 'CanvasLayout');
  assert.equal(routeHash('ui-components', 'select'), '#ui-components/select');
  assert.equal(routeHash('blocks'), '#blocks');
});

test('unknown items retain their section and id for a named notice', () => {
  assert.deepEqual(parseRoute('#ui-components/unknown', sections, items), {
    section: 'ui-components',
    id: 'unknown',
    item: null,
  });
  assert.equal(parseRoute('#blocks/unknown', sections, items).section, 'blocks');
});

test('legacy folder anchors open the matching component page', () => {
  assert.deepEqual(parseRoute('#ui-Select', sections, items), parseRoute('#ui-components/select', sections, items));
});

test('malformed and unknown section hashes fall back safely', () => {
  for (const hash of [
    '#no-section/select',
    '#ui-components/select/extra',
    '#ui-components/%E0%A4%A',
    '#ui-components/',
    '#ui-components/%2F',
    '#overview/select',
  ]) {
    assert.deepEqual(parseRoute(hash, sections, items), { section: 'overview', id: null, item: null }, hash);
  }
});
