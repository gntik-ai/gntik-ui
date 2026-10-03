import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Toast',
  group: 'Feedback',
  status: 'stable',
  description: 'Short-lived notification stacked bottom-right. Five tones (neutral, success, info, warning, destructive) plus loading, title, description, a primary action and a dismiss action next to the close button; auto-dismiss pauses while the stack is hovered or focused. `toast.promise(task, { loading, success, error })` updates one toast in place (errors are announced assertively). Mount ToastProvider + Toaster once and queue with the useToast() hook.',
  primitive: '@base-ui/react/toast',
  pattern: 'region + live announcements (status)',
  keyboard: [
    ['F6', 'Moves focus into the notifications region (pauses auto-dismiss)'],
    ['Tab / Shift+Tab', 'Reaches each toast’s primary action, dismiss action and close button'],
    ['Enter / Space', 'On the close button or dismiss action: dismisses the toast (an action also runs its handler)'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'foreground', 'muted-foreground', 'success-text', 'info', 'warning-text', 'destructive-text', 'focus-ring'],
};
