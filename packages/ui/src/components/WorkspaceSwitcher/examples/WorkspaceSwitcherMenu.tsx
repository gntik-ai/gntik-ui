import { useState } from 'react';
import { WorkspaceSwitcher, type Workspace } from '../WorkspaceSwitcher';

const WORKSPACES: Workspace[] = [
  { id: 'acme', name: 'Acme Industries', meta: 'Enterprise · Owner' },
  { id: 'design', name: 'Design Team', meta: 'Pro · Admin' },
  { id: 'platform', name: 'Platform', meta: 'Pro · Member' },
  { id: 'personal', name: 'Personal', meta: 'Free · Owner' },
];

export default function WorkspaceSwitcherMenu() {
  const [current, setCurrent] = useState('acme');
  const [log, setLog] = useState('');
  return (
    <div className="flex flex-col items-center gap-3">
      <WorkspaceSwitcher
        workspaces={WORKSPACES}
        currentId={current}
        onSelect={(w) => {
          setCurrent(w.id);
          setLog(`Switched to ${w.name}`);
        }}
        onCreate={() => setLog('Create workspace')}
      />
      <p aria-live="polite" className="h-4 font-mono text-[11px] text-muted-foreground">
        {log}
      </p>
    </div>
  );
}
