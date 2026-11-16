import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

test('DataTable editing examples expose loadable previews and their source in the gallery', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { PREVIEW_LOADERS, loadSource } = await server.ssrLoadModule('/src/preview-registry.js');
    for (const id of ['data-table--editable-rows', 'data-table--field-array']) {
      assert.equal(typeof (await PREVIEW_LOADERS.block[id]()).default, 'function');
    }
    const rows = await loadSource('../../../packages/blocks/src/tables/DataTable/examples/editable-rows.tsx');
    assert.match(rows, /onRowsSave/);
    const form = await loadSource('../../../packages/ui/examples/data-table-field-array.tsx');
    assert.match(form, /useFieldArray/);
    assert.match(form, /@gntik-ai\/ui\/forms/);
  } finally {
    await server.close();
  }
});
