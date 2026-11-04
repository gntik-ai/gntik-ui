import { Button, Checkbox, Input } from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { useTableData, type TableDataParams, type TableDataResult } from '../../../hooks/useTableData';
import { ErrorPanel } from '../../../feedback/ErrorPanel/ErrorPanel';
import { LoadMoreFooter } from '../../LoadMoreFooter/LoadMoreFooter';
import { DataTable } from '../DataTable';

interface Item {
  id: number;
  name: string;
}
type Filters = { search: string };
const columns = [
  { id: 'id', header: 'Id', accessor: (item: Item) => item.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (item: Item) => item.name, sortable: true },
];
async function readCursor({
  cursor,
  pageSize,
  filters,
  sort,
  signal,
}: TableDataParams<Filters>): Promise<TableDataResult<Item>> {
  signal.throwIfAborted();
  const items = Array.from({ length: 35 }, (_, index) => ({ id: index + 1, name: `Item ${index + 1}` })).filter(
    (item) => item.name.toLowerCase().includes(filters?.search.toLowerCase() ?? ''),
  );
  if (sort?.direction === 'descending') items.reverse();
  const start = Number(cursor ?? 0);
  const end = start + pageSize;
  return { rows: items.slice(start, end), nextCursor: end < items.length ? String(end) : null };
}

/** Cursor requests reuse the table query controls, with a separate load-more footer. */
export default function CursorLoadMoreExample({ getRows = readCursor }: { getRows?: typeof readCursor }) {
  const searchId = useId();
  const [search, setSearch] = useState('');
  const [failNext, setFailNext] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [keepPreviousData, setKeepPreviousData] = useState(true);
  const data = useTableData({
    getRows: async (params) => {
      if (failNext) {
        setFailNext(false);
        throw new Error('Request failed. Try again.');
      }
      return getRows(params);
    },
    filters: { search },
    enabled,
    keepPreviousData,
    cacheTime: 30000,
    revalidateInterval: 15000,
  });
  return (
    <div className="space-y-3">
      <label htmlFor={searchId} className="text-sm text-foreground">
        Search items
      </label>
      <Input id={searchId} value={search} onValueChange={setSearch} />
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox label="Enable requests" checked={enabled} onCheckedChange={setEnabled} />
        <Checkbox label="Fail next request" checked={failNext} onCheckedChange={setFailNext} />
        <Checkbox label="Keep previous rows" checked={keepPreviousData} onCheckedChange={setKeepPreviousData} />
        <Button variant="soft" onClick={data.refetch} disabled={!enabled}>
          Refetch
        </Button>
        <Button variant="soft" onClick={data.invalidate} disabled={!enabled}>
          Invalidate cache
        </Button>
      </div>
      <DataTable {...data.tableProps} columns={columns} caption="Cursor items" selectionMode="none" paginated={false} />
      {data.error != null && data.nextCursor === undefined && (
        <ErrorPanel
          title="Unable to load items"
          code={null}
          requestId=""
          details=""
          secondaryAction={null}
          onRetry={data.refetch}
          retrying={data.isFetching}
        />
      )}
      <LoadMoreFooter {...data.loadMoreProps} />
    </div>
  );
}
