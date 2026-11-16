import { PaginationFooter } from '../PaginationFooter';

/** Keep the range and page navigation when another control owns the page size. */
export default function WithoutPageSize() {
  return <PaginationFooter total={95} defaultPage={2} showPageSize={false} />;
}
