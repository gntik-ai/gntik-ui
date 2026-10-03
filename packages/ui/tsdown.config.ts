import { defineConfig } from 'tsdown';

export default defineConfig({
  // `theme-script` is a server-safe entry (no React): `@gntik-ai/ui/theme-script`.
  // `forms` (`@gntik-ai/ui/forms`) is the only entry that imports react-hook-form (optional peer).
  entry: { index: 'src/index.ts', 'theme-script': 'src/theme/theme-script.ts', forms: 'src/forms/index.ts' },
  format: ['esm'],
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true,
  // Keep the "use client" banner so the package works in React Server Component apps,
  // except on the theme-script entry, which a Server Component must be able to call.
  banner: ({ fileName }) => (/^theme-script\.(js|d\.ts)$/.test(fileName) ? undefined : { js: "'use client';" }),
});
