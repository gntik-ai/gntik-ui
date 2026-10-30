import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Popover',
  group: 'Overlays',
  status: 'stable',
  description:
    'Non-modal floating panel anchored to a trigger, for short forms, details and filters. Optional arrow, four sides, three paddings. Close the popover before opening a Dialog from it: the popover layer is above the modal layer. Parts: Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose.',
  primitive: '@base-ui/react/popover',
  pattern: 'dialog (non-modal disclosure)',
  keyboard: [
    ['Enter / Space', 'On the trigger: toggles the popover and moves focus inside'],
    ['Tab', 'Moves through the popover content'],
    ['Escape', 'Closes the popover and returns focus to the trigger'],
  ],
  anatomy: `<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <PopoverTitle>Title</PopoverTitle>
    <PopoverDescription>Description</PopoverDescription>
    <PopoverClose>Close</PopoverClose>
  </PopoverContent>
</Popover>`,
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-side', 'arrow', 'The attribute value specifies the placement side.'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'muted-foreground', 'secondary', 'focus-ring'],
};
