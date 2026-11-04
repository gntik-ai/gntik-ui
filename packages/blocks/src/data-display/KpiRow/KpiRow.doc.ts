import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'KpiRow',
  group: 'Display',
  status: 'beta',
  description: meta.description,
  primitive: 'Named description list with optional sparklines',
  pattern:
    'Metrics reflow by container width. className styles the list; containerClassName styles its wrapper for placement and visibility.',
  keyboard: [],
  tokens: ['card', 'border', 'foreground', 'muted-foreground'],
};
