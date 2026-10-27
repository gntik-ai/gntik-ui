import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Grid',
  group: 'Layout',
  status: 'stable',
  description:
    'Responsive CSS grid. `cols` takes 1–12 or a per-breakpoint object ({ base, sm, md, lg, xl, 2xl }) mapped to static classes; `minChildWidth` auto-fills as many columns as fit. GridItem spans columns (also responsive, or `full`). gap, rowGap and columnGap accept scalar or per-breakpoint spacing steps (0–12). Tables contain full literal classes for Tailwind scanning.',
  primitive: '@base-ui/react/use-render',
  tokens: [],
};
