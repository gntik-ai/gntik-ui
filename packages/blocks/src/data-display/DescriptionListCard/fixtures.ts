import type { DescriptionItem } from './DescriptionListCard';

/** Configuration of a deployment. */
export const DEPLOYMENT_DETAILS: DescriptionItem[] = [
  { id: 'status', label: 'Status', status: 'running' },
  { id: 'id', label: 'Deployment ID', value: 'dep_7f3c9a21', mono: true, copyable: true },
  { id: 'runtime', label: 'Runtime', value: 'node-24', mono: true },
  { id: 'region', label: 'Region', value: 'eu-west-1', mono: true },
  { id: 'endpoint', label: 'Endpoint', value: 'https://api.example.com/v1/orders', mono: true, copyable: true },
  { id: 'owner', label: 'Owner', value: 'Platform team' },
  { id: 'created', label: 'Created', value: 'Mar 12, 2026, 09:41' },
];
