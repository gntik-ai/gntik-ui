# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/hooks/index.ts, the `hooks` tsdown entry, the `./hooks` package export and `export * from './hooks'` in the root.
- [x] 1.2 Add `HookDoc`, a `.doc.ts` and an example per hook, and the "Adding a hook" section in CONTRIBUTING.md.
- [x] 1.3 Register the `ui-hooks` item in the registry builder and regenerate the registry.
- [x] 1.4 Add the Library > Hooks docs page and its catalog entry.
- [x] 1.5 Import the five generic hooks from `@gntik-ai/ui/hooks` in apps/example-vite and apps/example-next.

## 2. Tests

- [x] 2.1 Dist test: subpath and root identity for all five hooks, the `'use client'` banner, useToast under a root ToastProvider and a single-hook bundle without Toast or Combobox code.
- [x] 2.2 HookDoc coverage test and a `renderToString` test over the hook examples.
- [x] 2.3 CLI test that finds `ui-hooks` with `search hook`.
- [ ] 2.4 Run browser accessibility suites in PR CI.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-ui-hooks-entry --strict`.
