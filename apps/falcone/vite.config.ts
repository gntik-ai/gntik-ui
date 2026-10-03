import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { themeScript } from '@gntik-ai/ui';
import { defineConfig } from 'vite';

/** Same key as <ThemeProvider storageKey> in src/main.tsx. */
export const THEME_KEY = 'falcone-theme';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Inline the kit's theme script in <head> so the stored theme applies before first paint.
      name: 'falcone-theme-script',
      transformIndexHtml: () => [{ tag: 'script', children: themeScript(THEME_KEY, 'dark'), injectTo: 'head-prepend' }],
    },
  ],
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { chunkSizeWarningLimit: 4000 },
});
