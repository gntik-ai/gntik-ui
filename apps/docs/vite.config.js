import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Package examples (packages/*/src) are rendered live; keep one React instance.
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { chunkSizeWarningLimit: 4000 },
});
