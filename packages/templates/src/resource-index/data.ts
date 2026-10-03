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

type Column<T> = { id: string; accessor?: (row: T) => unknown };

const fieldValue = <T extends object>(row: T, field: string, columns?: ReadonlyArray<Column<T>>): unknown => {
  const accessor = columns?.find((c) => c.id === field)?.accessor;
  return accessor ? accessor(row) : (row as Record<string, unknown>)[field];
};

const text = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).toLowerCase() : undefined);

/**
 * Search by name or id (or, without them, every column value); filters on one field are OR, across fields AND, matched case-insensitively.
 * A filter field reads the column with the same id (its `accessor`), else the row property of that
 * name, so statuses come from the columns.
 */
export function filterResources<T extends object = ResourceRow>(
  rows: readonly T[],
  query: string,
  filters: readonly ActiveFilter[],
  columns?: ReadonlyArray<Column<T>>,
): T[] {
  const q = query.trim().toLowerCase();
  const byField = new Map<string, string[]>();
  for (const f of filters) byField.set(f.field, [...(byField.get(f.field) ?? []), f.value.toLowerCase()]);
  return rows.filter((row) => {
    if (q) {
      const r = row as Record<string, unknown>;
      let haystack = [r.name, r.id].map(text).filter((v) => v !== undefined);
      // Rows without a name/id: search every column value instead.
      if (haystack.length === 0 && columns) haystack = columns.map((c) => text(c.accessor?.(row))).filter((v) => v !== undefined);
      if (!haystack.some((v) => v.includes(q))) return false;
    }
    for (const [field, values] of byField) {
      const value = text(fieldValue(row, field, columns));
      if (value !== undefined && !values.includes(value)) return false;
    }
    return true;
  });
}
