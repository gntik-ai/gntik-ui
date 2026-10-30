import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'BottomSheet',
  group: 'Overlays',
  status: 'beta',
  anatomy: `<BottomSheet>
  <BottomSheetTrigger>Open</BottomSheetTrigger>
  <BottomSheetContent title="Details" description="Review the details.">
    Content
    <BottomSheetClose>Close</BottomSheetClose>
  </BottomSheetContent>
</BottomSheet>`,
  description:
    'Mobile sheet that rests at snap points (a peek height and expanded by default): drag or swipe it between heights or down to close, or use the handle from the keyboard. Modal like a dialog: focus is trapped, Escape closes and focus returns to the trigger. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
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
  dataAttributes: [
    ['data-swiping', 'backdrop', 'The part is being swiped.'],
    ['data-starting-style', 'backdrop', 'The part is entering.'],
    ['data-ending-style', 'backdrop', 'The part is leaving.'],
    ['data-swiping', 'popup', 'The part is being swiped.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
  ],
  tokens: ['popover', 'popover-foreground', 'background', 'border', 'muted-foreground', 'secondary', 'focus-ring'],
};
