import { Button, Checkbox } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { DataTable, type DataTableQuery } from '../DataTable';
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
async function requestPage(query: DataTableQuery): Promise<Envelope> {
  return readPage(query);
}

/** Known-total, 1-based pages. The consumer owns requests and keeps the old envelope until they resolve. */
export default function ServerPaginationExample({ request = requestPage }: { request?: typeof requestPage }) {
  const [selection, setSelection] = useState<DataTableSelectionModel>({ type: 'include', ids: [] });
  const [preserveSelection, setPreserveSelection] = useState(true);
  const [hideSelectAll, setHideSelectAll] = useState(false);
  const [review, setReview] = useState('');
  const [envelope, setEnvelope] = useState(() => readPage({ page: 2, pageSize: 20, sort: null }));
  const [sort, setSort] = useState<SortState | null>(null);
  const latestRequest = useRef(0);
  const confirmedSort = useRef(envelope.sort);
  const changeQuery = (query: DataTableQuery) => {
    const requestId = ++latestRequest.current;
    // Show the requested order while the consumer fetches exactly once per action.
    setSort(query.sort);
    void request(query)
      .then((next) => {
        if (requestId !== latestRequest.current) return;
        confirmedSort.current = next.sort;
        setEnvelope(next);
      })
      .catch(() => {
        if (requestId !== latestRequest.current) return;
        // Reset the controlled header to the last confirmed order when a request fails.
        setSort(confirmedSort.current);
      });
  };

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
        rows={envelope.items}
        paginationMode="server"
        rowCount={envelope.total}
        page={envelope.page}
        pageSize={envelope.pageSize}
        pageSizeOptions={[10, 20, 50]}
        sort={sort}
        onQueryChange={changeQuery}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {review}
      </p>
    </div>
  );
}
