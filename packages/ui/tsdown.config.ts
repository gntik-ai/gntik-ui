import { defineConfig } from 'tsdown';

export default defineConfig({
  // `theme-script` is a server-safe entry (no React): `@gntik-ai/ui/theme-script`.
  // `hooks` is the tree-shakable `@gntik-ai/ui/hooks` entry; the root re-exports the same functions.
  // Optional peers are isolated in `forms` and `code-highlight-shiki`.
  entry: {
    index: 'src/index.ts',
    'theme-script': 'src/theme/theme-script.ts',
    hooks: 'src/hooks/index.ts',
    forms: 'src/forms/index.ts',
    'code-highlight-shiki': 'src/code-highlight-shiki/index.ts',
  },
  format: ['esm'],
  // Keep one output file per source module: the entries share no merged chunk, so a consumer's
  // bundler drops whole modules (importing only `useFitCount` from `./hooks` ships no Toast code).
  unbundle: true,
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true,
  // Keep the "use client" banner so the package works in React Server Component apps,
  // except on the theme-script entry, which a Server Component must be able to call.
  banner: ({ fileName }) => (/^theme-script\.(js|d\.ts)$/.test(fileName) ? undefined : { js: "'use client';" }),
});
