import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'FAQ',
  family: 'marketing',
  status: 'beta',
  description: 'Frequently asked questions in an accordion with a heading block, stacked or split layout, single or multiple open items.',
  uses: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionPanel'],
};
