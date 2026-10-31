import { useState } from 'react';
import { Button, Text } from '@gntik-ai/ui';
import ShellSidebarPage from '../Page';

const tenants = [
  { id: 't1', name: 'One' },
  { id: 't2', name: 'Two' },
];
const workspaces = Array.from({ length: 7 }, (_, i) => ({ id: `space-${i}`, name: `Space ${i + 1}` }));

export default function Tenants() {
  const [currentTenantId, onTenantSelect] = useState<string | null>('t1');
  const [empty, setEmpty] = useState(false);
  return (
    <ShellSidebarPage
      shell={{
        tenants: empty ? [] : tenants,
        currentTenantId,
        onTenantSelect,
        tenantLabel: 'Organization',
        tenantEmptyText: 'No organizations',
        workspaces,
        workspaceLabel: 'Team spaces',
        workspaceEmptyText: 'No matching team spaces',
        contextStatus: (
          <Text variant="caption" role="status">
            {currentTenantId ? `Organization ${currentTenantId === 't1' ? 'One' : 'Two'}` : 'Platform context'}
          </Text>
        ),
      }}
    >
      <Button
        onClick={() => {
          setEmpty(!empty);
          onTenantSelect(null);
        }}
      >
        {empty ? 'Restore tenants' : 'Show empty tenant list'}
      </Button>
    </ShellSidebarPage>
  );
}
