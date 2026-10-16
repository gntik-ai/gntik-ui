import { useState } from 'react';
import { CursorPagerFooter } from '../CursorPagerFooter';

export default function RowsPerPage() {
  const [pageSize, setPageSize] = useState(25);
  return (
    <CursorPagerFooter
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
