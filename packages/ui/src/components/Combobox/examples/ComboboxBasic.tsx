import { useState } from 'react';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../Combobox';

interface Runtime {
  value: string;
  label: string;
  note: string;
}

const runtimes: Runtime[] = [
  { value: 'node-24', label: 'node-24', note: 'JavaScript' },
  { value: 'node-22', label: 'node-22', note: 'JavaScript' },
  { value: 'python-3.13', label: 'python-3.13', note: 'Python' },
  { value: 'python-3.12', label: 'python-3.12', note: 'Python' },
  { value: 'go-1.24', label: 'go-1.24', note: 'Go' },
  { value: 'java-21', label: 'java-21', note: 'Java' },
  { value: 'ruby-3.4', label: 'ruby-3.4', note: 'Ruby' },
];

export default function ComboboxBasic() {
  const [runtime, setRuntime] = useState<Runtime | null>(runtimes[0] ?? null);
  return (
    <div className="w-full max-w-sm">
      <Combobox items={runtimes} value={runtime} onValueChange={setRuntime}>
        <ComboboxInput label="Function runtime" placeholder="Search runtimes…" showClear />
        <ComboboxContent emptyText="No runtimes match.">
          {(item: Runtime) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="truncate font-medium">{item.label}</span>
              <span className="ms-auto font-mono text-[11px] text-muted-foreground">{item.note}</span>
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <p className="mt-2 text-[12px] text-muted-foreground">Type to filter; Enter picks the highlighted runtime.</p>
    </div>
  );
}
