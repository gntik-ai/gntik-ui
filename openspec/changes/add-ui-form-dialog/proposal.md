# Add FormDialog and useFormDialog to @gntik-ai/ui

## Why

Every create or edit dialog re-implements the same lifecycle. CreateApiKeyDialog and InviteMembersDialog each keep `loading` and `error` state, ignore closing while loading, reset fields on close and turn a rejection into a message. Nothing in `@gntik-ai/ui` wires a dialog to a form submit, so apps copy that code and drift in focus, pending and reset behaviour.

## What Changes

- Add `FormDialog` to `@gntik-ai/ui` (dialog or, with `variant="drawer"`, drawer) on the kit Dialog and Drawer parts. It needs no form library: `onSubmit(data: FormData)` returns nothing or `true` (close), `false` (stay open, silent), a string (stay open, shown) or a promise of those; a throw or rejection shows its message or `formDialog.failed`.
- While a submit is pending the submit button is `aria-busy`, Cancel is disabled and every user close (Escape, backdrop, close button, drawer swipe, a custom footer's close control) and repeat submit is ignored. A parent-driven close is honoured and the late result is ignored.
- The submit event does not reach an outer form. `onClosed` runs once per close; without `keepMounted` the content unmounts on close.
- Add an optional `keepMounted` prop to `DialogContent` and `DrawerContent`, forwarded to the portal.
- Add `useFormDialog(form, save)` to `@gntik-ai/ui/forms` for react-hook-form.
- Move CreateApiKeyDialog and InviteMembersDialog onto FormDialog with their public props unchanged. Visible changes: the error Alert moves from the bottom to the top of the body, and a parent-driven close now resets the fields because reset moves to `onClosed`.
- Add `formDialog.failed` (en, es) and the example copy in `form-dialog-messages.ts`.

## Impact

- Capability: ui/form-dialog (ADDED). Risk R1, additive for `@gntik-ai/ui`; blocks get a patch changeset.
- Unlike DataTable's `onCellEdit`, `false` is silent here. Closing is blocked while pending, so the docs recommend a request timeout in `onSubmit`.
- Roll back by reverting this ChangeSet or pinning the previous kit release.
