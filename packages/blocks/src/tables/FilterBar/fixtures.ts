import type { ActiveFilter, FilterField, SavedView } from './FilterBar';

export const DEPLOYMENT_FILTER_FIELDS: FilterField[] = [
  { id: 'status', label: 'Status', options: ['Running', 'Queued', 'Paused', 'Degraded', 'Failed'] },
  { id: 'region', label: 'Region', options: ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'] },
  { id: 'owner', label: 'Owner', options: ['Platform team', 'Payments team', 'Data team'] },
];

export const DEPLOYMENT_DEFAULT_FILTERS: ActiveFilter[] = [
  { field: 'status', value: 'Running' },
  { field: 'region', value: 'eu-west-1' },
];

export const DEPLOYMENT_SAVED_VIEWS: SavedView[] = [
  { value: 'all', label: 'All deployments', filters: [] },
  { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
  { value: 'eu', label: 'EU regions', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];
