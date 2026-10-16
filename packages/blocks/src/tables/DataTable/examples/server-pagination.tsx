import { useEffect, useState } from 'react';
import { DataTable } from '../DataTable';

interface Item {
  id: number;
  name: string;
}
interface Envelope {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}
const columns = [
  { id: 'id', header: 'Id', accessor: (row: Item) => row.id },
  { id: 'name', header: 'Name', accessor: (row: Item) => row.name },
];

// Demo endpoint adapter. Replace with the consumer's API returning this envelope.
function readPage(page: number, pageSize: number): Envelope {
  const total = 95;
  const from = (page - 1) * pageSize;
  return {
    items: Array.from({ length: Math.max(0, Math.min(pageSize, total - from)) }, (_, i) => ({
      id: from + i + 1,
      name: `Item ${from + i + 1}`,
    })),
    total,
    page,
    pageSize,
  };
}
async function requestPage(page: number, pageSize: number): Promise<Envelope> {
  return readPage(page, pageSize);
}

/** Known-total, 1-based pages. The consumer owns requests and keeps the old envelope until they resolve. */
export default function ServerPaginationExample() {
  const [envelope, setEnvelope] = useState(() => readPage(2, 20));
  const [request, setRequest] = useState({ page: 2, pageSize: 20 });
  useEffect(() => {
    let active = true;
    void requestPage(request.page, request.pageSize).then((next) => {
      if (active) setEnvelope(next);
    });
    return () => {
      active = false;
    };
  }, [request]);

  return (
    <DataTable
      caption="Items"
      selectionMode="none"
      columns={columns}
      rows={envelope.items}
      paginationMode="server"
      rowCount={envelope.total}
      page={envelope.page}
      pageSize={envelope.pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageChange={(page) => setRequest((previous) => ({ ...previous, page }))}
      // The footer can also call onPageChange to keep the first row visible (20 to 50 at page 2 requests page 1).
      // Functional updates batch both callbacks into one request with the new size and page.
      onPageSizeChange={(pageSize) => setRequest((previous) => ({ ...previous, pageSize }))}
    />
  );
}
