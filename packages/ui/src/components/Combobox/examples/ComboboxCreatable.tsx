import { useState } from 'react';
import { Combobox, ComboboxChipsInput, ComboboxContent, ComboboxItem } from '../Combobox';

interface Label {
  value: string;
  label: string;
}

const INITIAL: Label[] = [
  { value: 'bug', label: 'bug' },
  { value: 'docs', label: 'docs' },
  { value: 'performance', label: 'performance' },
  { value: 'security', label: 'security' },
];

export default function ComboboxCreatable() {
  const [labels, setLabels] = useState(INITIAL);
  const [value, setValue] = useState<Label[]>([INITIAL[0] as Label]);
  return (
    <div className="w-full max-w-sm">
      <Combobox<Label, true>
        items={labels}
        multiple
        value={value}
        onValueChange={setValue}
        onCreate={(input) => {
          const created = { value: input.toLowerCase().replace(/\s+/g, '-'), label: input };
          setLabels((prev) => [...prev, created]);
          return created;
        }}
      >
        <ComboboxChipsInput<Label> label="Labels" placeholder="Add or create a label…" />
        <ComboboxContent>
          {(l: Label) => (
            <ComboboxItem key={l.value} value={l}>
              {l.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <p className="mt-2 text-[12px] text-muted-foreground">Type a new name and press Enter on “Create” to add it.</p>
    </div>
  );
}
