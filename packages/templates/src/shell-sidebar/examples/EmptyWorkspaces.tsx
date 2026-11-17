import { useState } from 'react';
import { Button, Text } from '@gntik-ai/ui';
import ShellSidebarPage from '../Page';

export default function EmptyWorkspaces() {
  const [currentTenantId, onTenantSelect] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <ShellSidebarPage
      shell={{
        tenants: [
          { id: 'one', name: 'One' },
          { id: 'two', name: 'Two' },
        ],
        currentTenantId,
        onTenantSelect,
        tenantLabel: 'Organization',
        tenantPlaceholder: 'Choose an organization',
        navLabel: 'Primary navigation',
        workspaces: [],
        workspaceLabel: 'Team spaces',
        workspaceEmptyText: 'No team spaces yet',
        onCreateWorkspace: canCreate ? () => setMessage('Ready to create a workspace') : undefined,
      }}
    >
      <Button onClick={() => setCanCreate(!canCreate)}>
        {canCreate ? 'Disable workspace creation' : 'Enable workspace creation'}
      </Button>
      <Text role="status">{message}</Text>
    </ShellSidebarPage>
  );
}
