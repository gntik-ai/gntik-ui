# Tasks

## 1. Implementation

- [x] 1.1 Add and export FormSubmit, FormReset and useFormActions from the forms entry point.
- [x] 1.2 Add the ref-based in-flight guard and afterSubmit policies to Form, resetting the guard in finally.
- [x] 1.3 Add form.submitting and example strings to the en and es catalogs through form-action-messages.ts.
- [x] 1.4 Use FormSubmit in FormInviteMember and demonstrate disableWhenClean, all save policies, FormReset and toolbar actions in FormEditSettings.
- [x] 1.5 Document the StickyActionBar recipe using dirty, saving, onSave and onCancel from useFormActions.

## 2. Tests

- [x] 2.1 Cover pending focus, spinner and announcement; repeated native, Enter and imperative submissions; async validation failure, focus and retry.
- [x] 2.2 Cover dirty toggling, transformed raw-input rebase, reset, rejection and retry, reset errors, development-only fallback warnings and Spanish labels.
- [x] 2.3 Cover toolbar Save and Discard and useFormActions outside Form at public React interfaces.
- [x] 2.4 Run jsdom axe on the invitation and edit settings examples in dark, light and high_contrast.
- [ ] 2.5 Run browser axe in all three themes in PR CI; browser suites are excluded from this worker.

## 3. Docs and release

- [x] 3.1 Retain the single minor changeset for @gntik-ai/ui.
- [x] 3.2 Regenerate pnpm registry output and verify registry:check and docs coverage (generated output already matches the existing commits).
- [x] 3.3 Run openspec validate add-ui-forms-form-submit-button --strict.
- [x] 3.4 Run the bounded library build, lint, typecheck, unit tests and consumer kit-only checks. All pass except the untouched tokens mirror-install test, skipped after retry confirmed the offline ENOENT at test/mirror-install.test.mjs:93; the remaining library suites pass with tokens excluded.
