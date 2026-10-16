import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tsImport } from 'tsx/esm/api';
const root = path.resolve(import.meta.dirname, '../../..');
const { checkRelease } = await tsImport('../scripts/check-registry-release.ts', import.meta.url);
const { buildManifest, gitFile } = await tsImport('../scripts/build-registry-manifest.ts', import.meta.url);
const manifest = buildManifest();
// PR checkouts are depth 1 without version tags. Only these historical integration
// fixtures require them; the offline manifest tests always run.
let historySkipReason = false;
try {
  gitFile(manifest.releaseCommit, 'apps/docs/public/r/registry.json');
  for (const [pkg, version] of Object.entries(manifest.pinnedVersions)) {
    gitFile(`${pkg}@${version}`, `packages/${pkg.split('/')[1]}/package.json`);
  }
} catch (error) {
  historySkipReason = `Release fixture needs baseline history and version tags: ${error.message}`;
}
const files = new Map(
  manifest.items.map((row) => [
    row.id,
    JSON.parse(fs.readFileSync(path.join(root, `apps/docs/public/r/${row.id}.json`), 'utf8')),
  ]),
);
// Only the public npm boundary is replaced: fixtures are the tagged package artifacts.
const published = async (row) => {
  const dir = `packages/${row.package.split('/')[1]}`;
  return {
    packageJson: JSON.parse(gitFile(`${row.package}@${row.version}`, `${dir}/package.json`).toString()),
    file: (name) => gitFile(`${row.package}@${row.version}`, `${dir}/${name}`),
  };
};

test(
  'pinned release snapshot has expected fidelity counts with tagged fixtures at the npm boundary',
  { skip: historySkipReason },
  async () => {
    const result = await checkRelease(manifest, files, {
      published,
      source: (file) => gitFile(manifest.releaseCommit, file),
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.sourceFiles, 1320);
    assert.equal(result.tarballFiles, 349);
    assert.equal(result.dependencyRanges, 172);
  },
);

test('release differences name the row and source file', { skip: historySkipReason }, async () => {
  const row = manifest.items.find((r) => r.id === 'button');
  const one = { ...manifest, items: [row] };
  const result = await checkRelease(one, files, {
    published,
    source: (file) => Buffer.concat([fs.readFileSync(path.join(root, file)), Buffer.from('\n// changed')]),
  });
  assert.ok(
    result.errors.some((e) => /button: packages\/ui\/src\/components\/Button\/Button.tsx: source differs/.test(e)),
  );
});

test('tarball differences name the row and file', { skip: historySkipReason }, async () => {
  const row = manifest.items.find((r) => r.id === 'kpi-row');
  const result = await checkRelease({ ...manifest, items: [row] }, files, {
    published: async (r) => ({ ...(await published(r)), file: () => Buffer.from('changed tarball') }),
  });
  assert.ok(result.errors.some((e) => /kpi-row: packages\/blocks\/.+: source differs from npm tarball/.test(e)));
});

test(
  'wrong ranges and unexpected bare or builtin dependencies name the row and JSON file',
  { skip: historySkipReason },
  async () => {
    const row = manifest.items.find((r) => r.id === 'button');
    for (const dependency of ['@base-ui/react@^0.0.0', 'unexpected-package', 'node:crypto']) {
      const changed = new Map(files);
      const button = structuredClone(files.get('button'));
      button.dependencies.push(dependency);
      changed.set('button', button);
      const result = await checkRelease({ ...manifest, items: [row] }, changed, { published });
      assert.ok(
        result.errors.some((e) => e.startsWith('button: button.json dependencies') && e.includes(dependency)),
        result.errors.join('\n'),
      );
    }
  },
);
