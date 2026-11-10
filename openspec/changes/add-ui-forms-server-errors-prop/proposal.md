# Add a server-errors prop to Form

## Why

Errors only the backend knows (name taken, quota exceeded) have to be pushed with `form.setError`, then focused and cleared by hand. HeroUI, Base UI and Radix take a field-to-message map, show it at once and clear each message when its field changes. Six earlier deliveries failed on races between asynchronous validation, new errors, submit, reset and watch notifications, so the state model is fixed by the operator decision of 2026-11-09 and replaces the original `setError` and `root.server` mechanism.

## What Changes

- `Form` gets `errors?: Record<string, string | readonly string[] | null | undefined>`, keyed by react-hook-form field paths, applied when the object's identity changes.
- Server errors live in a library-owned per-field store (message, value snapshot, generation) outside react-hook-form's error state. `setError` and `clearErrors` are not used for them.
- A field shows its server message and `aria-invalid` while the error is active, otherwise its client error. Both can exist; the client error stays in react-hook-form state.
- An error clears only when the field's current value differs from its snapshot, and stays cleared. Edits are detected by comparing the value from `useController`, never from unnamed watch or subscribe events.
- A new `errors` object, a submit and every reset path bump the generation. Reset goes through one library function used by `FormReset`, `afterSubmit` and consumers' `form.reset()` (intercepted for the Form's lifetime, restored on unmount, arguments and result unchanged), and clears all server errors.
- Validators, resolvers and `rules.validate` are never wrapped or post-processed. There is no validation guard and no tagging of validation results by generation; no validation result sets, restores or clears a server error.
- Keys that are `''` or match no mounted FormField (fields register their names with the store) go to a root entry, shown by the new `FormRootError` (destructive Alert, `role="alert"`, nothing while empty).
- After an errors object commits, the first errored field in document order (`compareDocumentPosition`) receives focus through its registered control ref, only while focus is inside the form or on the body.
- A FormServerErrors example, docs text, en and es strings in a split catalog file.

## Impact

- Capability: ui/forms (ADDED); no baseline specs or dependencies.
- Risk R1: additive and optional; with `errors` unset Form behaves as today. A minor changeset for `@gntik-ai/ui`. Roll back by reverting or pinning the previous ui minor.
- A caller that builds `errors` on every render re-applies it and moves focus each time; keep the map in state.
- Messages clear on the first edit, before the value is fixed; a re-submit validates again.
- A path with no mounted FormField falls back to FormRootError: visible but less precise.
- Out of scope: a native Base UI Form without react-hook-form, converting API formats into the map, pending submit buttons, error summaries, `onSubmit` resolving to an errors map, and any change to resolvers, `schemaResolver`, `rules.validate` or how react-hook-form computes `isValid`, `isValidating` or `onInvalid`.
