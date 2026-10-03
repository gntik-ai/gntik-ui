import type { ActiveFilter, ChartCardRange, DataTableColumn, FilterField, SavedView } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** One row of the usage breakdown table. */
export interface UsageRow {
  id: string;
  project: string;
  environment: 'Production' | 'Staging' | 'Preview';
  region: string;
  requests: number;
  errorRate: number;
  cost: number;
}

export interface TrafficPoint {
  day: string;
  Production: number;
  Staging: number;
  Preview: number;
}

export const usageBreadcrumbs: BreadcrumbItem[] = [{ label: 'Overview', href: '/overview' }, { label: 'Analytics' }];

const PROJECTS = ['orders-api', 'billing-sync', 'search-index', 'auth-gateway', 'media-resizer', 'webhooks', 'reports', 'checkout-web'];
const ENVS: UsageRow['environment'][] = ['Production', 'Production', 'Staging', 'Preview'];
const REGIONS = ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'];

/** Usage per project and environment over the selected range. */
export const usageRows: UsageRow[] = Array.from({ length: 16 }, (_, i) => ({
  id: `use_${i + 1}`,
  project: PROJECTS[i % PROJECTS.length] ?? 'orders-api',
  environment: ENVS[(i * 3) % ENVS.length] ?? 'Production',
  region: REGIONS[(i * 5) % REGIONS.length] ?? 'eu-west-1',
  requests: ((i * 48_271) % 900_000) + 12_000,
  errorRate: Math.round(((i * 37) % 29) * 0.11 * 100) / 100,
  cost: Math.round((((i * 3571) % 1_400) + 60) * 100) / 100,
}));

export const usageFilterFields: FilterField[] = [
  { id: 'environment', label: 'Environment', options: ['Production', 'Staging', 'Preview'] },
  { id: 'region', label: 'Region', options: REGIONS },
];

export const usageSavedViews: SavedView[] = [
  { value: 'all', label: 'All usage', filters: [] },
  { value: 'production', label: 'Production only', filters: [{ field: 'environment', value: 'Production' }] },
  { value: 'eu', label: 'EU regions', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];

/** Search by project name; filters on the same field are OR, across fields AND. */
export function filterUsage(rows: readonly UsageRow[], query: string, filters: readonly ActiveFilter[]): UsageRow[] {
  const q = query.trim().toLowerCase();
  const byField = new Map<string, string[]>();
  for (const f of filters) byField.set(f.field, [...(byField.get(f.field) ?? []), f.value]);
  return rows.filter((row) => {
    if (q && !row.project.toLowerCase().includes(q)) return false;
    for (const [field, values] of byField) {
      const value = field === 'environment' ? row.environment : field === 'region' ? row.region : undefined;
      if (value !== undefined && !values.includes(value)) return false;
    }
    return true;
  });
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const count = new Intl.NumberFormat('en-US');

export const usageColumns: DataTableColumn<UsageRow>[] = [
  { id: 'project', header: 'Project', accessor: (r) => r.project, sortable: true, hideable: false, className: 'font-semibold' },
  { id: 'environment', header: 'Environment', accessor: (r) => r.environment, sortable: true },
  { id: 'region', header: 'Region', accessor: (r) => r.region, sortable: true, className: 'font-mono text-[12px] text-muted-foreground' },
  { id: 'requests', header: 'Requests', accessor: (r) => r.requests, cell: (r) => count.format(r.requests), sortable: true, align: 'right', className: 'font-mono text-[12.5px]' },
  { id: 'errors', header: 'Error rate', accessor: (r) => r.errorRate, cell: (r) => `${r.errorRate.toFixed(2)}%`, sortable: true, align: 'right', className: 'font-mono text-[12.5px]' },
  { id: 'cost', header: 'Cost', accessor: (r) => r.cost, cell: (r) => money.format(r.cost), sortable: true, align: 'right', className: 'font-mono text-[12.5px]' },
];

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const traffic = (labels: string[], base: number): TrafficPoint[] =>
  labels.map((day, i) => ({
    day,
    Production: Math.round(base + ((i * 37) % 11) * 900),
    Staging: Math.round(base * 0.22 + ((i * 13) % 7) * 210),
    Preview: Math.round(base * 0.08 + ((i * 29) % 5) * 120),
  }));

/** Requests per environment, per range. */
export const trafficByRange: Record<string, TrafficPoint[]> = {
  '7d': traffic(DAYS7, 24_000),
  '30d': traffic(DAYS30, 22_000),
};

export const trafficRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '241,906', delta: { value: '+8.2%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '1.02M', delta: { value: '+3.5%', direction: 'up', sentiment: 'positive' } } },
];
