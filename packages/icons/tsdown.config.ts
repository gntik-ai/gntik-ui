import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true,
  // Keep the "use client" banner so the package works in React Server Component apps.
  banner: { js: "'use client';" },
});
