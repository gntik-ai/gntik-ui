import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Grid',
  group: 'Layout',
  status: 'stable',
  description:
    'Responsive CSS grid. `cols` takes 1–12 or a per-breakpoint object ({ base, sm, md, lg, xl }) mapped to static classes; `minChildWidth` auto-fills as many columns as fit. GridItem spans columns (also responsive, or `full`). Gap on the spacing scale.',
  primitive: '@base-ui/react/use-render',
  tokens: [],
};
