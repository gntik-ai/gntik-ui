# Add FormSubmit, FormReset and useFormActions

## Why

Adapter forms currently rebuild pending and dirty controls by hand. A slow submit needs visible, accessible progress and a guard against duplicate requests, including while asynchronous validation runs.

## What Changes

- Add FormSubmit and FormReset on the kit Button in `@gntik-ai/ui/forms`, with localized Save, Discard and submitting labels.
- Guard Form submissions with an in-flight ref, cleared in finally, across button, Enter and imperative submissions.
- Add opt-in `afterSubmit="rebase"` and `afterSubmit="reset"` policies after successful saves; default to `keep` for compatibility. Rebase uses raw `getValues()` inputs rather than transformed resolver output.
- Expose submit, reset, isDirty and isSubmitting through useFormActions. Document the existing StickyActionBar prop bindings without importing blocks into ui.
- Demonstrate pending invitation submission, edit-only dirty controls, save policies and toolbar actions in live docs examples.

## Impact

- Capability: ui/forms (ADDED); no baseline specs or dependencies.
- Risk R1: additive, opt-in API; a minor changeset for `@gntik-ai/ui`.
- Rebase and reset clear touched state and submitCount through form.reset; callers relying on those retain keep.
- Duplicate submissions are ignored until the current validation and save settle.
- Server error mapping, FormDialog, resource-form migration, StickyActionBar API changes and tokens are out of scope.
- Roll back by reverting this ChangeSet or pinning the previous ui minor. A future default of rebase is deferred.
