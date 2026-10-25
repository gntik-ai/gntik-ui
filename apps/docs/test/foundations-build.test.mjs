import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'vite';

const docsRoot = fileURLToPath(new URL('..', import.meta.url));
const tokensDist = fileURLToPath(new URL('../../../packages/tokens/dist/', import.meta.url));

test('foundations builds from source without generated token exports', async () => {
  const result = await build({
    root: docsRoot,
    configLoader: 'runner',
    logLevel: 'error',
    plugins: [
      {
        name: 'fresh-token-checkout',
        enforce: 'pre',
        load(id) {
          // Model a fresh install at the filesystem boundary, even after library builds ran.
          if (id.startsWith(tokensDist)) throw new Error('Docs must build without packages/tokens/dist');
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: fileURLToPath(new URL('../src/catalog/foundations.jsx', import.meta.url)) },
    },
  });
  assert.ok(result.output.some((file) => file.type === 'chunk' && file.isEntry));
});
