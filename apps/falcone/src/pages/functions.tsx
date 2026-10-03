import type { DataTableColumn, FilterField, SavedView } from '@gntik-ai/blocks';
import { ResourceIndexPage } from '@gntik-ai/templates';
import { StatusTag } from '@gntik-ai/ui';
import { functions, type FalconeFunction } from '../data/functions';
import { navigate } from '../router';
import { shellFor } from '../shell';

const count = new Intl.NumberFormat('en-US');

const functionColumns: DataTableColumn<FalconeFunction>[] = [
  { id: 'name', header: 'Function', accessor: (f) => f.name, sortable: true, hideable: false },
  { id: 'project', header: 'Project', accessor: (f) => f.projectId, sortable: true },
  { id: 'stage', header: 'Stage', accessor: (f) => f.stage, sortable: true },
  { id: 'runtime', header: 'Runtime', accessor: (f) => f.runtime, sortable: true },
  { id: 'status', header: 'Status', accessor: (f) => f.status, cell: (f) => <StatusTag status={f.status} />, sortable: true },
  { id: 'invocations', header: 'Invocations · 24h', accessor: (f) => f.invocations24h, cell: (f) => count.format(f.invocations24h), sortable: true, align: 'right' },
  { id: 'p95', header: 'p95', accessor: (f) => f.p95Ms, cell: (f) => `${count.format(f.p95Ms)} ms`, sortable: true, align: 'right' },
  { id: 'errors', header: 'Errors', accessor: (f) => f.errorRate, cell: (f) => `${(f.errorRate * 100).toFixed(2)}%`, sortable: true, align: 'right' },
];

const functionFilters: FilterField[] = [
  { id: 'stage', label: 'Stage', options: ['dev', 'staging', 'prod'] },
  { id: 'runtime', label: 'Runtime', options: ['node22', 'python3.13', 'go1.24', 'deno2'] },
  { id: 'status', label: 'Status', options: ['Running', 'Degraded', 'Failed', 'Paused'] },
];

const functionViews: SavedView[] = [
  { value: 'all', label: 'All functions', filters: [] },
  { value: 'prod', label: 'prod', filters: [{ field: 'stage', value: 'prod' }] },
  { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
];

/** Functions across every project; the project cell links to the project detail. */
export function FunctionsIndex() {
  return (
    <ResourceIndexPage<FalconeFunction>
      title="Functions"
      description="Every deployed function in this tenant, per stage: runtime, invocations, p95 latency and error rate."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Functions' }]}
      rows={functions}
      columns={functionColumns}
      filterFields={functionFilters}
      savedViews={functionViews}
      linkColumnId="project"
      getRowHref={(f) => `/projects/${f.projectId}`}
      noun={['function', 'functions']}
      createLabel="Deploy function"
      onCreate={() => undefined}
      onOpen={(f) => navigate(`/projects/${f.projectId}`)}
      shell={shellFor('/functions')}
    />
  );
}
