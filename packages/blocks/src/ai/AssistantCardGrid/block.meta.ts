import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Assistant card grid',
  family: 'ai',
  status: 'beta',
  description: 'Responsive grid of clickable assistant cards: name, description, model and runtime, status and last update, with a create action.',
  uses: ['ClickableCard', 'StatusTag', 'Button', 'EmptyState'],
};
