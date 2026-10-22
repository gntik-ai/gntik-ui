import { Checkbox } from '@gntik-ai/ui';
import { useState } from 'react';
import { DataTable } from '../DataTable';

const rows = Array.from({ length: 95 }, (_, index) => ({
  id: String(index + 1),
  name: `Item ${index + 1}`,
  locked: index === 3,
}));
const columns = [{ id: 'name', header: 'Name', accessor: (row: (typeof rows)[number]) => row.name }];

/** Client preservation retains a selected row even when the consumer removes it from rows. */
export default function ClientSelectionExample() {
  const [showFirst, setShowFirst] = useState(true);
  const [ids, setIds] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <Checkbox label="Show first item" checked={showFirst} onCheckedChange={setShowFirst} />
      <DataTable
        caption="Items"
        rows={showFirst ? rows : rows.slice(1)}
        columns={columns}
        preserveSelection
        selectAllMatching
        isRowDisabled={(row) => row.locked}
        onSelectionChange={setIds}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Selected ids: {ids.join(', ') || 'none'}
      </p>
    </div>
  );
}
