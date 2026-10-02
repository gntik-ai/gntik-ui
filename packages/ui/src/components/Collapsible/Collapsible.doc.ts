import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Collapsible',
  group: 'Display',
  status: 'stable',
  description:
    'A single show/hide section: an inline toggle ("Advanced settings") or a full-width row in the Accordion family. The chevron rotates and the height animates. Compound parts: Collapsible, CollapsibleTrigger, CollapsiblePanel.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'disclosure',
  keyboard: [
    ['Enter / Space', 'Expands or collapses the panel'],
    ['Tab', 'Moves focus from the trigger into the open panel content'],
  ],
  tokens: ['border', 'secondary', 'foreground', 'muted-foreground', 'focus-ring'],
};
