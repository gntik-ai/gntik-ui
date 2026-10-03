'use client';
import { Plus, UserPlus } from '@gntik-ai/icons';
import { HomeDashboardPage } from '@gntik-ai/templates';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { activityAt } from '../../../data/activity';
import { shellFor } from '../../../data/console';
import { kpis, quickActions, requestRanges, requestsByRange } from '../../../data/dashboard';

const noopSubscribe = () => () => {};

/**
 * Workaround (kit gap): @gntik-ai/charts resolves series colours from the DOM in its initial state,
 * so the server renders chart legends without them and React does not patch attributes after
 * hydration. `hydrated` is false while hydrating and true right after, and the key change remounts
 * the template once on the client so the legend swatches get their colours. SSR output is kept.
 */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function DashboardView({ now }: { now: number }) {
  const router = useRouter();
  const hydrated = useHydrated();
  return (
    <HomeDashboardPage
      key={hydrated ? 'client' : 'server'}
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={[
        { label: 'Invite members', icon: UserPlus, variant: 'secondary', onClick: () => router.push('/settings/members') },
        { label: 'Projects', icon: Plus, variant: 'primary', onClick: () => router.push('/projects') },
      ]}
      kpis={kpis}
      requestsByRange={requestsByRange}
      requestRanges={requestRanges}
      activity={activityAt(now)}
      quickActions={quickActions}
      onViewAllActivity={() => router.push('/projects')}
      shell={shellFor('/dashboard')}
    />
  );
}
