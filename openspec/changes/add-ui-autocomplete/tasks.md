# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/components/Autocomplete/ (Autocomplete.tsx, autocomplete.variants.ts, Autocomplete.doc.ts, examples: sync regions, async hosts, grouped, inline completion; index.ts) and export it from packages/ui/src/index.ts.
- [x] 1.2 Reuse `useAsyncOptions`, `retryItem` and `isSpecialItem` from Combobox and `selectVariants().groupLabel`; add no slots to `comboboxVariants`.
- [x] 1.3 Add `autocomplete.refine` and the example messages in autocomplete-messages.ts (en, es) and move `combobox.create` and `combobox.loadFailed` into it.

## 2. Tests

- [x] 2.1 Autocomplete.test.tsx: free text on Tab and blur, form submit, keyboard and pointer picks, Escape (including an enclosing Dialog), groups, limit in en and es, inline completion, clearable, Field wiring, every doc keyboard row, axe on the examples in three themes.
- [x] 2.2 Autocomplete.async.test.tsx: debounce, abort of stale requests, loading and error status, Retry, limit, stale results never complete.
- [x] 2.3 Escape after a keyboard or pointer pick reaches an enclosing Dialog (`allowPropagation`); the invalid test reads the computed border instead of a class; apps/docs/e2e/autocomplete.a11y.spec.js checks the painted border in dark, light and high_contrast.

## 3. Docs and release

- [x] 3.1 Add the when-to-use sentence to the Autocomplete and Combobox docs.
- [x] 3.2 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.3 Run `pnpm registry` and commit the generated files.
- [x] 3.4 Run `openspec validate add-ui-autocomplete --strict`.
