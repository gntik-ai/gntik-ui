# Tasks

## 1. Implementation

- [x] 1.1 Add the server-error store (message, snapshot, generation per path, plus a root entry) in packages/ui/src/forms/serverErrors.ts and expose it to FormField through context.
- [x] 1.2 Add `errors` to `Form`: apply on identity change, focus the first errored field after commit, route unregistered keys and `''` to the root entry.
- [x] 1.3 Show the server message and invalid state in useFieldProps, clearing on the first edit by comparing the useController value with the snapshot.
- [x] 1.4 Route FormReset, afterSubmit and consumer `form.reset()` through one library reset that bumps the generation; install the interceptor for the Form's lifetime and restore it on unmount.
- [x] 1.5 Add FormRootError and export it, with the FormServerErrors type, from the forms entry point.
- [x] 1.6 Add the FormServerErrors example, the docs text and en and es strings in form-server-error-messages.ts.

## 2. Tests

- [x] 2.1 Cover message, aria-invalid, description and focus; document-order focus; no focus steal; clear on edit and no restore on revert; nested path; array and empty values; root fallback and next submit; identity semantics; StrictMode.
- [x] 2.2 Cover each race with a deferred validation held and released after the trigger: a new errors object, submit, `reset()`, `reset(undefined, { keepIsSubmitted: true })`, FormReset, an edit to another field under mode all with an active watch, a revert to the snapshot, a change validation resolving after a new errors object, and a `rules.deps` edit on another field.
- [x] 2.3 Prove the original reset is restored on unmount and arguments and result pass through unchanged.
- [x] 2.4 Run jsdom axe on FormServerErrors in dark, light and high_contrast; browser axe runs in PR CI.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated output.
- [x] 3.3 Run `openspec validate add-ui-forms-server-errors-prop --strict`.
