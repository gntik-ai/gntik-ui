import type { StatusEvent } from '@gntik-ai/blocks';
import ResourceDetailPage from '../Page';
import { shell } from './shell';

export default function RuntimeWithoutTransition() {
  const runtime: { state: string; lastTransitionAt: string | null } = {
    state: 'Pending',
    lastTransitionAt: null,
  };
  // Null transition time means explicit empty history, not an invented event or an omitted card.
  const history: readonly StatusEvent[] = runtime.lastTransitionAt
    ? [
        {
          id: 'transition',
          status: runtime.state,
          tone: 'warning',
          title: 'Runtime pending',
          at: runtime.lastTransitionAt,
        },
      ]
    : [];
  return (
    <ResourceDetailPage
      readOnly
      name="Function runtime"
      status="pending"
      overviewTitle="Runtime details"
      details={[{ id: 'state', label: 'State', value: runtime.state }]}
      history={history}
      shell={shell}
    />
  );
}
