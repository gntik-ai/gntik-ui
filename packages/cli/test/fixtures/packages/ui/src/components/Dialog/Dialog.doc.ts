import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Dialog',
  primitive: '@base-ui/react/dialog',
  pattern: 'dialog-modal',
  keyboard: [
    ['Escape', 'Closes the dialog and returns focus to the trigger'],
    ['Tab', 'Cycles focus inside the dialog (focus trap)'],
    ['Shift + Tab', 'Cycles focus backwards'],
  ],
};
