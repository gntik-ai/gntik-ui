import { CursorPagerFooter } from '../CursorPagerFooter';

export default function Busy() {
  return (
    <CursorPagerFooter hasPrevious hasNext busy summary="25 records loaded" onPrevious={() => {}} onNext={() => {}} />
  );
}
