import { useState } from 'react';
import { DataTable } from '../../DataTable/DataTable';
import { CursorPagerFooter } from '../CursorPagerFooter';

// Mock API responses: only this consumer stores or interprets opaque continuation tokens.
const responses: Record<string, { rows: { name: string }[]; next?: string }> = {
  start: { rows: [{ name: 'Record A' }], next: 'opaque-k7' },
  'opaque-k7': { rows: [{ name: 'Record B' }], next: 'opaque-m9' },
  'opaque-m9': { rows: [{ name: 'Record C' }] },
};

export default function CursorStack() {
  const [stack, setStack] = useState<string[]>([]);
  const response = responses[stack.at(-1) ?? 'start'] ?? responses.start!;
  return (
    <div className="space-y-4">
      <DataTable
        rows={response.rows}
        columns={[{ id: 'name', header: 'Name', accessor: (row) => row.name }]}
        caption="Records"
        paginated={false}
        selectable={false}
        showColumnMenu={false}
        showDensityToggle={false}
        showViewSwitcher={false}
        resizable={false}
      />
      <CursorPagerFooter
        hasPrevious={stack.length > 0}
        hasNext={response.next !== undefined}
        onPrevious={() => setStack((current) => current.slice(0, -1))}
        onNext={() => {
          if (response.next) setStack((current) => [...current, response.next!]);
        }}
        shownCount={response.rows.length}
        labels={{ shownSummary: (n) => `${n} records shown`, totalSummary: (n) => `${n} records in total` }}
      />
    </div>
  );
}
