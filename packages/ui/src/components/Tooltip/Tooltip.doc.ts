import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Tooltip',
  group: 'Overlays',
  status: 'stable',
  description:
    'Short visual hint that appears on hover or keyboard focus. Solid inverted chip for labels (optional shortcut), rich variant on the popover surface for a few lines. Parts: TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, plus the SimpleTooltip shorthand. Never the only source of essential information.',
  primitive: '@base-ui/react/tooltip',
  pattern: 'tooltip',
  keyboard: [
    ['Tab', 'Focusing the trigger shows the tooltip; moving focus away hides it'],
    ['Escape', 'Hides the tooltip while focus stays on the trigger'],
  ],
  anatomy: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Target</TooltipTrigger>
    <TooltipContent>Explanation</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-instant', 'popup', 'The state changes without a transition.'],
    ['data-side', 'arrow', 'The attribute value specifies the placement side.'],
  ],
  tokens: ['foreground', 'background', 'popover', 'popover-foreground', 'border'],
};
