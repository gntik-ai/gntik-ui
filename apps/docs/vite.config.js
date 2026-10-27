import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const pkg = (name, entry = 'src/index.ts') =>
  fileURLToPath(new URL(`../../packages/${name}/${entry}`, import.meta.url));

const kitAlias = (name, entry) => ({
  find: new RegExp(`^@gntik-ai/${name}$`),
  replacement: pkg(name, entry),
  // Published baseline dependencies must resolve their own published kit graph.
  customResolver(source, importer) {
    if (importer?.includes('/node_modules/')) return createRequire(importer).resolve(`@gntik-ai/${name}`);
    return source;
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The docs render the kit from source (live examples, blocks, templates): one module
    // graph, so React context (theme, toasts, links) is shared and edits hot-reload.
    alias: [
      { find: /^@gntik-ai\/chat\/mermaid$/, replacement: pkg('chat', 'src/mermaid.ts') },
      // monaco-worker-manager still imports the legacy path; Monaco 0.57 exports shorter subpaths.
      {
        find: /^monaco-editor\/esm\/vs\//,
        replacement: fileURLToPath(new URL('./node_modules/monaco-editor/esm/vs/', import.meta.url)),
      },
      ...['ui', 'blocks', 'templates', 'charts', 'chat', 'flow', 'editor'].map((name) => kitAlias(name)),
      kitAlias('icons', 'src/index.tsx'),
    ],
    dedupe: ['react', 'react-dom'],
  },
  worker: { format: 'es' },
  build: {
    // Keep small fonts as same-origin files: data URLs violate font-src 'self'.
    assetsInlineLimit: 0,
    manifest: true,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        builders: fileURLToPath(new URL('./builders.html', import.meta.url)),
        labels: fileURLToPath(new URL('./block-labels.html', import.meta.url)),
        preview: fileURLToPath(new URL('./preview.html', import.meta.url)),
      },
    },
  },
});
