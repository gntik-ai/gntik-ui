import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Cursor pager footer',
  family: 'tables',
  status: 'beta',
  description:
    'Responsive stateless cursor-pagination footer for data-table paginated={false}. Forwards CursorPaginationProps: hasPrevious, hasNext, onPrevious, onNext, loading, busy, summary, shownCount, total, unavailableBehaviour, pageSize, pageSizeOptions, onPageSizeChange, previousLabel, nextLabel, ariaLabel, loadingLabel, labels and className. Consumer-owned opaque cursors stay outside the kit. summary accepts plain text or null; the count form requires labels.shownSummary and labels.totalSummary; select options require labels.rowsPerPage and labels.rowsPerPageLabel. Flat names override labels.previous, labels.next and labels.navLabel, then catalog defaults. loadingLabel=null preserves the summary while busy. One persistent polite atomic status; buttons remain focusable when aria-disabled. Removal of a focused control moves focus to Next, Previous, select, then nav root, including while busy. No page numbers or ranges. No props renders fixtures.',
  labels: [
    { key: 'previous', type: 'string', state: 'Previous name, below previousLabel and above catalog defaults' },
    { key: 'next', type: 'string', state: 'Next name, below nextLabel and above catalog defaults' },
    { key: 'navLabel', type: 'string', state: 'Navigation name, below ariaLabel and above catalog defaults' },
    {
      key: 'shownSummary',
      type: '(shownCount: number) => string',
      state: 'Required in count form: no positive exact total',
    },
    { key: 'totalSummary', type: '(total: number) => string', state: 'Required in count form: positive exact total' },
    { key: 'rowsPerPage', type: 'string', state: 'Required with pageSizeOptions: visible select label' },
    { key: 'rowsPerPageLabel', type: 'string', state: 'Required with pageSizeOptions: select accessible name' },
  ],
  uses: ['CursorPagination'],
};
