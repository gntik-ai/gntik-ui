import { useState } from 'react';
import { PaginationCompact } from '../Pagination';

export default function PaginationTableFooter() {
  const [page, setPage] = useState(1);
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
      <span className="text-[12.5px] text-muted-foreground">Deployments</span>
      <PaginationCompact
        page={page}
        pageSize={10}
        total={97}
        onPageChange={setPage}
        labels={{ nav: 'Deployments pagination' }}
      />
    </div>
  );
}
