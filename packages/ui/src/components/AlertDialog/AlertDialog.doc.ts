import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'AlertDialog',
  group: 'Overlays',
  status: 'stable',
  description: 'Confirmation that interrupts the user and demands a decision: tone icon (destructive, warning, info), title, consequence and Cancel + confirm actions. An outside press does not dismiss it. Parts: AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction.',
  primitive: '@base-ui/react/alert-dialog',
  pattern: 'alertdialog',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the dialog and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles focus between the actions (focus is trapped)'],
    ['Escape', 'Closes the dialog and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'background', 'muted-foreground', 'destructive', 'destructive-text', 'warning', 'warning-text', 'info', 'focus-ring'],
};
