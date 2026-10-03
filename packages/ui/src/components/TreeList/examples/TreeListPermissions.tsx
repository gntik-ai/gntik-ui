import { useState } from 'react';
import { TreeList } from '../TreeList';
import type { TreeNode } from '../tree-model';

const NODES: TreeNode[] = [
  {
    id: 'projects',
    label: 'Projects',
    children: [
      { id: 'projects.read', label: 'View projects' },
      { id: 'projects.write', label: 'Edit projects' },
      { id: 'projects.delete', label: 'Delete projects' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing.invoices', label: 'View invoices' },
      { id: 'billing.methods', label: 'Manage payment methods', disabled: true },
    ],
  },
  { id: 'members', label: 'Invite members' },
];

export default function TreeListPermissions() {
  const [selected, setSelected] = useState(['projects.read']);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <TreeList
        aria-label="Role permissions"
        nodes={NODES}
        selectionMode="multiple"
        selected={selected}
        onSelectedChange={setSelected}
        defaultExpanded={['projects', 'billing']}
        className="rounded-lg border border-border bg-card p-1.5"
      />
      <p className="font-mono text-[11px] text-muted-foreground">{selected.length} selected</p>
    </div>
  );
}
