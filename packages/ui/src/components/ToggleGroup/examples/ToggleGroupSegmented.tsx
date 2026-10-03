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
      {/* Keep one item pressed: ignore the change that would empty the group. */}
      <ToggleGroup aria-label="Filter deployments" value={value} onValueChange={(v) => v.length && setValue(v)}>
        {filters.map((f) => (
          <Toggle key={f.value} value={f.value}>
            {f.label}
            <span className="font-mono text-[10.5px] opacity-70">{f.count}</span>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup aria-label="Chart range" size="sm" defaultValue={['7d']}>
        <Toggle value="24h">24h</Toggle>
        <Toggle value="7d">7d</Toggle>
        <Toggle value="30d">30d</Toggle>
        <Toggle value="90d" disabled>90d</Toggle>
      </ToggleGroup>
    </div>
  );
}
