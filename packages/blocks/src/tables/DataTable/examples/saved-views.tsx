import { SimpleSelect } from '@gntik-ai/ui';
import { useState } from 'react';
import { DataTable } from '../DataTable';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, type DeploymentRow } from '../fixtures';
import type { DataTableView } from '../views';

interface Filters {
  status: string;
}

const VIEWS: DataTableView[] = [
  { id: 'expensive', name: 'Most expensive', state: { sort: { columnId: 'cost', direction: 'descending' }, hiddenColumns: ['region', 'updated'] } },
  { id: 'by-region', name: 'By region', state: { groupBy: 'region', pinnedColumns: { left: ['name'] } } },
  { id: 'failing', name: 'Needs attention', state: { filters: { status: 'failed' }, sort: { columnId: 'updated', direction: 'descending' }, hiddenColumns: [] } },
];

const STATUS_FILTER = [
  { value: 'all', label: 'All statuses' },
  { value: 'running', label: 'Running' },
  { value: 'failed', label: 'Failed' },
  { value: 'degraded', label: 'Degraded' },
];

/**
 * Saved views: switch between views, change the table (sort, columns, widths, pinning,
 * grouping, the status filter) and save the result as a new view, rename, delete or reset it.
 */
export default function SavedViewsDataTable() {
  const [views, setViews] = useState<DataTableView[]>(VIEWS);
  const [filters, setFilters] = useState<Filters>({ status: 'all' });
  const rows = filters.status === 'all' ? DEPLOYMENT_ROWS : DEPLOYMENT_ROWS.filter((r) => r.status === filters.status);
  return (
    <DataTable<DeploymentRow>
      caption="Deployments"
      rows={rows}
      columns={DEPLOYMENT_COLUMNS}
      resizable
      views={views}
      onViewsChange={setViews}
      filters={filters}
      onFiltersChange={(f) => setFilters((f as Filters | undefined) ?? { status: 'all' })}
      toolbar={
        <SimpleSelect
          aria-label="Status"
          size="sm"
          value={filters.status}
          onValueChange={(status) => setFilters({ status: status ?? 'all' })}
          items={STATUS_FILTER}
        />
      }
    />
  );
}
