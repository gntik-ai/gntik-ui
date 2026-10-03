import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'BottomSheet',
  group: 'Overlays',
  status: 'beta',
  description:
    'Mobile sheet that rests at snap points (a peek height and expanded by default): drag or swipe it between heights or down to close, or use the handle from the keyboard. Modal like a dialog: focus is trapped, Escape closes and focus returns to the trigger.',
  primitive: '@base-ui/react/drawer (snapPoints)',
  pattern: 'modal dialog with a resize handle button',
  keyboard: [
    ['Enter / Space (trigger)', 'Opens the sheet at its first snap point and moves focus inside'],
    ['ArrowUp / ArrowDown (handle)', 'Next taller / shorter snap point'],
    ['Home / End (handle)', 'Smallest / tallest snap point'],
    ['Enter / Space (handle)', 'Cycles through the snap points'],
    ['Tab / Shift+Tab', 'Moves focus within the sheet (trapped)'],
    ['Escape', 'Closes the sheet and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'background', 'border', 'muted-foreground', 'secondary', 'focus-ring'],
};
