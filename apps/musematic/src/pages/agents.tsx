import { DEPLOYMENT_COLUMNS, type SavedView } from '@gntik-ai/blocks';
import { Activity, FlaskConical } from '@gntik-ai/icons';
import { CreateWizardPage, ResourceDetailPage, ResourceIndexPage } from '@gntik-ai/templates';
import { agentActivity, agentDangerActions, agentDetails, agentEvents, agentMeta } from '../data/agent-detail';
import { agentRows, findAgent } from '../data/agents';
import { agentRegions, agentSources, agentSteps } from '../data/agent-wizard';
import { navigate } from '../router';
import { shellFor } from '../shell';
import { NotFound } from './not-found';

const HEADERS: Record<string, string> = { name: 'Agent', requests: 'Runs · 24h', cost: 'Spend · 30d' };
const agentColumns = DEPLOYMENT_COLUMNS.map((c) => ({ ...c, header: HEADERS[c.id] ?? c.header }));

const agentViews: SavedView[] = [
  { value: 'all', label: 'All agents', filters: [] },
  { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
  { value: 'eu', label: 'EU fleets', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];

export function AgentsIndex() {
  return (
    <ResourceIndexPage
      title="Agents"
      description="Every agent in this workspace, the model it runs on and how it is doing."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Agents' }]}
      rows={agentRows}
      columns={agentColumns}
      savedViews={agentViews}
      noun={['agent', 'agents']}
      createLabel="New agent"
      onCreate={() => navigate('/agents/new')}
      onOpen={(row) => navigate(`/agents/${row.id}`)}
      shell={shellFor('/agents')}
    />
  );
}

export function AgentDetail({ id }: { id: string }) {
  const agent = findAgent(id);
  if (!agent) return <NotFound />;
  return (
    <ResourceDetailPage
      key={agent.id}
      name={agent.name}
      description={agent.description}
      status={agent.status}
      breadcrumbs={[{ label: 'Agents', href: '/agents' }, { label: agent.name, mono: true }]}
      meta={agentMeta(agent)}
      actions={[
        { label: 'View runs', icon: Activity, variant: 'secondary', onClick: () => navigate('/runs') },
        { label: 'Run evaluation', icon: FlaskConical, variant: 'primary', onClick: () => navigate('/evaluations') },
      ]}
      details={agentDetails(agent)}
      events={agentEvents(agent)}
      activity={agentActivity(agent)}
      dangerActions={agentDangerActions(agent)}
      onDangerAction={(action) => {
        if (action === 'delete') navigate('/agents');
      }}
      shell={shellFor('/agents')}
    />
  );
}

export function AgentNew() {
  return (
    <CreateWizardPage
      title="New agent"
      steps={agentSteps}
      sources={agentSources}
      regions={agentRegions}
      initialValues={{ name: '', description: '', source: 'template', region: 'eu-west-1', previews: true }}
      onFinish={() => new Promise<void>((resolve) => setTimeout(resolve, 600)).then(() => navigate('/agents'))}
      onExit={() => navigate('/agents')}
    />
  );
}
