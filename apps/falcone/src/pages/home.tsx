import { chartFmt } from '@gntik-ai/charts';
import { Boxes, UserPlus } from '@gntik-ai/icons';
import { HomeDashboardPage } from '@gntik-ai/templates';
import {
  homeActivity,
  homeKpis,
  invocationRanges,
  invocationsByRange,
  quickActions,
  spendByRange,
  spendRanges,
  type InvocationPoint,
  type SpendPoint,
} from '../data/dashboard';
import { currentTenant } from '../data/tenant';
import { navigate } from '../router';
import { shellFor } from '../shell';

export function Home() {
  return (
    <HomeDashboardPage<SpendPoint, InvocationPoint>
      title="Tenant overview"
      description={`How ${currentTenant.name}'s projects are doing: invocations, errors, latency and metered cost.`}
      breadcrumbs={[{ label: currentTenant.name }]}
      actions={[
        { label: 'Invite members', icon: UserPlus, variant: 'secondary', onClick: () => navigate('/settings/members') },
        { label: 'New project', icon: Boxes, variant: 'primary', onClick: () => navigate('/projects') },
      ]}
      kpis={homeKpis}
      primaryChart={{
        title: 'Metered cost',
        description: 'Spend per day, by meter',
        ranges: spendRanges,
        dataByRange: spendByRange,
        index: 'day',
        categories: ['Compute', 'LLM tokens', 'Egress'],
        valueFormatter: chartFmt.usd,
      }}
      secondaryChart={{ title: 'Invocations', description: 'Invocations and errors per day', index: 'day', categories: ['Invocations', 'Errors'], valueFormatter: chartFmt.compact }}
      requestsByRange={invocationsByRange}
      requestRanges={invocationRanges}
      activity={homeActivity}
      quickActions={quickActions}
      onViewAllActivity={() => navigate('/audit')}
      shell={shellFor('/')}
    />
  );
}
