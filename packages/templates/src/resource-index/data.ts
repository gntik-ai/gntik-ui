import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, type ActiveFilter, type DeploymentRow, type FilterField, type SavedView } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

export type ResourceRow = DeploymentRow;

export const resourceRows: ResourceRow[] = DEPLOYMENT_ROWS;
export const resourceColumns = DEPLOYMENT_COLUMNS;

export const resourceBreadcrumbs: BreadcrumbItem[] = [{ label: 'Overview', href: '/overview' }, { label: 'Deployments' }];

export const resourceFilterFields: FilterField[] = [
  { id: 'status', label: 'Status', options: ['Running', 'Queued', 'Paused', 'Degraded', 'Failed'] },
  { id: 'region', label: 'Region', options: ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'] },
];

export const resourceSavedViews: SavedView[] = [
  { value: 'all', label: 'All deployments', filters: [] },
  { value: 'attention', label: 'Needs attention', filters: [{ field: 'status', value: 'Degraded' }, { field: 'status', value: 'Failed' }] },
  { value: 'eu', label: 'EU regions', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];

/** Search by name or id; filters on one field are OR, across fields AND. Status matches case-insensitively. */
export function filterResources(rows: readonly ResourceRow[], query: string, filters: readonly ActiveFilter[]): ResourceRow[] {
  const q = query.trim().toLowerCase();
  const byField = new Map<string, string[]>();
  for (const f of filters) byField.set(f.field, [...(byField.get(f.field) ?? []), f.value.toLowerCase()]);
  return rows.filter((row) => {
    if (q && !row.name.toLowerCase().includes(q) && !row.id.toLowerCase().includes(q)) return false;
    for (const [field, values] of byField) {
      const value = field === 'status' ? row.status : field === 'region' ? row.region : undefined;
      if (value !== undefined && !values.includes(value.toLowerCase())) return false;
    }
    return true;
  });
}
