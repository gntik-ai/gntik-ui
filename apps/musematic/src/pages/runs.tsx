import { DEPLOYMENT_COLUMNS, DescriptionListCard, PageHeader, TokenCostCard, TraceWaterfall, type SavedView } from '@gntik-ai/blocks';
import { Bot, Clock, Cpu, RotateCw, Zap } from '@gntik-ai/icons';
import { ConsoleShell, ResourceIndexPage } from '@gntik-ai/templates';
import { Grid, GridItem, Page, Stack } from '@gntik-ai/ui';
import { findRun, runRows, runUsage } from '../data/runs';
import { navigate } from '../router';
import { shellFor } from '../shell';
import { NotFound } from './not-found';

const HEADERS: Record<string, string> = { name: 'Run', requests: 'Tokens', cost: 'Cost', updated: 'Started' };
const runColumns = DEPLOYMENT_COLUMNS.map((c) => ({ ...c, header: HEADERS[c.id] ?? c.header }));

const runViews: SavedView[] = [
  { value: 'all', label: 'All runs', filters: [] },
  { value: 'failing', label: 'Failed or retrying', filters: [{ field: 'status', value: 'Failed' }, { field: 'status', value: 'Degraded' }] },
  { value: 'approval', label: 'Awaiting approval', filters: [{ field: 'status', value: 'Paused' }] },
];

export function RunsIndex() {
  return (
    <ResourceIndexPage
      title="Runs"
      description="Runs in flight and runs that need attention, across every agent. Paused runs wait for human approval; degraded runs are retrying."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Runs' }]}
      rows={runRows}
      columns={runColumns}
      savedViews={runViews}
      noun={['run', 'runs']}
      createLabel="Start a run"
      onCreate={() => navigate('/assistant')}
      onOpen={(row) => navigate(`/runs/${row.id}`)}
      shell={shellFor('/runs')}
    />
  );
}

const ms = (n: number) => `${n.toLocaleString('en-US')} ms`;

/** Trace page: ConsoleShell + Page + PageHeader, the span waterfall and the run's token cost. */
export function RunTrace({ id }: { id: string }) {
  const run = findRun(id);
  if (!run) return <NotFound />;
  return (
    <ConsoleShell {...shellFor('/runs')} breadcrumbs={[{ label: 'Runs', href: '/runs' }, { label: run.id, mono: true }]}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={run.id}
            description={`${run.agentName} · triggered by ${run.trigger}`}
            status={run.status}
            meta={[
              { label: 'Agent', value: run.agentName, icon: Bot, mono: true },
              { label: 'Model', value: run.model, icon: Cpu, mono: true },
              { label: 'Duration', value: ms(run.durationMs), icon: Zap, mono: true },
              { label: 'Started', value: run.startedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), icon: Clock },
            ]}
            tabs={null}
            actions={[
              { label: 'Open agent', icon: Bot, variant: 'secondary', onClick: () => navigate(`/agents/${run.agentId}`) },
              { label: 'Re-run', icon: RotateCw, variant: 'primary' },
            ]}
          />
        }
      >
        <Grid cols={{ base: 1, xl: 3 }} gap={6} align="start">
          <GridItem span={{ base: 1, xl: 2 }}>
            <TraceWaterfall key={run.id} spans={run.spans} title="Trace" />
          </GridItem>
          <Stack gap={6}>
            <TokenCostCard periods={runUsage(run)} currency="USD" title="Tokens and cost" description={`${run.model} · budget per run`} />
            <DescriptionListCard
              title="Run"
              description="How this run started and where it ran."
              items={[
                { id: 'id', label: 'Run ID', value: run.id, mono: true, copyable: true },
                { id: 'status', label: 'Status', value: run.status, status: run.status },
                { id: 'trigger', label: 'Trigger', value: run.trigger, mono: true },
                { id: 'region', label: 'Region', value: run.region, mono: true },
                { id: 'spans', label: 'Spans', value: String(run.spans.length) },
              ]}
            />
          </Stack>
        </Grid>
      </Page>
    </ConsoleShell>
  );
}
