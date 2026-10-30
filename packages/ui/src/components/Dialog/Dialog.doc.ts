import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Dialog',
  group: 'Overlays',
  status: 'stable',
  description:
    'Modal window for focused tasks: forms, details, confirmations. Compound parts (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose) in four sizes. Named stacking layers keep nested popups, toasts and tooltips above the modal; see LayeredOverlays.',
  primitive: '@base-ui/react/dialog',
  pattern: 'dialog (modal)',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the dialog and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles focus within the dialog (focus is trapped)'],
    ['Escape', 'Closes the dialog and returns focus to the trigger'],
  ],
  anatomy: `<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter><DialogClose>Close</DialogClose></DialogFooter>
  </DialogContent>
</Dialog>`,
  dataAttributes: [
    ['data-starting-style', 'backdrop', 'The part is entering.'],
    ['data-ending-style', 'backdrop', 'The part is leaving.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'background', 'muted-foreground', 'focus-ring'],
};
