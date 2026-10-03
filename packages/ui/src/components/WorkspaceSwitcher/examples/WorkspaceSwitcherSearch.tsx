import { useState } from 'react';
import { WorkspaceSwitcher, type Workspace } from '../WorkspaceSwitcher';

const TEAMS = ['Acme Industries', 'Billing', 'Data Platform', 'Design Team', 'Growth', 'Infrastructure', 'Marketing Site', 'Mobile Apps', 'Partner Portal', 'Research', 'Security', 'Support'];
const WORKSPACES: Workspace[] = TEAMS.map((name, i) => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  meta: `${i % 3 === 0 ? 'Enterprise' : 'Pro'} · ${i % 2 === 0 ? 'Admin' : 'Member'}`,
}));

export default function WorkspaceSwitcherSearch() {
  const [current, setCurrent] = useState('data-platform');
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
