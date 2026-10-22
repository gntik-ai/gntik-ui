import { useState } from 'react';
import { DataTable } from '../DataTable';

const rows = Array.from({ length: 60 }, (_, i) => ({ id: String(i + 1), name: `Item ${i + 1}` }));
const columns = [{ id: 'name', header: 'Name', accessor: (row: (typeof rows)[number]) => row.name }];

/** Include the current choice in the legend because its checked radio may be on another page. */
export default function PaginatedSingleSelectionExample() {
  const [selectedId, setSelectedId] = useState('42');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  return (
    <div className="space-y-4">
      <DataTable
        caption="Client items"
        rows={rows}
        columns={columns}
        selectionMode="single"
        paginated
        defaultPageSize={20}
        defaultSelectedId="42"
        legend="Client items; initial choice Item 42"
        showColumnMenu={false}
        showDensityToggle={false}
      />
      <DataTable
        caption="Server items"
        rows={rows.slice((page - 1) * pageSize, page * pageSize)}
        columns={columns}
        selectionMode="single"
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowCount={rows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50]}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        legend={`Server items; current choice Item ${selectedId}`}
        showColumnMenu={false}
        showDensityToggle={false}
      />
    </div>
  );
}
