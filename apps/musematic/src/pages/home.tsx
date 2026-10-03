import { HomeDashboardPage } from '@gntik-ai/templates';
import { Bot, UserPlus } from '@gntik-ai/icons';
import { fleetActivity, fleetKpis, quickActions, runRanges, runsByRange } from '../data/dashboard';
import { currentWorkspace } from '../data/workspace';
import { navigate } from '../router';
import { shellFor } from '../shell';

export function Home() {
  return (
    <HomeDashboardPage
      title="Fleet overview"
      description={`How ${currentWorkspace.name}'s agents are doing: runs, reliability and spend.`}
      breadcrumbs={[{ label: currentWorkspace.name }]}
      actions={[
        { label: 'Invite members', icon: UserPlus, variant: 'secondary', onClick: () => navigate('/settings/members') },
        { label: 'New agent', icon: Bot, variant: 'primary', onClick: () => navigate('/agents/new') },
      ]}
      kpis={fleetKpis}
      requestsByRange={runsByRange}
      requestRanges={runRanges}
      activity={fleetActivity}
      quickActions={quickActions}
      onViewAllActivity={() => navigate('/runs')}
      shell={shellFor('/')}
    />
  );
}
