import { useState } from 'react';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';

export default function WorkspaceSwitcherMenuEmpty() {
  const [message, setMessage] = useState('');
  return (
    <div className="flex flex-col items-start gap-3">
      <WorkspaceSwitcher
        workspaces={[]}
        currentId=""
        onSelect={() => {}}
        label="Team spaces"
        emptyText="No team spaces yet"
        onCreate={() => setMessage('Ready to create a workspace')}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
