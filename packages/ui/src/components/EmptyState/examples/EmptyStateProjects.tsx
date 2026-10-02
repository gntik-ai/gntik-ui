import { FolderPlus, Plus, Upload } from 'lucide-react';
import { Button } from '../../Button';
import { EmptyState } from '../EmptyState';

export default function EmptyStateProjects() {
  return (
    <EmptyState
      icon={FolderPlus}
      title="No projects yet"
      description="Create your first project to start deploying, inviting members and tracking usage."
      primaryAction={<Button icon={Plus}>New project</Button>}
      secondaryAction={<Button variant="secondary" icon={Upload}>Import</Button>}
    />
  );
}
