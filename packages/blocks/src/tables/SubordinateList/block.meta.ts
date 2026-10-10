import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Subordinate list',
  family: 'tables',
  status: 'beta',
  description:
    'Read-only list section inside a resource-form host, composing section-header, data-table, pagination-footer, empty-states, skeletons and error-panel. All props are required: title (string), headingLevel (h2 or h3), count (number, including 0), columns (typed DataTableColumn<T>[]), rows (readonly T[]), getRowId, pagination ({limit, offset, total, onPageChange(offset)} or null), loading (boolean), error ({title, message, code: string | number | null} or null), onRetry and emptyState (host-supplied ReactNode). Every supplied row renders; server pagination converts the zero-based offset to a 1-based footer page and fixes pageSizeOptions to [limit]. No filtering, sorting, selection, create action, toolbar, virtualization, pinning or sticky region. Error takes precedence over loading, then empty and data; retry uses the current i18n locale. Error headings use h3 for either section heading level. Composition example: packages/blocks/src/tables/SubordinateList/examples/ResourceForm.tsx uses the resource-form form sections and sticky save bar with a server-paginated History section and an unpaginated Consumers section.',
  uses: ['section-header', 'data-table', 'pagination-footer', 'empty-states', 'skeletons', 'error-panel'],
};
