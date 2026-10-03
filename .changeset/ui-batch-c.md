---
"@gntik-ai/ui": minor
---

Async + creatable selects, toast actions and promises, a forms adapter and Terminal.

- Combobox, MultiSelect: `loadOptions(query, { signal })` (debounced, stale requests aborted, announced loading / error states with a keyboard-reachable Retry row, empty message) and `onCreate(input)` with a "Create “…”" option. SimpleSelect: `loadOptions` on first open with loading / empty / error states (reopening retries), `items` now optional, `triggerRef`. New `useAsyncOptions` hook.
- Toast: `dismissAction` next to the primary `action`, a `loading` tone, and `toast.promise(task, { loading, success, error })` that updates one toast in place (errors announced assertively).
- New `@gntik-ai/ui/forms` entry: `FormField`, `Form`, `useFieldProps` and a dependency-free `schemaResolver` (zod-compatible) wiring react-hook-form state into Field (label, description, error, aria-invalid, aria-describedby, focus on first invalid). react-hook-form and zod are optional peer dependencies.
- New Terminal: streamed output with ANSI colours mapped to tokens (`parseAnsi`, `stripAnsi`, `ansiClassName`), tail following with "Jump to latest", line numbers, timestamps, wrap, copy all, search highlight, max line buffer, `role="log"` with opt-in aria-live.

**Behaviour change:** `useToast().promise` is now the kit helper: it takes `{ loading, success, error }` as strings, `ToastOptions` or functions of the result, with kit `tone`s, instead of Base UI's `type` / `actionProps` options. It still returns the original promise.
