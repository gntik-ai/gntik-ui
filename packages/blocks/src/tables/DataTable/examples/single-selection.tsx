import { useState } from 'react';
import { DataTable } from '../DataTable';

const items = [
  { id: 'item-a', name: 'Item A' },
  { id: 'item-b', name: 'Item B' },
  { id: 'item-c', name: 'Item C' },
];
const itemColumns = [{ id: 'name', header: 'Name', accessor: (row: (typeof items)[number]) => row.name }];
const versions = [
  { id: 'v3', name: 'Version 3', eligible: true },
  { id: 'v2', name: 'Version 2', eligible: false },
  { id: 'v1', name: 'Version 1', eligible: true },
];
const versionColumns = [{ id: 'name', header: 'Version', accessor: (row: (typeof versions)[number]) => row.name }];

/** Supplied selectionName values must be unique per page; omitted names are instance-unique. */
export default function SingleSelectionExample() {
  const [selectedId, setSelectedId] = useState<string | null>('v2');
  return (
    <div className="space-y-4">
      <DataTable
        rows={items}
        columns={itemColumns}
        caption="Items"
        selectionMode="single"
        paginated={false}
        legend="Available items"
        selectionName="example-item-choice"
        defaultSelectedId="item-a"
        showColumnMenu={false}
        showDensityToggle={false}
      />
      <DataTable
        rows={versions}
        columns={versionColumns}
        caption="Versions"
        selectionMode="single"
        legend="Available versions"
        selectionName="example-version-choice"
        getRowLabel={(row) => row.name}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        isRowDisabled={(row) => !row.eligible}
        showColumnMenu={false}
        showDensityToggle={false}
      />
    </div>
  );
}
