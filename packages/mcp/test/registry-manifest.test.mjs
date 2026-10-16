import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tsImport } from 'tsx/esm/api';

const root = path.resolve(import.meta.dirname, '../../..');
const gate = await tsImport('../scripts/build-registry-manifest.ts', import.meta.url);
const manifest = gate.buildManifest();
const items = new Map(
  fs
    .readdirSync(path.join(root, 'apps/docs/public/r'))
    .filter((name) => name !== 'registry.json')
    .map((name) => [name, fs.readFileSync(path.join(root, 'apps/docs/public/r', name), 'utf8')]),
);

test('manifest covers the discovered inventory and pinned release snapshot', () => {
  assert.equal(manifest.items.length, 261);
  assert.equal(manifest.releaseCommit, 'b464709587664cf6588df02504fc88c02a7751c5');
  assert.deepEqual(manifest.missingComponents, []);
  assert.deepEqual(gate.validateManifest(manifest, items), []);
});

test('missing and duplicate rows and missing and extra generated items name the row', () => {
  const missing = structuredClone(manifest);
  missing.items = missing.items.filter((row) => row.id !== 'button');
  assert.match(gate.validateManifest(missing, items).join('\n'), /button: missing manifest row/);
  const duplicate = structuredClone(manifest);
  duplicate.items.push(duplicate.items.find((row) => row.id === 'button'));
  assert.match(gate.validateManifest(duplicate, items).join('\n'), /button: duplicate/);
  const changed = new Map(items);
  changed.delete('button.json');
  changed.set('fake-item.json', '{"name":"fake-item"}');
  const errors = gate.validateManifest(manifest, changed).join('\n');
  assert.match(errors, /button: missing generated item/);
  assert.match(errors, /fake-item: unexpected generated item/);
});

test('invalid hosts in dependency and URL fields name the row; source and prose are ignored', () => {
  for (const field of ['dependencies', 'registryDependencies', 'url']) {
    const changed = new Map(items);
    const button = JSON.parse(changed.get('button.json'));
    button[field] = field === 'url' ? 'https://x.invalid/a' : ['alias@https://x.invalid/a'];
    changed.set('button.json', JSON.stringify(button));
    assert.match(gate.validateManifest(manifest, changed).join('\n'), /button: invalid host/);
  }
  const changed = new Map(items);
  const button = JSON.parse(changed.get('button.json'));
  button.docs = 'Example: common.invalid and https://x.invalid are prose.';
  button.files[0].content = 'const example = "https://x.invalid";';
  changed.set('button.json', JSON.stringify(button));
  assert.deepEqual(gate.validateManifest(manifest, changed), []);
});
