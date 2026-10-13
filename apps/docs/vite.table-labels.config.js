import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import base from './vite.config.js';

// This site is built only by the browser matrix runner, never by the docs build.
export default defineConfig({
  ...base,
  resolve: {
    ...base.resolve,
    alias: base.resolve.alias.map((alias) =>
      process.env.TABLE_LABELS_BASELINE_SOURCE && alias.find.test('@gntik-ai/blocks')
        ? { ...alias, replacement: process.env.TABLE_LABELS_BASELINE_SOURCE }
        : alias,
    ),
  },
  build: {
    ...base.build,
    rollupOptions: {
      input: { tableLabels: fileURLToPath(new URL('./table-labels.html', import.meta.url)) },
    },
  },
});
