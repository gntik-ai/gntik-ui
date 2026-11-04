import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'ResourceCardGrid',
  group: 'Display',
  status: 'beta',
  description: meta.description,
  primitive: 'Named list of cards with Base UI action menus',
  pattern:
    'Cards reflow by container width up to the columns cap. className styles the list; containerClassName styles its wrapper for placement and visibility.',
  keyboard: [
    ['Tab', 'Move between card action menu triggers.'],
    ['Enter / Space', 'Open the focused action menu.'],
    ['Arrow keys', 'Move between actions in the open menu.'],
    ['Escape', 'Close the menu and return focus to its trigger.'],
  ],
  tokens: ['card', 'border', 'foreground', 'muted-foreground', 'secondary'],
};
