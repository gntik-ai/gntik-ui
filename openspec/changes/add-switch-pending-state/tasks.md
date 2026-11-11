# Tasks

## 1. Implementation

- [x] 1.1 Add `loading` and `loadingLabel` to packages/ui/src/components/Switch/Switch.tsx: Base UI `readOnly`, `aria-busy`, `Spinner` inside `BaseSwitch.Thumb`, the hidden description.
- [x] 1.2 Add the loading styles to switch.variants.ts and the `switch.saving` key to the en and es catalogs.
- [x] 1.3 Add examples/SwitchPending.tsx and the note in Switch.doc.ts.

## 2. Tests

- [x] 2.1 Switch.test.tsx: blocked click, Space and Enter, focus and Tab, `aria-busy`, the description in en and es, `loadingLabel`, disabled precedence and the unchanged default DOM.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [ ] 3.3 Run `openspec validate add-switch-pending-state --strict` (openspec CLI not available in the worker sandbox).
