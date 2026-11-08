import { useEffect, useState } from 'react';
import { SearchField } from '../SearchField';

const NAMES = ['api-gateway', 'api-worker', 'billing', 'billing-cron', 'web'];

export default function SearchFieldPending() {
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setPending(false), 600);
    return () => clearTimeout(id);
  }, [pending, committed]);
  const results = NAMES.filter((name) => name.includes(committed));
  return (
    <div className="grid max-w-sm gap-3">
      <SearchField
        aria-label="Search services"
        placeholder="Search services…"
        value={query}
        onValueChange={setQuery}
        debounceMs={300}
        pending={pending}
        onSearch={(value) => {
          setCommitted(value);
          setPending(true);
        }}
      />
      <ul className="text-[13px] text-muted-foreground" aria-label="Services">
        {results.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
