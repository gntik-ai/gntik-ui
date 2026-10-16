import { CursorPagerFooter } from '../CursorPagerFooter';

export default function Hidden() {
  return (
    <CursorPagerFooter
      hasPrevious
      hasNext={false}
      unavailableBehaviour="hidden"
      shownCount={7}
      total={57}
      labels={{ shownSummary: (n) => `${n} records shown`, totalSummary: (n) => `${n} records in total` }}
      onPrevious={() => {}}
      onNext={() => {}}
    />
  );
}
