import { CursorPagination } from '../CursorPagination';

export default function LastPage() {
  return (
    <CursorPagination
      hasPrevious
      hasNext={false}
      shownCount={7}
      total={57}
      unavailableBehaviour="hidden"
      labels={{ shownSummary: (n) => `${n} records shown`, totalSummary: (n) => `${n} records in total` }}
      onPrevious={() => {}}
      onNext={() => {}}
    />
  );
}
