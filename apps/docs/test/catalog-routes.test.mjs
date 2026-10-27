import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseRoute, resolveRoute, itemForDoc } from '../src/catalog/routes.js';
const kit = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url))).items;
const sections = ['overview', 'ui-components', 'blocks', 'layouts', 'templates', 'chat-components'];
test('bare sections, empty and unknown sections resolve safely', () => {
  assert.deepEqual(parseRoute('#ui-components', sections), { section: 'ui-components', id: null });
  assert.deepEqual(parseRoute('', sections), { section: 'overview', id: null });
  assert.deepEqual(parseRoute('#missing/select', sections), { section: 'overview', id: null });
});
test('item routes resolve case-sensitive registry ids and unknown ids keep the index', () => {
  for (const [section, id, name] of [
    ['ui-components', 'select', 'Select'],
    ['blocks', 'flow-builder', 'Flow builder'],
    ['layouts', 'canvas-layout', 'CanvasLayout'],
    ['templates', 'workflow-builder', 'Flow builder'],
  ]) {
    const route = parseRoute(`#${section}/${id}`, sections);
    assert.equal(route.id, id);
    assert.equal(resolveRoute(route, kit).item.name, name);
  }
  assert.equal(resolveRoute(parseRoute('#ui-components/unknown', sections), kit).notice, 'No component named unknown');
  assert.equal(resolveRoute(parseRoute('#ui-components/Select', sections), kit).item, null);
  assert.equal(resolveRoute(parseRoute('#chat-components/select', sections), kit).item, null);
});
test('every UI library doc maps through its registry doc path, including forms and hooks', () => {
  const docs = fs
    .readdirSync(new URL('../../../packages/ui/src/', import.meta.url), { recursive: true })
    .filter((p) => p.endsWith('.doc.ts') && !p.startsWith('layouts/'));
  for (const doc of docs) assert.ok(itemForDoc(`packages/ui/src/${doc}`, kit), doc);
});
