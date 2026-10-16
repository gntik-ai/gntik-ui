import { CursorPagination } from '../CursorPagination';

export default function MiddlePage() {
  return <CursorPagination hasPrevious hasNext summary="25 records loaded" onPrevious={() => {}} onNext={() => {}} />;
}
