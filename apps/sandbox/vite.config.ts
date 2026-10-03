import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { themeScript } from '@gntik-ai/ui';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
// Monaco is a dependency of @gntik-ai/editor, not of the sandbox: resolve its worker entries from there.
const monaco = realpathSync(here('./node_modules/@gntik-ai/editor/node_modules/monaco-editor'));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inlines the theme script in <head> of both pages so the stored theme applies before first paint.
    { name: 'gntik-theme', transformIndexHtml: () => [{ tag: 'script', children: themeScript(), injectTo: 'head-prepend' }] },
  ],
  resolve: {
    alias: [
      { find: /^sandbox-monaco-worker\/editor/, replacement: `${monaco}/esm/vs/editor/editor.worker.js` },
      { find: /^sandbox-monaco-worker\/typescript/, replacement: `${monaco}/esm/vs/language/typescript/ts.worker.js` },
    ],
    // One React for the app, the kit packages and the user code evaluated in the preview.
    dedupe: ['react', 'react-dom'],
  },
  worker: { format: 'es' },
  build: {
    chunkSizeWarningLimit: 8000,
    rollupOptions: { input: { main: here('./index.html'), preview: here('./preview.html') } },
  },
});
