import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Popover',
  group: 'Overlays',
  status: 'stable',
  description:
    'Non-modal floating panel anchored to a trigger, for short forms, details and filters. Optional arrow, four sides, three paddings. Close the popover before opening a Dialog from it: the popover layer is above the modal layer. Parts: Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose.',
  primitive: '@base-ui/react/popover',
  pattern: 'dialog (non-modal disclosure)',
  anatomy:
    '<Popover>\n  <PopoverTrigger>Open</PopoverTrigger>\n  <PopoverContent><PopoverTitle>Title</PopoverTitle><PopoverDescription>Description</PopoverDescription><PopoverClose>Close</PopoverClose></PopoverContent>\n</Popover>',
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering; transition styles apply.'],
    ['data-ending-style', 'popup', 'The part is leaving; transition styles apply.'],
    ['data-side', 'arrow', 'The popup placement side (top, right, bottom or left) positions and orients the arrow.'],
  ],
  keyboard: [
    ['Enter / Space', 'On the trigger: toggles the popover and moves focus inside'],
    ['Tab', 'Moves through the popover content'],
    ['Escape', 'Closes the popover and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'muted-foreground', 'secondary', 'focus-ring'],
};
