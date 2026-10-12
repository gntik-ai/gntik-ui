import type { StatusEvent } from '@gntik-ai/blocks';
import ResourceDetailPage from '../Page';
import { shell } from './shell';

export default function RuntimeWithTransition() {
  const runtime = { state: 'Ready', lastTransitionAt: '2026-05-01T10:00:00Z' };
  // Map only the source's state and transition time; it supplies no actor or earlier events.
  const history: readonly StatusEvent[] = runtime.lastTransitionAt
    ? [
        {
          id: 'transition',
          status: runtime.state,
          tone: 'success',
          title: 'Runtime ready',
          at: runtime.lastTransitionAt,
        },
      ]
    : [];
  return (
    <ResourceDetailPage
      readOnly
      name="Function runtime"
      status="running"
      overviewTitle="Runtime details"
      details={[{ id: 'state', label: 'State', value: runtime.state }]}
      history={history}
      shell={shell}
    />
  );
}
