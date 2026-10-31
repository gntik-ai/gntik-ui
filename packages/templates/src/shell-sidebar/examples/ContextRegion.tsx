import { Badge, Button } from '@gntik-ai/ui';
import { useState } from 'react';
import ShellSidebarPage from '../Page';

export default function ContextRegion() {
  const [busy, setBusy] = useState(true);
  const [currentTenantId, onTenantSelect] = useState<string | null>('t1');
  return (
    <ShellSidebarPage
      shell={{
        tenants: [
          { id: 't1', name: 'One' },
          { id: 't2', name: 'Two' },
        ],
        currentTenantId,
        onTenantSelect,
        contextRegionLabel: 'Active context',
        // The consumer owns this lifetime and must reset it when loading completes.
        contextBusy: busy,
        contextStatus: <Badge role="status">{busy ? 'Updating context' : 'Context ready'}</Badge>,
      }}
    >
      <Button onClick={() => setBusy(!busy)}>{busy ? 'Finish context update' : 'Reload context'}</Button>
    </ShellSidebarPage>
  );
}
