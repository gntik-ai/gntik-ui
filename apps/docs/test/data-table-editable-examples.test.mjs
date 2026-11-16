import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build, createServer } from 'vite';

test('the field-array preview builds from source without generated UI exports', async () => {
  const uiDist = fileURLToPath(new URL('../../../packages/ui/dist/', import.meta.url));
  const result = await build({
    root: fileURLToPath(new URL('..', import.meta.url)),
    configLoader: 'runner',
    logLevel: 'error',
    plugins: [
      {
        name: 'fresh-ui-checkout',
        enforce: 'pre',
        load(id) {
          if (id.startsWith(uiDist)) throw new Error('The field-array preview must build without packages/ui/dist');
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: fileURLToPath(new URL('../../../packages/ui/examples/data-table-field-array.tsx', import.meta.url)),
      },
    },
  });
  assert.ok(result.output.some((file) => file.type === 'chunk' && file.isEntry));
});

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
