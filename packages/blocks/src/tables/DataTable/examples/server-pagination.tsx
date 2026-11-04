import { Button, Checkbox } from '@gntik-ai/ui';
import { useState } from 'react';
import { DataTable, type DataTableQuery } from '../DataTable';
import { useTableData } from '../../../hooks/useTableData';
import { ErrorPanel } from '../../../feedback/ErrorPanel/ErrorPanel';
import type { DataTableSelectionModel, SortState } from '../data-table-utils';

interface Item {
  id: number;
  name: string;
  locked: boolean;
}
interface Envelope {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortState | null;
}
const columns = [
  { id: 'id', header: 'Id', accessor: (row: Item) => row.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (row: Item) => row.name, sortable: true },
];

// Demo endpoint adapter. Replace with the consumer's API returning this envelope.
function readPage({ page, pageSize, sort }: Pick<DataTableQuery, 'page' | 'pageSize' | 'sort'>): Envelope {
  const total = 95;
  const from = (page - 1) * pageSize;
  const items = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    locked: (i + 1) % 10 === 4,
    name: `Item ${i + 1}`,
  }));
  // Sorting and slicing belong to the endpoint adapter, never DataTable's server mode.
  if (sort) {
    items.sort((a, b) => {
      const order = sort.columnId === 'id' ? a.id - b.id : a.name.localeCompare(b.name, 'en', { numeric: true });
      return sort.direction === 'ascending' ? order : -order;
    });
  }
  return { items: items.slice(from, from + pageSize), total, page, pageSize, sort };
}
async function requestPage(query: DataTableQuery & { signal: AbortSignal }): Promise<Envelope> {
  return readPage(query);
}

/** Known-total pages with aborts, per-instance caching, retained rows and retryable errors. */
export default function ServerPaginationExample({ request = requestPage }: { request?: typeof requestPage }) {
  const [selection, setSelection] = useState<DataTableSelectionModel>({ type: 'include', ids: [] });
  const [preserveSelection, setPreserveSelection] = useState(true);
  const [hideSelectAll, setHideSelectAll] = useState(false);
  const [review, setReview] = useState('');
  const data = useTableData<Item>({
    initialPage: 2,
    getRows: async (params) => {
      // Wrap an existing endpoint and pass signal through to fetch (or another fetcher).
      const response = await request({ ...params, cause: 'page' });
      return { rows: response.items, rowCount: response.total };
    },
  });

  return (
    <div className="space-y-3">
      <Checkbox
        label="Keep selections across pages"
        checked={preserveSelection}
        onCheckedChange={setPreserveSelection}
      />
      <Checkbox label="Hide page select-all" checked={hideSelectAll} onCheckedChange={setHideSelectAll} />
      <DataTable
        caption="Items"
        selectionMode="multiple"
        selectionModel={selection}
        onSelectionModelChange={setSelection}
        preserveSelection={preserveSelection}
        hideSelectAll={hideSelectAll}
        selectAllMatching
        isRowDisabled={(row) => row.locked}
        bulkActions={(ids, model) => (
          <Button
            variant="soft"
            size="sm"
            onClick={() =>
              setReview(
                model.type === 'exclude'
                  ? `Review all matching items except: ${model.ids.join(', ') || 'none'}`
                  : `Review items: ${ids.join(', ')}`,
              )
            }
          >
            Review selection
          </Button>
        )}
        columns={columns}
        {...data.tableProps}
        pageSizeOptions={[10, 20, 50]}
      />
      {data.error != null && (
        <ErrorPanel
          title="Unable to load items"
          message="Your previous rows are still available."
          code={null}
          requestId=""
          details=""
          secondaryAction={null}
          onRetry={data.refetch}
          retrying={data.isFetching}
        />
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {review}
      </p>
    </div>
  );
}
