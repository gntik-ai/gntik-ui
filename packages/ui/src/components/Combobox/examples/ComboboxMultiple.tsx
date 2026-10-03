import { useState } from 'react';
import { Combobox, ComboboxChipsInput, ComboboxContent, ComboboxItem } from '../Combobox';

interface Permission {
  value: string;
  label: string;
  note: string;
}

const permissions: Permission[] = [
  { value: 'projects-read', label: 'Read projects', note: 'projects' },
  { value: 'projects-write', label: 'Edit projects', note: 'projects' },
  { value: 'deploy', label: 'Run deployments', note: 'deployments' },
  { value: 'members', label: 'Manage members', note: 'members' },
  { value: 'billing', label: 'View billing', note: 'billing' },
  { value: 'audit', label: 'Export audit log', note: 'compliance' },
];

export default function ComboboxMultiple() {
  const [value, setValue] = useState<Permission[]>(permissions.filter((p) => p.value === 'projects-read' || p.value === 'deploy'));
  return (
    <div className="w-full max-w-sm">
      <Combobox items={permissions} multiple value={value} onValueChange={setValue}>
        <ComboboxChipsInput<Permission> label="Role permissions" placeholder="Add permission…" />
        <ComboboxContent emptyText="No permissions match.">
          {(p: Permission) => (
            <ComboboxItem key={p.value} value={p}>
              <span className="truncate">{p.label}</span>
              <span className="ms-auto font-mono text-[11px] text-muted-foreground">{p.note}</span>
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <p className="mt-2 text-[12px] text-muted-foreground">Backspace in the empty input removes the last chip.</p>
    </div>
  );
}
