import { useState } from 'react';
import { Token } from '../Token';

const INITIAL = [
  { key: 'Status', value: 'Failed' },
  { key: 'Region', value: 'eu-west-1' },
  { key: 'Region', value: 'us-east-1' },
  { key: 'Owner', value: 'Platform team' },
];

export default function TokenFilters() {
  const [filters, setFilters] = useState(INITIAL);
  const remove = (index: number) => setFilters((list) => list.filter((_, i) => i !== index));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Filters</span>
      {filters.map((f, i) => (
        <Token key={`${f.key}-${f.value}`} prefix={`${f.key}:`} label={f.value} onRemove={() => remove(i)} />
      ))}
      {filters.length > 0 ? (
        <button
          type="button"
          onClick={() => setFilters([])}
          className="inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-destructive-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Clear all
        </button>
      ) : (
        <span className="text-[12px] text-muted-foreground">No filters applied</span>
      )}
    </div>
  );
}
