import { Checkbox, Input, useI18n } from '@gntik-ai/ui';
import { useEffect, useMemo, useState } from 'react';
import { FirstRunEmpty, NoResultsEmpty } from '../../../feedback/EmptyStates/EmptyStates';
import { DataTable, type DataTableQuery } from '../DataTable';
import type { DataTableColumn, SortState } from '../data-table-utils';
import { generateDeployments, type DeploymentRow } from '../fixtures';

const catalog = generateDeployments(95);
const columnDefs: Array<Omit<DataTableColumn<DeploymentRow>, 'header'>> = [
  { id: 'name', accessor: (row) => row.name, sortable: true },
  { id: 'region', accessor: (row) => row.region, sortable: true },
  { id: 'requests', accessor: (row) => row.requests, sortable: true, align: 'right' },
];
interface Page {
  rows: DeploymentRow[];
  rowCount: number;
}

// Demo endpoint adapter. Replace with the consumer's API; sorting and slicing belong to the endpoint.
function readPage(query: DataTableQuery, search: string, empty: boolean): Page {
  const matching = empty ? [] : catalog.filter((row) => row.name.includes(search.trim().toLowerCase()));
  const { sort } = query;
  if (sort) {
    const sortColumn = columnDefs.find((column) => column.id === sort.columnId);
    matching.sort((a, b) => {
      const left = sortColumn?.accessor?.(a);
      const right = sortColumn?.accessor?.(b);
      const order =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.direction === 'ascending' ? order : -order;
    });
  }
  const from = (query.page - 1) * query.pageSize;
  return { rows: matching.slice(from, from + query.pageSize), rowCount: matching.length };
}

/**
 * A server table that keeps its rows while the next page loads (`loading="refresh"`) and re-polls on an
 * interval. Page, size and sort changes announce "Updating…"; the poll only sets `aria-busy` and the bar.
 */
export default function RefreshLoadingExample({
  pollMs = 10_000,
  latencyMs = 800,
}: {
  /** Poll interval in ms; 0 disables polling. */
  pollMs?: number;
  /** Simulated response time in ms. */
  latencyMs?: number;
}) {
  const { t } = useI18n();
  const columns = useMemo<Array<DataTableColumn<DeploymentRow>>>(
    () =>
      columnDefs.map((column) => ({
        ...column,
        header: t(`table.example.refresh.${column.id as 'name' | 'region' | 'requests'}` as const),
      })),
    [t],
  );
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    pageSize: 10,
    sort: null,
    filters: undefined,
    cause: 'page',
  });
  const [search, setSearch] = useState('');
  const [empty, setEmpty] = useState(false);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<Page & { key: string }>({ rows: [], rowCount: 0, key: '' });
  const sort: SortState | null = query.sort;
  // The data on screen is current once it answers the latest request; until then the table refreshes.
  const key = JSON.stringify({ query, search, empty, tick });
  const fetching = data.key !== key;

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  useEffect(() => {
    const timer = setTimeout(() => setData({ ...readPage(query, search, empty), key }), latencyMs);
    return () => clearTimeout(timer);
  }, [key, query, search, empty, latencyMs]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          aria-label={t('table.example.refresh.search')}
          placeholder={t('table.example.refresh.search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery((current) => ({ ...current, page: 1 }));
          }}
          className="max-w-xs"
        />
        <Checkbox label={t('table.example.refresh.emptyWorkspace')} checked={empty} onCheckedChange={setEmpty} />
      </div>
      <DataTable
        caption={t('table.example.refresh.caption')}
        selectionMode="none"
        columns={columns}
        getRowId={(row) => row.id}
        paginationMode="server"
        manualSorting
        rows={data.rows}
        rowCount={data.rowCount}
        page={query.page}
        pageSize={query.pageSize}
        sort={sort}
        pageSizeOptions={[10, 20]}
        onQueryChange={(next) => setQuery(next)}
        loading={fetching ? 'refresh' : false}
        filtered={search.trim() !== ''}
        emptyState={<FirstRunEmpty onAction={() => setEmpty(false)} />}
        noResultsState={
          <NoResultsEmpty query={search.trim()} entity={t('table.example.refresh.entity')} filterCount={0} />
        }
      />
    </div>
  );
}
