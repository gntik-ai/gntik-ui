import {
  BulkActionBar,
  DataTable,
  FilterBar,
  NoResultsEmpty,
  PageHeader,
  type ActiveFilter,
  type DataTableColumn,
  type FilterField,
  type SavedView,
} from '@gntik-ai/blocks';
import { Archive, Download, Plus, Trash2 } from '@gntik-ai/icons';
import { Link, Page, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { useMemo, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  filterResources,
  resourceBreadcrumbs,
  resourceColumns,
  resourceFilterFields,
  resourceRows,
  resourceSavedViews,
  type ResourceRow,
} from './data';

export type ResourceBulkAction = 'export' | 'archive' | 'delete';

/**
 * `T` is the row type (default: the deployment fixture rows). Columns decide what is shown,
 * sorted and filtered: a filter field reads the column with the same id.
 */
export interface ResourceIndexProps<T extends object = ResourceRow> {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Initial rows; the page keeps its own copy so the demo bulk actions take effect. */
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** FilterBar fields; each `id` matches a column id (or a row property). */
  filterFields: readonly FilterField[];
  savedViews: readonly SavedView[];
  /** Stable row id (defaults to `row.id`). */
  getRowId: (row: T) => string;
  /** Detail page of a row: the name cell becomes a kit Link (routed through LinkProvider). */
  getRowHref: (row: T) => string;
  /** Called when the name cell is activated (with `getRowHref`, on top of the navigation). */
  onRowClick: (row: T) => void;
  /** Column whose cell links to the row (defaults to the first column). */
  linkColumnId: string;
  /** Noun for counts and empty states, singular and plural. */
  noun: [singular: string, plural: string];
  createLabel: string;
  onCreate: () => void;
  onOpen: (row: T) => void;
  /**
   * Called for every bulk action. Without it, Archive pauses and Delete removes the rows locally
   * (the fixture behaviour); with it the product decides and passes fresh `rows`.
   */
  onBulkAction: (action: ResourceBulkAction, ids: string[]) => void;
  /** Local Archive without `onBulkAction`; defaults to `status: 'paused'` on rows that have a status. */
  archiveRow: (row: T) => T;
  loading: boolean;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const defaultRowId = (row: object): string => {
  const id = (row as { id?: unknown }).id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};

const defaultArchive = <T extends object>(row: T): T => ('status' in row ? { ...row, status: 'paused' } : row);

/** Resource index: header, filter bar, selectable sortable table with pagination, bulk action bar and a no-results state. */
export default function ResourceIndexPage<T extends object = ResourceRow>({
  title = 'Deployments',
  description = 'Every service deployed in this workspace, across regions.',
  breadcrumbs = resourceBreadcrumbs,
  rows: initialRows = resourceRows as unknown as readonly T[],
  columns = resourceColumns as unknown as ReadonlyArray<DataTableColumn<T>>,
  filterFields = resourceFilterFields,
  savedViews = resourceSavedViews,
  getRowId = defaultRowId,
  getRowHref,
  onRowClick,
  linkColumnId,
  noun = ['deployment', 'deployments'],
  createLabel = 'New deployment',
  onCreate,
  onOpen,
  onBulkAction,
  archiveRow = defaultArchive,
  loading = false,
  shell,
}: Partial<ResourceIndexProps<T>>) {
  const [rows, setRows] = useState<readonly T[]>(initialRows);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const visible = filterResources(rows, query, filters, columns);
  const visibleSelected = selected.filter((id) => visible.some((r) => getRowId(r) === id));
  const tableColumns = useMemo(
    () => linkColumns(columns, linkColumnId ?? columns[0]?.id, getRowHref, onRowClick),
    [columns, linkColumnId, getRowHref, onRowClick],
  );

  const runBulk = (action: ResourceBulkAction, ids: string[] = visibleSelected) => {
    if (onBulkAction) onBulkAction(action, ids);
    else if (action === 'delete') setRows((prev) => prev.filter((r) => !ids.includes(getRowId(r))));
    else if (action === 'archive') setRows((prev) => prev.map((r) => (ids.includes(getRowId(r)) ? archiveRow(r) : r)));
    if (action !== 'export') setSelected((prev) => prev.filter((id) => !ids.includes(id)));
  };

  return (
    <ConsoleShell currentHref="/deployments" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[{ label: 'Total', value: `${rows.length} ${rows.length === 1 ? noun[0] : noun[1]}` }]}
            tabs={null}
            actions={[{ label: createLabel, icon: Plus, variant: 'primary', onClick: onCreate }]}
          />
        }
        actionBarLabel="Bulk actions"
        actionBar={
          visibleSelected.length > 0 ? (
            <BulkActionBar
              selectedCount={visibleSelected.length}
              totalCount={visible.length}
              noun={noun}
              onClear={() => setSelected([])}
              actions={[
                { label: 'Export', icon: Download, onClick: () => runBulk('export') },
                { label: 'Archive', icon: Archive, onClick: () => runBulk('archive') },
                { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: () => runBulk('delete') },
              ]}
            />
          ) : undefined
        }
      >
        <Stack gap={4}>
          <FilterBar
            fields={filterFields}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            defaultFilters={[]}
            views={savedViews}
            placeholder={`Search ${noun[1]} by name or id…`}
            resultCount={visible.length}
          />
          <DataTable<T>
            rows={visible}
            columns={tableColumns}
            getRowId={getRowId}
            caption={title}
            loading={loading}
            selectedIds={visibleSelected}
            onSelectionChange={setSelected}
            rowActions={(row) => [
              { label: 'Open', onSelect: () => onOpen?.(row) },
              'separator',
              { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => runBulk('delete', [getRowId(row)]) },
            ]}
            emptyState={
              <NoResultsEmpty
                entity={noun[1]}
                query={query}
                filterCount={filters.length}
                onClearFilters={() => setFilters([])}
                onClearSearch={() => setQuery('')}
                titleAs="h2"
              />
            }
          />
        </Stack>
      </Page>
    </ConsoleShell>
  );
}

/** Wraps the link column's cell in a kit Link (href) or a link-styled button (click only). */
function linkColumns<T>(
  columns: ReadonlyArray<DataTableColumn<T>>,
  columnId: string | undefined,
  getRowHref: ((row: T) => string) | undefined,
  onRowClick: ((row: T) => void) | undefined,
): ReadonlyArray<DataTableColumn<T>> {
  if (!getRowHref && !onRowClick) return columns;
  return columns.map((col) => {
    if (col.id !== columnId) return col;
    const content = (row: T) => (col.cell ? col.cell(row) : String(col.accessor?.(row) ?? ''));
    return {
      ...col,
      cell: (row: T) => {
        const onClick = onRowClick ? () => onRowClick(row) : undefined;
        return getRowHref ? (
          <Link href={getRowHref(row)} tone="inherit" underline="hover" onClick={onClick}>
            {content(row)}
          </Link>
        ) : (
          <Link render={<button type="button" />} tone="inherit" underline="hover" onClick={onClick}>
            {content(row)}
          </Link>
        );
      },
    };
  });
}
