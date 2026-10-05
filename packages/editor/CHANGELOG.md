# @gntik-ai/editor

## 0.2.0

### Minor Changes

- d8de1ff: First component release: `@gntik-ai/ui` P1 components on Base UI with ThemeProvider and brand presets; icons, charts, flow and editor packages; contrast-safe pairing aliases and the runtime token adapter in `@gntik-ai/tokens`.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.

### Patch Changes

- f4638d1: Syntax colours keep their hue but are mixed toward the theme foreground until they reach AA on the editor background (green, amber, cyan and rose fell to 2–4:1 on the light theme).
- Updated dependencies [cf544b8]
- Updated dependencies [d8de1ff]
- Updated dependencies [cdeb737]
- Updated dependencies [ad65d0e]
  - @gntik-ai/tokens@0.2.0
