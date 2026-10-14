import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import docs from './vite.config.js';

const require = createRequire(new URL('./package.json', import.meta.url));
for (const name of ['blocks', 'ui']) {
  const manifest = JSON.parse(fs.readFileSync(require.resolve(`@gntik-ai/${name}-baseline/package.json`), 'utf8'));
  if (manifest.version !== '0.5.0') throw new Error(`Wrong ${name} baseline version: ${manifest.version}`);
}
const baselineBlocks = path.dirname(require.resolve('@gntik-ai/blocks-baseline'));
const baselineUi = require.resolve('@gntik-ai/ui-baseline');

export default defineConfig({
  ...docs,
  resolve: {
    ...docs.resolve,
    alias: docs.resolve.alias.map((entry) =>
      entry.find.test('@gntik-ai/ui')
        ? {
            ...entry,
            // Published blocks must render with published UI; current source keeps its own UI context.
            customResolver: (_source, importer) =>
              importer?.startsWith(`${baselineBlocks}/`) ? baselineUi : entry.replacement,
          }
        : entry,
    ),
  },
  build: {
    ...docs.build,
    outDir: 'node_modules/.cache/dist-labels',
    rollupOptions: { input: { labels: fileURLToPath(new URL('./e2e/fixtures/block-labels.html', import.meta.url)) } },
  },
});
