import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const pkg = (name, entry = 'src/index.ts') => fileURLToPath(new URL(`../../packages/${name}/${entry}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The docs render the kit from source (live examples, blocks, templates): one module
    // graph, so React context (theme, toasts, links) is shared and edits hot-reload.
    alias: [
      ...['ui', 'blocks', 'templates', 'charts', 'chat', 'flow', 'editor'].map((name) => ({
        find: new RegExp(`^@gntik-ai/${name}$`),
        replacement: pkg(name),
      })),
      { find: /^@gntik-ai\/icons$/, replacement: pkg('icons', 'src/index.tsx') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        preview: fileURLToPath(new URL('./preview.html', import.meta.url)),
      },
    },
  },
});
