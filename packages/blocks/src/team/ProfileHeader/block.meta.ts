import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Profile header',
  family: 'team',
  status: 'stable',
  description: 'Profile header with a large avatar and change action, name, role badge, headline, meta row and edit button.',
  uses: ['Avatar', 'Badge', 'IconButton', 'Button'],
};
