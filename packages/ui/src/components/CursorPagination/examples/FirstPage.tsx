import { CursorPagination } from '../CursorPagination';

export default function FirstPage() {
  return (
    <CursorPagination
      hasPrevious={false}
      hasNext
      shownCount={25}
      labels={{ shownSummary: (n) => `${n} records shown`, totalSummary: (n) => `${n} records in total` }}
      onPrevious={() => {}}
      onNext={() => {}}
    />
  );
}
