import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Pagination footer',
  family: 'tables',
  status: 'beta',
  description:
    "Optional exported PaginationFooterLabels, partial overrides per key: labels['rowsPerPage']: string (initial and all page states, visible page-size text); labels['rowsPerPageLabel']: string (page-size select closed or open, accessible name); labels['range']: (from: number, to: number, total: number) => string (initial, next, previous, page button and resized, inclusive raw bounds and total, live summary returned verbatim); labels['nav']: string (all page states, navigation name); labels['previous']: string (all page states, previous button name); labels['next']: string (all page states, next button name); labels['page']: (page: number) => string (all page states, numeric page button name); precedence is legacy props then labels then existing I18nProvider catalog then English; formatters render verbatim and receive raw arguments; omitted labels preserve the previous release output. " +
    'Table footer with a rows-per-page Select, a "1–10 of 97" summary and numbered Pagination; controlled or uncontrolled.',
  uses: ['SimpleSelect', 'Pagination'],
};
