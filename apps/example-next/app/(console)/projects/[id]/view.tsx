'use client';
import { Clock, Globe, User } from '@gntik-ai/icons';
import { ResourceDetailPage } from '@gntik-ai/templates';
import { useRouter } from 'next/navigation';
import { activityAt, projectEventsAt } from '../../../../data/activity';
import { shellFor } from '../../../../data/console';
import { findProject } from '../../../../data/projects';

export function ProjectView({ id, now }: { id: string; now: number }) {
  const router = useRouter();
  const project = findProject(id);
  if (!project) return null;
  return (
    <ResourceDetailPage
      key={project.id}
      name={project.name}
      description={project.description}
      status={project.status}
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: project.name, mono: true }]}
      meta={[
        { label: 'Region', value: project.region, icon: Globe, mono: true },
        { label: 'Owner', value: project.owner, icon: User },
        { label: 'Updated', value: project.updatedAt.toISOString().slice(0, 10), icon: Clock, mono: true },
      ]}
      details={[
        { id: 'status', label: 'Status', status: project.status },
        { id: 'id', label: 'Project ID', value: project.id, mono: true, copyable: true },
        { id: 'runtime', label: 'Runtime', value: project.runtime, mono: true },
        { id: 'region', label: 'Region', value: project.region, mono: true },
        { id: 'owner', label: 'Owner', value: project.owner },
      ]}
      events={projectEventsAt(now)}
      activity={activityAt(now)}
      dangerActions={[
        { id: 'pause', title: 'Pause project', description: 'Stops serving traffic until you resume it.', actionLabel: 'Pause', destructive: false },
        { id: 'delete', title: 'Delete project', description: `Permanently deletes ${project.name}. This cannot be undone.`, actionLabel: 'Delete project', confirmText: project.name },
      ]}
      onDangerAction={(action) => {
        if (action === 'delete') router.push('/projects');
      }}
      shell={shellFor('/projects')}
    />
  );
}
