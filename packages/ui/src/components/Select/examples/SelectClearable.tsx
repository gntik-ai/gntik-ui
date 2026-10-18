import { useState } from 'react';
import { SimpleSelect } from '../Select';

const items = [
  { value: 'eu-west-1', label: 'EU West' },
  { value: 'us-east-1', label: 'US East' },
];
export default function SelectClearable() {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="grid max-w-sm gap-4">
      <SimpleSelect clearable label="Region" items={items} defaultValue="eu-west-1" onClear={() => setCleared(true)} />
      <SimpleSelect
        clearable
        clearLabel="Reset backup region"
        label="Backup region"
        items={items}
        defaultValue="us-east-1"
      />
      <p className="text-sm text-muted-foreground">
        {cleared ? 'Region cleared.' : 'Delete or Backspace on the trigger clears the selection.'}
      </p>
    </div>
  );
}
