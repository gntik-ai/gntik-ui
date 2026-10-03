import { Plus, UserPlus } from '@gntik-ai/icons';
import {
  CreateWizardPage,
  CreateWorkspacePage,
  HomeDashboardPage,
  NotificationInboxPage,
  ResourceDetailPage,
  ResourceIndexPage,
  SearchResultsPage,
} from '@gntik-ai/templates';
import { notifications } from '../data/inbox';
import {
  activity,
  findProject,
  homeKpis,
  projectActivity,
  projectColumns,
  projectDangerActions,
  projectDetails,
  projectEvents,
  projectMeta,
  projects,
  quickActions,
  requestRanges,
  requestsByRange,
} from '../data/projects';
import { searchFacets, searchHits } from '../data/search';
import { navigate } from '../router';
import { shell } from '../shell';
import { NotFound } from './status';

export function Home() {
  return (
    <HomeDashboardPage
      title="Home"
      description="How Acme Inc. is doing across projects, traffic and spend."
      breadcrumbs={[{ label: 'Home' }]}
      actions={[
        { label: 'Invite members', icon: UserPlus, variant: 'secondary', onClick: () => navigate('/settings/members') },
        { label: 'New project', icon: Plus, variant: 'primary', onClick: () => navigate('/projects/new') },
      ]}
      kpis={homeKpis}
      requestsByRange={requestsByRange}
      requestRanges={requestRanges}
      activity={activity}
      quickActions={quickActions}
      shell={shell('/')}
    />
  );
}

export function Projects() {
  return (
    <ResourceIndexPage
      title="Projects"
      description="Every project in the Acme Inc. workspace."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
      rows={projects}
      columns={projectColumns}
      savedViews={[
        { value: 'all', label: 'All projects', filters: [] },
        { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
      ]}
      noun={['project', 'projects']}
      createLabel="New project"
      onCreate={() => navigate('/projects/new')}
      onOpen={(row) => navigate(`/projects/${row.id}`)}
      shell={shell('/projects')}
    />
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const project = findProject(id);
  if (!project) return <NotFound />;
  return (
    <ResourceDetailPage
      name={project.name}
      description={project.description}
      status={project.status}
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: project.name, mono: true }]}
      meta={projectMeta(project)}
      details={projectDetails(project)}
      events={projectEvents(project)}
      activity={projectActivity(project)}
      dangerActions={projectDangerActions(project)}
      onDangerAction={(action) => {
        if (action === 'delete') navigate('/projects');
      }}
      shell={shell('/projects')}
    />
  );
}

export function NewProject() {
  return (
    <CreateWizardPage
      title="New project"
      onFinish={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate('/projects');
      }}
      onExit={() => navigate('/projects')}
    />
  );
}

export function Inbox() {
  return <NotificationInboxPage notifications={notifications} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Inbox' }]} currentHref="/inbox" />;
}

export function Search() {
  return <SearchResultsPage hits={searchHits} facets={searchFacets} defaultQuery="api" breadcrumbs={[{ label: 'Acme Inc.', href: '/' }, { label: 'Search' }]} currentHref="/search" />;
}

export function Onboarding() {
  return (
    <CreateWorkspacePage
      addressPrefix="app.acme.example/"
      onFinish={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate('/');
      }}
      onExit={() => navigate('/')}
    />
  );
}
