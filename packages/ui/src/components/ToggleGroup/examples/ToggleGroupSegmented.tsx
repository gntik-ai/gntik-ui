import { useState } from 'react';
import { Toggle, ToggleGroup } from '../ToggleGroup';

const filters = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'active', label: 'Active', count: 9 },
  { value: 'paused', label: 'Paused', count: 3 },
];

export default function ToggleGroupSegmented() {
  const [value, setValue] = useState(['all']);
  return (
    <div className="flex flex-col items-start gap-5">
      <ToggleGroup aria-label="Filter deployments" disallowEmptySelection value={value} onValueChange={setValue}>
        {filters.map((f) => (
          <Toggle key={f.value} value={f.value} count={f.count}>
            {f.label}
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup aria-label="Chart range" size="sm" disallowEmptySelection defaultValue={['7d']}>
        <Toggle value="24h">24h</Toggle>
        <Toggle value="7d">7d</Toggle>
        <Toggle value="30d">30d</Toggle>
        <Toggle value="90d" disabled>
          90d
        </Toggle>
      </ToggleGroup>
    </div>
  );
}
