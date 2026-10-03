import { ResourceGalleryPage } from '@gntik-ai/templates';
import { fleetDeployments } from '../data/fleet';
import { navigate } from '../router';
import { shellFor } from '../shell';

export function Fleet() {
  return (
    <ResourceGalleryPage
      title="Fleet"
      description="Deployments of agent replicas, by workload and region."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Fleet' }]}
      items={fleetDeployments}
      createLabel="New deployment"
      onCreate={() => navigate('/agents/new')}
      shell={shellFor('/fleet')}
    />
  );
}
