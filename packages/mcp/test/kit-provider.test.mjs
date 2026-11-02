import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadKit, usageOf } from '../dist/kit.js';
import { scaffoldPage, scaffoldPreset } from '../dist/scaffold.js';

const root = fileURLToPath(new URL('../../..', import.meta.url));

test('KitProvider is discoverable with a working app actions example', () => {
  const kit = loadKit(root);
  const item = kit.byId.get('kit-provider');
  assert.ok(item);
  assert.equal(item.docs, 'packages/ui/src/kit/KitProvider.doc.ts');
  const usage = usageOf(root, item);
  assert.match(usage.code, /useApp/);
  assert.match(usage.code, /<KitProvider/);
});

test('page and preset scaffolds recommend the KitProvider root', () => {
  const kit = loadKit(root);
  const page = scaffoldPage(kit, { template: 'resource-index', route: '/projects' });
  assert.ok(page.notes.some((note) => note.includes('<KitProvider theme={{ brand: yourPreset }}>')));
  const preset = scaffoldPreset({ name: 'Example' });
  assert.ok(preset.notes.some((note) => note.includes('<KitProvider theme={{ brand: examplePreset }}>')));
});
