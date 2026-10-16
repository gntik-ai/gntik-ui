import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
const snapshot = JSON.parse(
  fs.readFileSync(path.join(root, 'packages/mcp/registry-release-snapshot.json'), 'utf8'),
);
// Components added after the pinned release are discovered and registered, but are not in
// its snapshot; the manifest names them in missingComponents until a maintainer advances
// the pins (docs/governance/release.md).
const addedSinceRelease = (rows) => rows.map((row) => row.id).filter((id) => !snapshot.itemNames.includes(id));

test('manifest generation and validation work offline without release history', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gntik-manifest-'));
  try {
    for (const pkg of ['ui', 'chat', 'blocks', 'templates']) {
      fs.cpSync(path.join(root, `packages/${pkg}/src`), path.join(dir, `packages/${pkg}/src`), {
        recursive: true,
      });
    }
    fs.cpSync(path.join(root, 'packages/mcp/scripts'), path.join(dir, 'packages/mcp/scripts'), {
      recursive: true,
    });
    for (const name of fs.readdirSync(path.join(root, 'packages/mcp'))) {
      if (/^registry-.*\.json$/.test(name)) {
        fs.copyFileSync(path.join(root, 'packages/mcp', name), path.join(dir, 'packages/mcp', name));
      }
    }
    fs.cpSync(path.join(root, 'apps/docs/public/r'), path.join(dir, 'apps/docs/public/r'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    const offline = await tsImport(path.join(dir, 'packages/mcp/scripts/build-registry-manifest.ts'), import.meta.url);
    const generated = offline.buildManifest();
    assert.equal(generated.items.length, items.size);
    assert.deepEqual(offline.validateManifest(generated, items), []);
    assert.equal(
      offline.serializeManifest(generated),
      fs.readFileSync(path.join(dir, 'packages/mcp/registry-manifest.json'), 'utf8'),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('manifest covers the discovered inventory and pinned release snapshot', () => {
  // One row per registry item (gntik-tokens included), at least the 261 of the pinned release.
  assert.equal(manifest.items.length, items.size);
  assert.ok(manifest.items.length >= 261);
  assert.equal(manifest.releaseCommit, 'b464709587664cf6588df02504fc88c02a7751c5');
  assert.equal(snapshot.releaseCommit, manifest.releaseCommit);
  // Every snapshot item is still discovered; only components added since the release are missing.
  const ids = new Set(manifest.items.map((row) => row.id));
  assert.deepEqual(snapshot.itemNames.filter((name) => !ids.has(name)), []);
  assert.deepEqual(manifest.missingComponents, addedSinceRelease(manifest.items));
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
