import { useEffect, useState } from 'react';
import { DataTable } from '../DataTable';
import { generateDeployments } from '../fixtures';

const rows = generateDeployments(95);
const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
function readPagination() {
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  return { page: positiveInteger(params.get('page'), 1), pageSize: positiveInteger(params.get('pageSize'), 10) };
}

/** Client rows with controlled pagination restored by shared links and browser Back/Forward. */
export default function UrlPagination() {
  const [pagination, setPagination] = useState(readPagination);
  useEffect(() => {
    const restore = () => setPagination(readPagination());
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  return (
    <DataTable
      rows={rows}
      {...pagination}
      onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
      onPageSizeChange={(pageSize) => setPagination((current) => ({ ...current, pageSize }))}
      onQueryChange={({ page, pageSize }) => {
        // One complete query per action keeps resize's size + page in one history entry.
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        url.searchParams.set('pageSize', String(pageSize));
        window.history.pushState(window.history.state, '', url);
      }}
    />
  );
}
