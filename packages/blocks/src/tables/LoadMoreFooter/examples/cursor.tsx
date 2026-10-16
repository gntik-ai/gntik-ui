import { DataTable } from '../../DataTable/DataTable';
import { LoadMoreFooter } from '../LoadMoreFooter';
import { useMockCursor } from './useMockCursor';

/** The consumer appends rows; DataTable must use paginated={false}. */
export default function CursorExample() {
  const { rows, load, ...state } = useMockCursor();
  return (
    <div className="space-y-4">
      <DataTable
        rows={rows}
        columns={[{ id: 'name', header: 'Name', accessor: (row) => row.name }]}
        caption="Records"
        paginated={false}
        selectable={false}
        showColumnMenu={false}
        showDensityToggle={false}
        showViewSwitcher={false}
        resizable={false}
      />
      {/* Each attempt settles loading=false together with its result in one update; split settles are unsupported. */}
      <LoadMoreFooter {...state} loadedCount={rows.length} onLoadMore={load} onRetry={load} />
    </div>
  );
}
