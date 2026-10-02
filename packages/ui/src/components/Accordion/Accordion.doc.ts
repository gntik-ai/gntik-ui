import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Accordion',
  group: 'Display',
  status: 'stable',
  description:
    'A stack of collapsible sections separated by dividers, flush or inside a card. Single (default) or multiple open items; the chevron rotates and the height animates. Compound parts: Accordion, AccordionItem, AccordionTrigger, AccordionPanel.',
  primitive: '@base-ui/react/accordion',
  pattern: 'accordion',
  keyboard: [
    ['Enter / Space', 'Expands or collapses the focused section'],
    ['ArrowDown / ArrowUp', 'Moves focus to the next / previous trigger (wraps around)'],
    ['Home / End', 'Moves focus to the first / last trigger'],
    ['Tab', 'Moves focus through the triggers and any focusable content in open panels'],
  ],
  tokens: ['border', 'card', 'secondary', 'foreground', 'muted-foreground', 'focus-ring'],
};
