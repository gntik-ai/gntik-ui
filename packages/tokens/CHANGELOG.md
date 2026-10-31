# @gntik-ai/tokens

## 0.4.0

### Minor Changes

- 01125b0: Add an in-app reduced-motion preference, scoped motion utilities and an appearance settings switch.
- e12e80a: Add named z-index layers and move kit overlays and sticky surfaces onto them; toasts and popups stay above modals, and app z-50 now sits under kit overlays.
- 3860511: Add eleven named typography roles, Tailwind utilities and design-tool exports, and adopt them in Text and Heading.
  
  Font-size overrides through Text or Heading className now replace the entire role, including its weight, tracking and leading defaults. Add explicit utilities to keep those styles, for example `text-[32px] font-bold tracking-tight` for display text or `text-[12px] font-medium leading-tight` for labels. Preserve the sign-in brand headline's bold weight and tight tracking at its custom size.
- e7d905b: Add selectable green and navy palettes with scoped themes, optional persistence and palette-aware runtime updates; individual pairing/scope CSS imports now require status.css, and palette files require scope.css for aliases and nested themes.
- 36ea76d: Add interactive and disabled cursor tokens across UI controls; upgrade UI with the matching tokens minor, set `:root { --cursor-interactive: default }` to restore arrows, and note that disabled Buttons now receive pointer events rather than allowing click-through while remaining inert and suppressing hover styles.
- cd9b1bd: Add SSR-safe media query and breakpoint hooks with shared breakpoint tokens, and use them for responsive panels and reduced-motion behaviour. Preserve upward log scrolling when wrapped rows finish measuring.
- 8a8df93: Add shared data-tone colour utilities and use them in Badge, Alert, Token and Progress while preserving existing colours.
- b2e70bb: Add keyboard-only focus-ring and focus-ring-inset utilities and migrate kit outlines; upgrade @gntik-ai/tokens to this minor release before copying migrated registry sources.

## 0.3.0

### Minor Changes

- 3b5e0b0: Add ThemeScope with themed overlays, per-scope color schemes and ThemeProvider forcedMode; the new .light selector also applies kit tokens to existing elements using that class.

## 0.2.1

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.

## 0.2.0

### Minor Changes

- cf544b8: Density modes: `density.css` tokens and Tailwind utilities (`h-control`, `h-row`…), `DensityProvider`/`useDensity` (`compact | comfortable`), and `size: 'auto'` defaults so controls, tables and tabs follow the active density.
- d8de1ff: First component release: `@gntik-ai/ui` P1 components on Base UI with ThemeProvider and brand presets; icons, charts, flow and editor packages; contrast-safe pairing aliases and the runtime token adapter in `@gntik-ai/tokens`.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
- ad65d0e: Token export: `@gntik-ai/tokens/tokens.json` (W3C DTCG), `figma-variables.json` (Figma Variables, 3 modes) and typed constants (`@gntik-ai/tokens/tokens`). Motion tokens (`motion.css`: durations and easings, zero under reduced motion) bridged to `ease-*` / `duration-fast|normal|slow` utilities; default transitions use them.
