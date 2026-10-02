import { SearchX } from 'lucide-react';
import { Button } from '../../Button';
import { EmptyState } from '../EmptyState';

export default function EmptyStateSearch() {
  return (
    <EmptyState
      size="sm"
      bordered
      icon={SearchX}
      title="No members match “ops”"
      description="Check the spelling or clear the filters."
      primaryAction={<Button variant="secondary" size="sm">Clear filters</Button>}
    />
  );
}
