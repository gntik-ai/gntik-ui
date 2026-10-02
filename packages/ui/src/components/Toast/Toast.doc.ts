import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Toast',
  group: 'Feedback',
  status: 'stable',
  description: 'Short-lived notification stacked bottom-right. Five tones (neutral, success, info, warning, destructive), title, description, one inline action and a close button; auto-dismiss pauses on hover and focus. Mount ToastProvider + Toaster once and queue with the useToast() hook.',
  primitive: '@base-ui/react/toast',
  pattern: 'region + live announcements (status)',
  keyboard: [
    ['F6', 'Moves focus into the notifications region (pauses auto-dismiss)'],
    ['Tab / Shift+Tab', 'Reaches each toast’s action and close button'],
    ['Enter / Space', 'On the close button: dismisses the toast'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'foreground', 'muted-foreground', 'success-text', 'info', 'warning-text', 'destructive-text', 'focus-ring'],
};
