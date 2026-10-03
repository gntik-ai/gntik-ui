import { Button } from '../../Button';
import { BottomSheet, BottomSheetContent, BottomSheetTrigger } from '../BottomSheet';

const rows = [
  ['Invoice', 'INV-2041'],
  ['Period', 'Sep 1 – Sep 30'],
  ['Projects', '12'],
  ['Compute', '$1,284.00'],
  ['Storage', '$212.40'],
  ['Total', '$1,496.40'],
];

export default function BottomSheetDetails() {
  return (
    <BottomSheet snapPoints={[0.35, 0.7, 1]}>
      <BottomSheetTrigger render={<Button variant="secondary" />}>Invoice details</BottomSheetTrigger>
      <BottomSheetContent title="INV-2041" description="Northwind workspace · paid">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-end font-mono text-foreground tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </BottomSheetContent>
    </BottomSheet>
  );
}
