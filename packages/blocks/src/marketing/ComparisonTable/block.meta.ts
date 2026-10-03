import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Comparison table',
  family: 'marketing',
  status: 'beta',
  description:
    'Plans or options as columns and feature rows grouped by section (one tbody per section with a rowgroup header). Values are booleans (check or dash with screen-reader text), text or numbers; an optional recommended column is marked with a text badge, a primary top rule and a tint. Scrolls sideways on narrow screens with a sticky feature column.',
  uses: ['Table', 'Badge', 'Button'],
};
