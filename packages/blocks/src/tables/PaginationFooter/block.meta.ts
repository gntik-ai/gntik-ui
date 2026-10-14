import type { BlockMeta } from '../../meta';
import type { PaginationFooterLabels } from './PaginationFooter';

export const meta: BlockMeta = {
  name: 'Pagination footer',
  family: 'tables',
  status: 'beta',
  description:
    'Table footer with a rows-per-page Select, a "1–10 of 97" summary and numbered Pagination; controlled or uncontrolled.',
  labels: [
    { key: 'rowsPerPage', type: 'string', state: 'Always: visible page-size text' },
    { key: 'rowsPerPageLabel', type: 'string', state: 'Always: page-size Select accessible name' },
    {
      key: 'rangeSummary',
      type: '(from: number, to: number, total: number) => string',
      state: 'Every page and page-size change: visible summary and polite live region',
    },
    {
      key: 'paginationNav',
      type: '(noun: string) => string',
      state: 'Always: navigation accessible name; noun is caller content',
    },
    { key: 'previous', type: 'string', state: 'Always: previous-page button name' },
    { key: 'next', type: 'string', state: 'Always: next-page button name' },
    {
      key: 'page',
      type: '(page: number) => string',
      state: 'Always: numbered-page button name; number stays caller content',
    },
  ] satisfies Array<{ key: keyof PaginationFooterLabels; type: string; state: string }>,
  uses: ['SimpleSelect', 'Pagination'],
};
