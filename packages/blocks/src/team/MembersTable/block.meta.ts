import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Members table',
  family: 'team',
  status: 'stable',
  description: 'Workspace members with avatar, email, an inline role select, last activity and a row menu to remove.',
  uses: ['Table', 'Avatar', 'Badge', 'Select', 'Timestamp', 'MoreMenu'],
};
