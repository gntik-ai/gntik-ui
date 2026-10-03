import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { BottomSheet, BottomSheetClose, BottomSheetContent, BottomSheetTrigger } from '../BottomSheet';

const statuses = ['Running', 'Queued', 'Succeeded', 'Failed', 'Cancelled'];

export default function BottomSheetFilters() {
  return (
    <BottomSheet snapPoints={['18rem', 1]}>
      <BottomSheetTrigger render={<Button variant="secondary" icon={SlidersHorizontal} />}>Filter deployments</BottomSheetTrigger>
      <BottomSheetContent
        title="Filter deployments"
        description="Drag the handle up for more options."
        footer={
          <>
            <BottomSheetClose render={<Button variant="ghost" />}>Reset</BottomSheetClose>
            <BottomSheetClose render={<Button />}>Show results</BottomSheetClose>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2 text-[12px] font-medium text-muted-foreground">Status</legend>
          {statuses.map((s) => (
            <Checkbox key={s} label={s} defaultChecked={s === 'Failed'} />
          ))}
        </fieldset>
      </BottomSheetContent>
    </BottomSheet>
  );
}
