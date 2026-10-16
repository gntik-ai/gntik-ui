import { CursorPagination } from '../CursorPagination';

export default function Busy() {
  return (
    <CursorPagination hasPrevious hasNext loading summary="25 records loaded" onPrevious={() => {}} onNext={() => {}} />
  );
}
