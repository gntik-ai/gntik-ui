import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseRoute, resolveRoute, itemForDoc, componentItemForDoc } from '../src/catalog/routes.js';
const kit = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url))).items;
const sections = ['overview', 'ui-components', 'blocks', 'layouts', 'templates', 'chat-components'];
test('documentation pages do not publish additional installable registry items', () => {
  for (const id of [
    'field-array',
    'form-field',
    'match-text',
    'responsive',
    'theme-provider',
    'theme-scope',
    'use-breakpoint',
    'use-clipboard',
    'use-media-query',
  ])
    assert.equal(
      kit.some((item) => item.id === id),
      false,
      `${id} is a documentation route, not a new installable`,
    );
  assert.equal(kit.filter((item) => item.id === 'theme').length, 1);
});
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
test('every UI library doc has a unique resolvable page, including docs without installable items', async () => {
  const docs = fs
    .readdirSync(new URL('../../../packages/ui/src/', import.meta.url), { recursive: true })
    .filter((p) => p.endsWith('.doc.ts') && !p.startsWith('layouts/'));
  const pages = await Promise.all(
    docs.map(async (path) => {
      const registered = itemForDoc(`packages/ui/src/${path}`, kit);
      if (registered) return registered;
      const { doc } = await import(new URL(`../../../packages/ui/src/${path}`, import.meta.url));
      return componentItemForDoc(`packages/ui/src/${path}`, doc, kit);
    }),
  );
  assert.equal(new Set(pages.map((page) => page.id)).size, docs.length);
  for (const page of pages) {
    assert.equal(resolveRoute(parseRoute(`#ui-components/${page.id}`, sections), pages).item.name, page.name);
  }
  for (const [id, name] of [
    ['theme-provider', 'ThemeProvider'],
    ['theme-scope', 'ThemeScope'],
    ['field-array', 'FieldArray'],
  ]) {
    assert.equal(pages.find((page) => page.id === id).name, name);
  }
});
test('registry doc identities take precedence over derived documentation ids', () => {
  const item = { id: 'CaseSensitive', docs: 'packages/ui/src/components/Select/Select.doc.ts' };
  assert.equal(
    componentItemForDoc('../../../../packages/ui/src/components/Select/Select.doc.ts', { name: 'Select' }, [item]),
    item,
  );
});
