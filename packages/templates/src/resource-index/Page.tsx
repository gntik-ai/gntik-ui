import { BulkActionBar, DataTable, FilterBar, NoResultsEmpty, PageHeader, type ActiveFilter, type DataTableColumn, type SavedView } from '@gntik-ai/blocks';
import { Archive, Download, Plus, Trash2 } from '@gntik-ai/icons';
import { Page, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
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

export interface ResourceIndexProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Initial rows; the page keeps its own copy so the demo bulk actions take effect. */
  rows: readonly ResourceRow[];
  columns: ReadonlyArray<DataTableColumn<ResourceRow>>;
  savedViews: readonly SavedView[];
  /** Noun for counts and empty states, singular and plural. */
  noun: [singular: string, plural: string];
  createLabel: string;
  onCreate: () => void;
  onOpen: (row: ResourceRow) => void;
  /**
   * Called for every bulk action. Without it, Archive pauses and Delete removes the rows locally
   * (the fixture behaviour); with it the product decides and passes fresh `rows`.
   */
  onBulkAction: (action: ResourceBulkAction, ids: string[]) => void;
  loading: boolean;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Resource index: header, filter bar, selectable sortable table with pagination, bulk action bar and a no-results state. */
export default function ResourceIndexPage({
  title = 'Deployments',
  description = 'Every service deployed in this workspace, across regions.',
  breadcrumbs = resourceBreadcrumbs,
  rows: initialRows = resourceRows,
  columns = resourceColumns,
  savedViews = resourceSavedViews,
  noun = ['deployment', 'deployments'],
  createLabel = 'New deployment',
  onCreate,
  onOpen,
  onBulkAction,
  loading = false,
  shell,
}: Partial<ResourceIndexProps>) {
  const [rows, setRows] = useState<readonly ResourceRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const visible = filterResources(rows, query, filters);
  const visibleSelected = selected.filter((id) => visible.some((r) => r.id === id));

  const runBulk = (action: ResourceBulkAction, ids: string[] = visibleSelected) => {
    if (onBulkAction) onBulkAction(action, ids);
    else if (action === 'delete') setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    else if (action === 'archive') setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: 'paused' } : r)));
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
            fields={resourceFilterFields}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            defaultFilters={[]}
            views={savedViews}
            placeholder={`Search ${noun[1]} by name or id…`}
            resultCount={visible.length}
          />
          <DataTable<ResourceRow>
            rows={visible}
            columns={columns}
            caption={title}
            loading={loading}
            selectedIds={visibleSelected}
            onSelectionChange={setSelected}
            rowActions={(row) => [
              { label: 'Open', onSelect: () => onOpen?.(row) },
              'separator',
              { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => runBulk('delete', [row.id]) },
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
