import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Dialog',
  group: 'Overlays',
  status: 'stable',
  description: 'Modal window for focused tasks: forms, details, confirmations. Compound parts (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose) in four sizes.',
  primitive: '@base-ui/react/dialog',
  pattern: 'dialog (modal)',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the dialog and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles focus within the dialog (focus is trapped)'],
    ['Escape', 'Closes the dialog and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'background', 'muted-foreground', 'focus-ring'],
};
