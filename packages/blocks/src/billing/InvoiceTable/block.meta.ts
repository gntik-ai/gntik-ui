import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Invoice table',
  family: 'billing',
  status: 'beta',
  description: 'Invoice history table with number, date, amount, a status badge (paid, due, overdue, void) and a per-row PDF download.',
  uses: ['Table', 'Badge', 'Link', 'Button'],
};
