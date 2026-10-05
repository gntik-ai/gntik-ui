# @gntik-ai/tokens

## 0.2.0

### Minor Changes

- cf544b8: Density modes: `density.css` tokens and Tailwind utilities (`h-control`, `h-row`…), `DensityProvider`/`useDensity` (`compact | comfortable`), and `size: 'auto'` defaults so controls, tables and tabs follow the active density.
- d8de1ff: First component release: `@gntik-ai/ui` P1 components on Base UI with ThemeProvider and brand presets; icons, charts, flow and editor packages; contrast-safe pairing aliases and the runtime token adapter in `@gntik-ai/tokens`.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
- ad65d0e: Token export: `@gntik-ai/tokens/tokens.json` (W3C DTCG), `figma-variables.json` (Figma Variables, 3 modes) and typed constants (`@gntik-ai/tokens/tokens`). Motion tokens (`motion.css`: durations and easings, zero under reduced motion) bridged to `ease-*` / `duration-fast|normal|slow` utilities; default transitions use them.
