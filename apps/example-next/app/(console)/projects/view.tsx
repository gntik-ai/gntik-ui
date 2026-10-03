'use client';
import { ResourceIndexPage } from '@gntik-ai/templates';
import { useRouter } from 'next/navigation';
import { shellFor } from '../../../data/console';
import { projectColumns } from '../../../data/columns';
import { projects } from '../../../data/projects';

export function ProjectsView() {
  const router = useRouter();
  return (
    <ResourceIndexPage
      title="Projects"
      description="Every project in this workspace, across regions."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]}
      rows={projects}
      columns={projectColumns}
      savedViews={[{ value: 'all', label: 'All projects', filters: [] }, { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] }]}
      noun={['project', 'projects']}
      createLabel="New project"
      onOpen={(row) => router.push(`/projects/${row.id}`)}
      shell={shellFor('/projects')}
    />
  );
}
