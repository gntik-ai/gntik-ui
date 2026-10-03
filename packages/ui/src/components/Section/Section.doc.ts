import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Section',
  group: 'Layout',
  status: 'stable',
  description:
    'A painted content region (<section>, named by its title). Variants plain / card / muted, padding none–lg, optional dividers between children, and a header slot with title, description and actions.',
  pattern: 'region',
  tokens: ['card', 'card-foreground', 'secondary', 'border', 'foreground', 'muted-foreground', 'shadow-sm', 'radius-xl'],
};
