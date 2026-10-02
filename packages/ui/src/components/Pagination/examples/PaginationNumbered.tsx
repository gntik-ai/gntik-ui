import { useState } from 'react';
import { Pagination } from '../Pagination';

export default function PaginationNumbered() {
  const [page, setPage] = useState(6);
  return <Pagination page={page} pageCount={42} onPageChange={setPage} />;
}
