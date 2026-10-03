import type { DataTableColumn, FilterField, SavedView } from '@gntik-ai/blocks';
import { BarChart3, Workflow } from '@gntik-ai/icons';
import { ResourceDetailPage, ResourceIndexPage } from '@gntik-ai/templates';
import { StatusTag } from '@gntik-ai/ui';
import { projectActivity, projectDangerActions, projectDetails, projectEvents, projectMeta } from '../data/project-detail';
import { findProject, projects, type Project } from '../data/projects';
import { workflows } from '../data/workflows';
import { navigate } from '../router';
import { shellFor } from '../shell';
import { NotFound } from './not-found';

const count = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const projectColumns: DataTableColumn<Project>[] = [
  { id: 'name', header: 'Project', accessor: (p) => p.name, sortable: true, hideable: false },
  { id: 'status', header: 'Status', accessor: (p) => p.status, cell: (p) => <StatusTag status={p.status} />, sortable: true },
  { id: 'stages', header: 'Stages', accessor: (p) => p.stages.join(' · ') },
  { id: 'region', header: 'Region', accessor: (p) => p.region, sortable: true },
  { id: 'functions', header: 'Functions', accessor: (p) => p.functions, sortable: true, align: 'right' },
  { id: 'invocations', header: 'Invocations · 24h', accessor: (p) => p.invocations24h, cell: (p) => count.format(p.invocations24h), sortable: true, align: 'right' },
  { id: 'p95', header: 'p95', accessor: (p) => p.p95Ms, cell: (p) => `${count.format(p.p95Ms)} ms`, sortable: true, align: 'right' },
  { id: 'cost', header: 'Cost · 30d', accessor: (p) => p.cost30d, cell: (p) => usd.format(p.cost30d), sortable: true, align: 'right' },
];

const projectFilters: FilterField[] = [
  { id: 'status', label: 'Status', options: ['Running', 'Degraded', 'Failed', 'Paused'] },
  { id: 'region', label: 'Region', options: ['eu-west-1', 'eu-central-1', 'us-east-1'] },
];

const projectViews: SavedView[] = [
  { value: 'all', label: 'All projects', filters: [] },
  { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
  { value: 'eu', label: 'EU regions', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];

export function ProjectsIndex() {
  return (
    <ResourceIndexPage<Project>
      title="Projects"
      description="Every project in this tenant: its stages, functions, traffic and metered cost."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
      rows={projects}
      columns={projectColumns}
      filterFields={projectFilters}
      savedViews={projectViews}
      getRowHref={(p) => `/projects/${p.id}`}
      noun={['project', 'projects']}
      createLabel="New project"
      onCreate={() => undefined}
      onOpen={(p) => navigate(`/projects/${p.id}`)}
      shell={shellFor('/projects')}
    />
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const project = findProject(id);
  if (!project) return <NotFound />;
  const workflow = workflows.find((w) => w.projectId === project.id);
  return (
    <ResourceDetailPage
      key={project.id}
      name={project.name}
      description={project.description}
      status={project.status}
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: project.name, mono: true }]}
      meta={projectMeta(project)}
      actions={[
        { label: 'Usage', icon: BarChart3, variant: 'secondary', onClick: () => navigate('/usage') },
        ...(workflow ? [{ label: 'Open workflow', icon: Workflow, variant: 'primary' as const, onClick: () => navigate(`/workflows/${workflow.id}`) }] : []),
      ]}
      details={projectDetails(project)}
      events={projectEvents(project)}
      activity={projectActivity(project)}
      dangerActions={projectDangerActions(project)}
      onDangerAction={(action) => {
        if (action === 'delete') navigate('/projects');
      }}
      shell={shellFor('/projects')}
    />
  );
}
