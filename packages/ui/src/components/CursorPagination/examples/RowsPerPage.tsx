import { useState } from 'react';
import { CursorPagination } from '../CursorPagination';

/** No status text in any state, including busy. */
export default function RowsPerPage() {
  const [pageSize, setPageSize] = useState(25);
  return (
    <CursorPagination
      hasPrevious={false}
      hasNext
      busy
      summary={null}
      loadingLabel={null}
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50, 100]}
      onPageSizeChange={setPageSize}
      labels={{ rowsPerPage: 'Rows per page', rowsPerPageLabel: 'Rows per page' }}
      onPrevious={() => {}}
      onNext={() => {}}
    />
  );
}
