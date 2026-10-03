import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Notification matrix',
  family: 'team',
  status: 'stable',
  description: 'Event × channel table of checkboxes with column and row toggles (mixed state) and always-on cells.',
  uses: ['Table', 'Checkbox'],
};
