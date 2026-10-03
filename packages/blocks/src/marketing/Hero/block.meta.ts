import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Hero',
  family: 'marketing',
  status: 'beta',
  description: 'Landing hero in centered or split layout: eyebrow badge, title, description, primary/secondary calls to action and a screenshot slot with a neutral placeholder.',
  uses: ['Badge', 'Button', 'buttonVariants'],
};
