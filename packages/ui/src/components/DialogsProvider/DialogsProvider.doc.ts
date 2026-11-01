import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DialogsProvider',
  group: 'Overlays',
  status: 'stable',
  description:
    'Opt-in host for promise-based dialogs. Mount DialogsProvider once and call useDialogs() anywhere below it: `await confirm(message, options)` resolves a boolean, `alert` resolves once acknowledged, `prompt` resolves the entered text or null, and `open(Component, payload)` renders your own dialog and resolves with the value passed to `onClose`. `update(dialog, payload)` re-renders an open dialog, `close(dialog, result)` resolves it and `closeAll()` (or unmounting the provider) resolves every open dialog with its cancel value: false, null or undefined. Confirmations support a typed confirmation and an async `onConfirm` that keeps the dialog open with a pending button and shows a failure inline. Dialogs stack in call order; only the topmost acts on Escape. Focus returns to `returnFocus`, else to the element focused when the call was made, else to the trigger of the menu that started it, and only once the stack is empty. A custom `open()` component that never calls `onClose` leaves its promise pending until `closeAll()` or unmount; keep the declarative AlertDialog for dialogs owned by one screen.',
  primitive: '@base-ui/react/alert-dialog',
  pattern: 'alertdialog',
  keyboard: [
    ['Tab / Shift+Tab', 'Cycles focus inside the topmost dialog (focus is trapped)'],
    [
      'Escape',
      'Cancels the topmost dialog only (false, null or undefined); ignored while an onConfirm promise is pending',
    ],
    [
      'Enter',
      'In a prompt field: submits when the value is valid. In a typed-confirmation field: confirms when the text matches',
    ],
    ['Enter / Space', 'On a button: activates it'],
  ],
  anatomy: `<DialogsProvider>
  <App />
</DialogsProvider>

const { confirm, alert, prompt, open, update, close, closeAll } = useDialogs();
const ok = await confirm('This key stops working at once.', { title: 'Revoke API key', confirmLabel: 'Revoke' });
const name = await prompt('Rename environment', { label: 'Name', defaultValue: 'staging' });
const result = await open(RenameDialog, { name: 'a' });`,
  tokens: [
    'popover',
    'popover-foreground',
    'border',
    'background',
    'muted-foreground',
    'destructive',
    'destructive-text',
    'warning',
    'info',
    'focus-ring',
  ],
};
