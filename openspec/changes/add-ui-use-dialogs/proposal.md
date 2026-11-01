# Add DialogsProvider and useDialogs

## Why

Every confirmation is a controlled AlertDialog with its own open state. AlertDialogAction closes at
once, so an async action has no pending state, and a dialog started from a row menu loses its focus
target when the menu closes. Console lists start revoke, delete, rotate and cancel actions from row
menus, and each needs mounted dialog state next to the menu.

## What changes

- Add DialogsProvider and useDialogs() to @gntik-ai/ui, returning confirm, alert, prompt, open,
  update, close and closeAll. confirm and alert use the kit AlertDialog; prompt and the custom-dialog
  surface use the kit Dialog, Field, Input, Button and Alert.
- confirm supports tone (destructive by default), labels, typeToConfirm, an async onConfirm with a
  pending state and an inline error, and returnFocus.
- Dialogs stack in call order. Only the topmost acts on Escape. Focus returns through the popup's
  finalFocus, never through a timer, and reaches the opener of the first dialog only when the stack
  is empty.
- Dialog entries and pending promise records live in one store. Every settle, Cancel, closeAll and
  provider unmount removes the entry in the same commit, so StrictMode effect replay leaves no orphan.
- Add catalog keys dialogs.confirm, dialogs.ok and dialogs.typeToConfirm (en and es).
- Add five catalog examples, a keyboard table, public API tests, a minor changeset and regenerated
  registry outputs.

## Scope and risk

- Change id: add-ui-use-dialogs. Capability: ui/hooks/use-dialogs (ADDED).
- R1: additive and opt-in; nothing changes until an app mounts DialogsProvider. Revert or pin the
  previous @gntik-ai/ui to roll back.
- A custom open() component that never calls onClose leaves its promise pending until closeAll() or
  unmounting the provider. The typed confirmation now also exists in the ConfirmDestructive block, so
  fixes must be made in both until the block is migrated.
- Open question: confirm keeps the destructive tone by default, matching AlertDialogHeader.
- Not in scope: the confirm popover, form dialogs, moving ConfirmDestructive, DangerZone or the
  settings-api-keys template onto the provider, a pending state on AlertDialogAction, and calls from
  outside React.
