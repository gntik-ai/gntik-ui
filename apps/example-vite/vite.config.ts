import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { themeScript } from '@gntik-ai/ui';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inlines the theme script in <head> so the stored theme applies before first paint.
    { name: 'gntik-theme', transformIndexHtml: () => [{ tag: 'script', children: themeScript(), injectTo: 'head-prepend' }] },
  ],
  // One React for the app and the kit packages (workspace links).
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { chunkSizeWarningLimit: 4000 },
});
