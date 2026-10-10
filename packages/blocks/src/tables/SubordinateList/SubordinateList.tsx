import { useId, type ReactNode } from 'react';
import { SectionHeader } from '../../page-chrome/SectionHeader/SectionHeader';
import { TableSkeleton } from '../../feedback/Skeletons/Skeletons';
import { ErrorPanel } from '../../feedback/ErrorPanel/ErrorPanel';
import { ServerCrash } from '@gntik-ai/icons';
import { DataTable } from '../DataTable/DataTable';
import type { DataTableColumn } from '../DataTable/data-table-utils';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { useI18n } from '@gntik-ai/ui';

export interface SubordinateListPagination {
  /** Positive server page size. */
  limit: number;
  /** Zero-based server offset. */
  offset: number;
  total: number;
  onPageChange: (offset: number) => void;
}

export interface SubordinateListError {
  title: string;
  message: string;
  /** null hides the error code chip. */
  code: string | number | null;
}

export interface SubordinateListProps<T> {
  title: string;
  headingLevel: 'h2' | 'h3';
  /** Server total, or the length of an unpaginated collection (including zero). */
  count: number;
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: readonly T[];
  getRowId: (row: T) => string;
  pagination: SubordinateListPagination | null;
  loading: boolean;
  error: SubordinateListError | null;
  onRetry: () => void | Promise<void>;
  /** Host-supplied EmptyStates composition. */
  emptyState: ReactNode;
}

/** Read-only list section with explicit host data and no demo defaults. */
export function SubordinateList<T>({
  title,
  headingLevel,
  count,
  columns,
  rows,
  getRowId,
  pagination,
  loading,
  error,
  onRetry,
  emptyState,
}: SubordinateListProps<T>) {
  const headingId = useId();
  const { locale, t } = useI18n();
  return (
    <section aria-labelledby={headingId} aria-busy={loading} className="space-y-4">
      <SectionHeader title={title} as={headingLevel} count={count} description={null} actions={[]} bordered={true} headingId={headingId} className="" />
      {error !== null ? (
        <ErrorPanel
          icon={ServerCrash}
          title={error.title}
          message={error.message}
          code={error.code}
          requestId=""
          details=""
          onRetry={onRetry}
          retrying={undefined}
          retryLabel={t('error.retry')}
          secondaryAction={null}
          titleAs="h3"
          className=""
        />
      ) : loading ? (
        <TableSkeleton rows={pagination?.limit ?? 5} columns={columns.length} label={t('loading.table')} className="" />
      ) : rows.length === 0 ? (
        emptyState
      ) : (
        <DataTable
          rows={rows}
          columns={columns.map((column) => ({
            ...column,
            sortable: false,
            editable: false,
          }))}
          getRowId={getRowId}
          caption={title}
          showCaption={false}
          paginated={false}
          selectable={false}
          selectedIds={[]}
          selectionSummary={false}
          sort={null}
          defaultSort={null}
          manualSorting={true}
          showColumnMenu={false}
          showDensityToggle={false}
          showViewSwitcher={false}
          resizable={false}
          pinnedColumns={{}}
          showPinMenu={false}
          virtualize={false}
          hiddenColumns={[]}
          toolbar={null}
          loading={false}
          loadingRows={0}
          emptyState={emptyState}
          className=""
        />
      )}
      {error === null && !loading && pagination !== null && (
        <PaginationFooter
          total={pagination.total}
          page={Math.floor(pagination.offset / pagination.limit) + 1}
          defaultPage={1}
          onPageChange={(page) => pagination.onPageChange((page - 1) * pagination.limit)}
          pageSize={pagination.limit}
          defaultPageSize={pagination.limit}
          onPageSizeChange={() => {}}
          pageSizeOptions={[pagination.limit]}
          noun={title}
          locale={locale}
          className=""
        />
      )}
    </section>
  );
}
