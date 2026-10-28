import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'SiteFooter',
  group: 'Navigation',
  status: 'beta',
  description: meta.description,
  primitive: 'Composition of Link, Logo, IconButton and ThemeSwitcher',
  pattern: 'navigation',
  keyboard: [
    ['Tab', 'Visits column links, legal links and social anchors in DOM order.'],
    ['Enter', 'Follows the focused footer link.'],
    ['Arrow keys', 'Moves between the optional theme options.'],
    ['Space', 'Selects the focused theme option.'],
  ],
  tokens: ['foreground', 'muted-foreground', 'border', 'focus-ring'],
};
