# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/components/DialogsProvider/ (provider, hook, store, views, variants, doc with keyboard table, examples, index) and export it from packages/ui/src/index.ts.
- [x] 1.2 Add dialogs.confirm, dialogs.ok and dialogs.typeToConfirm to the en and es catalogs.
- [x] 1.3 Keep entries and pending records consistent: every settle removes its entry, even when the pending record is gone.
- [x] 1.4 Restore focus only through the popup's finalFocus, coordinated with the remaining stack.

## 2. Tests

- [x] 2.1 DialogsProvider.test.tsx: confirm, alert and prompt results; typed confirmation in en and es; async pending, resolve and reject; open, update and close.
- [x] 2.2 Stacking, focus (opener, menu trigger, returnFocus, the outside-button amendment sequence), closeAll and provider unmount.
- [x] 2.3 StrictMode regression with a confirm() in an effect, after Cancel and after closeAll, plus the non-StrictMode control.
- [x] 2.4 Keyboard rows of the doc and jsdom axe on every example.
- [ ] 2.5 Browser axe in dark, light and high_contrast runs in PR CI.

## 3. Docs and release

- [x] 3.1 Add one minor changeset for @gntik-ai/ui.
- [x] 3.2 Regenerate registry outputs and verify docs coverage.
- [x] 3.3 Run openspec validate add-ui-use-dialogs --strict.
