import { useState } from 'react';
import { MultiSelect, type MultiSelectOption } from '../MultiSelect';

const TOPICS: MultiSelectOption[] = [
  { value: 'billing', label: 'billing', description: '128 issues' },
  { value: 'onboarding', label: 'onboarding', description: '42 issues' },
  { value: 'performance', label: 'performance', description: '77 issues' },
  { value: 'search', label: 'search', description: '19 issues' },
  { value: 'security', label: 'security', description: '35 issues' },
];

/** Stands in for `fetch('/api/topics?q=…', { signal })`. */
function searchTopics(query: string, { signal }: { signal: AbortSignal }): Promise<MultiSelectOption[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(TOPICS.filter((t) => t.label.includes(query.toLowerCase()))), 250);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function MultiSelectAsync() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="w-full max-w-sm">
      <MultiSelect
        label="Topics"
        placeholder="Search or create topics…"
        options={[]}
        value={value}
        onValueChange={setValue}
        loadOptions={searchTopics}
        onCreate={(input) => {
          const created = { value: input.toLowerCase(), label: input.toLowerCase(), description: 'New topic' };
          TOPICS.push(created);
          return created;
        }}
      />
    </div>
  );
}
