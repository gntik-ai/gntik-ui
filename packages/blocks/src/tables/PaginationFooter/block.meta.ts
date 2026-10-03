import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Pagination footer',
  family: 'tables',
  status: 'beta',
  description: 'Table footer with a rows-per-page Select, a "1–10 of 97" summary and numbered Pagination; controlled or uncontrolled.',
  uses: ['SimpleSelect', 'Pagination'],
};
