# @gntik-ai/cli

## 0.12.0

### Minor Changes

- 23fe298: Add an opt-in page baseline with themed colours, selection, scrollbars, root isolation and Safari backdrop setup, and include it during project initialization.

### Patch Changes

- c5a09ab: `gntik-ui add` and `eject` now recommend the real hook names from `@gntik-ai/ui/hooks` for the ui-hooks item instead of a nonexistent `Hooks` export.
- 3283108: Add KitProvider and useApp with scoped settings, subtree-safe nested themes, shared app actions and portal destinations including full-screen file drops, and scaffold KitProvider roots.

## 0.5.0

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.

## 0.2.0

### Minor Changes

- 869507c: `@gntik-ai/codemods` (jscodeshift transforms for the breaking changes so far: renamed template ids, FlowBuilder controlled console, chip-text aliases, Link underline report) and `gntik-ui upgrade` (dry run by default; `--apply`, `--from/--to`, `--codemod`, `--list`, `--json`).
- fc405b4: `falconePreset` (placeholder monogram until the Falcone logo lands); `gntik-ui init --brand falcone`.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
