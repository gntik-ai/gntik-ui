import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'AspectRatio',
  group: 'Layout',
  status: 'stable',
  description:
    'A box locked to a width / height ratio (16:9 by default) for images, video and embeds; direct children fill it (object-cover). Radius none–xl and an optional bordered placeholder surface.',
  primitive: '@base-ui/react/use-render',
  tokens: ['border', 'secondary', 'muted-foreground', 'radius-lg'],
};
