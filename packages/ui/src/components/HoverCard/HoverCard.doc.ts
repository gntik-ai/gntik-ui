import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'HoverCard',
  group: 'Overlays',
  status: 'beta',
  description: 'Rich preview of a link destination — a member, project or resource — shown on hover or keyboard focus after a short delay. Parts: HoverCard, HoverCardTrigger (a real link), HoverCardContent. The preview is supplementary: never put the only copy of an action or fact inside it.',
  primitive: '@base-ui/react/preview-card',
  pattern: 'link + non-modal preview',
  keyboard: [
    ['Tab', 'Focusing the link opens the preview after the delay'],
    ['Escape', 'Closes the preview; focus stays on the link'],
    ['Enter', 'Follows the link'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'foreground', 'muted-foreground', 'focus-ring'],
};
