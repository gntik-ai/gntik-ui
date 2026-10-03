import { useState } from 'react';
import { TransferList } from '../TransferList';

const columns = [
  { value: 'name', label: 'Name', description: 'Project name' },
  { value: 'owner', label: 'Owner', description: 'Member who created it' },
  { value: 'status', label: 'Status', description: 'Last deployment result' },
  { value: 'region', label: 'Region' },
  { value: 'created', label: 'Created', description: 'Creation date' },
  { value: 'updated', label: 'Last updated' },
  { value: 'cost', label: 'Monthly cost', description: 'From the latest invoice' },
  { value: 'id', label: 'Project ID', disabled: true },
];

export default function TransferListColumns() {
  const [visible, setVisible] = useState(['name', 'status', 'updated']);
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <TransferList items={columns} value={visible} onValueChange={setVisible} titles={{ available: 'Hidden columns', selected: 'Visible columns' }} />
      <p className="text-[12px] text-muted-foreground">Table order: {visible.join(' · ')}</p>
    </div>
  );
}
