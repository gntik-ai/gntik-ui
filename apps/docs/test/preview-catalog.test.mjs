import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('block gallery lists installable blocks while Spanish PageHeader remains previewable', async () => {
  const { createServer } = await import('vite');
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { CATALOG, PREVIEW_LOADERS, loadSource } = await server.ssrLoadModule('/src/preview-registry.js');
    const registry = JSON.parse(readFileSync(new URL('../../../kit-registry.json', import.meta.url), 'utf8'));
    assert.deepEqual(
      CATALOG.blocks.map(({ id }) => id).sort(),
      registry.items
        .filter(({ kind }) => kind === 'block')
        .map(({ id }) => id)
        .sort(),
    );
    const preview = await PREVIEW_LOADERS.block['page-header--spanish']();
    assert.equal(typeof preview.default, 'function');
    const source = await loadSource('../../../packages/blocks/src/page-chrome/PageHeader/examples/Spanish.tsx');
    assert.match(source, /I18nProvider locale="es"/);
  } finally {
    await server.close();
  }
});
