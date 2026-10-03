import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Popover',
  group: 'Overlays',
  status: 'stable',
  description: 'Non-modal floating panel anchored to a trigger, for short forms, details and filters. Optional arrow, four sides, three paddings. Parts: Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose.',
  primitive: '@base-ui/react/popover',
  pattern: 'dialog (non-modal disclosure)',
  keyboard: [
    ['Enter / Space', 'On the trigger: toggles the popover and moves focus inside'],
    ['Tab', 'Moves through the popover content'],
    ['Escape', 'Closes the popover and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'muted-foreground', 'secondary', 'focus-ring'],
};
