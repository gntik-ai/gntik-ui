import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'LogoCloud',
  group: 'Display',
  status: 'beta',
  description: meta.description,
  primitive: 'Semantic list with named images and decorative SVG marks',
  pattern: 'Static social proof',
  keyboard: [],
  tokens: ['muted-foreground', 'foreground'],
};
