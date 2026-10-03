import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Sessions and devices',
  family: 'team',
  status: 'stable',
  description: 'Signed-in sessions with device, client, location, last seen and a current-device badge; revoke one or all others.',
  uses: ['Badge', 'Timestamp', 'Button'],
};
