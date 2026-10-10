import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Status timeline',
  family: 'data-display',
  status: 'beta',
  description:
    'Vertical timeline of state changes with a StatusDot per state, details, actor and Timestamp; collapses older events and renders an accessible empty state for an explicit empty events array, with a localizable emptyLabel. The label, showFewerLabel, showEarlierLabel(hidden) and actorLabel props override the localized defaults.',
  uses: ['StatusDot', 'Timestamp', 'Button', 'EmptyState'],
};
