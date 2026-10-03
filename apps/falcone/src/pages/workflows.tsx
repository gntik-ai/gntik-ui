import { WorkflowBuilderPage } from '@gntik-ai/templates';
import { findWorkflow, workflowPalette } from '../data/workflows';
import { NotFound } from './not-found';

export function WorkflowBuilder({ id }: { id: string }) {
  const wf = findWorkflow(id);
  if (!wf) return <NotFound />;
  return (
    <WorkflowBuilderPage
      key={wf.id}
      title={wf.title}
      status={wf.status}
      nodes={wf.nodes}
      edges={wf.edges}
      palette={workflowPalette}
      breadcrumbs={[
        { label: 'Projects', href: '/projects' },
        { label: wf.projectId, href: `/projects/${wf.projectId}`, mono: true },
        { label: wf.id, mono: true },
      ]}
      onSave={() => new Promise<void>((resolve) => setTimeout(resolve, 500))}
    />
  );
}
