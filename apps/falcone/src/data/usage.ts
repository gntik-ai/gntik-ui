import type { ChartCardRange, SavedView } from '@gntik-ai/blocks';
import type { TrafficPoint, UsageRow } from '@gntik-ai/templates';

// The template's breakdown has fixed environments: Falcone's prod → Production, staging → Staging,
// dev → Preview. The tenant is carried in the project label (the table has no tenant column).
type Seed = [tenant: string, project: string, env: UsageRow['environment'], region: string, invocations: number, errorRate: number, cost: number];

const SEEDS: Seed[] = [
  ['Northwind Labs', 'ingest-pipeline', 'Production', 'eu-central-1', 4_902_118, 0.08, 2_207.4],
  ['Northwind Labs', 'checkout-api', 'Production', 'eu-west-1', 1_284_310, 0.21, 1_412.6],
  ['Northwind Labs', 'checkout-api', 'Staging', 'eu-west-1', 48_220, 0.4, 96.1],
  ['Northwind Labs', 'support-copilot', 'Production', 'eu-west-1', 212_904, 1.94, 3_980.15],
  ['Northwind Labs', 'support-copilot', 'Preview', 'eu-west-1', 1_204, 0.4, 22.8],
  ['Northwind Labs', 'auth-hooks', 'Production', 'eu-west-1', 640_022, 0.12, 318.9],
  ['Northwind Labs', 'report-builder', 'Staging', 'eu-west-1', 3_120, 14.2, 96.3],
  ['Acme Retail', 'storefront-edge', 'Production', 'us-east-1', 2_840_300, 0.31, 1_640.2],
  ['Acme Retail', 'inventory-sync', 'Production', 'us-east-1', 920_480, 0.06, 512.75],
  ['Acme Retail', 'inventory-sync', 'Preview', 'us-east-1', 4_100, 0.9, 8.4],
  ['Kestrel Health', 'triage-assistant', 'Production', 'eu-central-1', 310_224, 0.44, 4_215.0],
  ['Kestrel Health', 'fhir-gateway', 'Staging', 'eu-central-1', 88_410, 0.18, 140.6],
];

/** Metered usage per tenant, project and stage over the selected range. */
export const usageRows: UsageRow[] = SEEDS.map(([tenant, project, environment, region, requests, errorRate, cost], i) => ({
  id: `use_${i + 1}`,
  project: `${tenant} / ${project}`,
  environment,
  region,
  requests,
  errorRate,
  cost,
}));

export const usageViews: SavedView[] = [
  { value: 'all', label: 'All tenants', filters: [] },
  { value: 'prod', label: 'prod only', filters: [{ field: 'environment', value: 'Production' }] },
  { value: 'eu', label: 'EU regions', filters: [{ field: 'region', value: 'eu-west-1' }, { field: 'region', value: 'eu-central-1' }] },
];

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Sep ${i + 4}`);
const traffic = (labels: string[], base: number): TrafficPoint[] =>
  labels.map((day, i) => ({
    day,
    Production: Math.round(base + ((i * 37) % 11) * 90_000),
    Staging: Math.round(base * 0.04 + ((i * 13) % 7) * 2_100),
    Preview: Math.round(base * 0.008 + ((i * 29) % 5) * 600),
  }));

/** Invocations per stage, per range. */
export const trafficByRange: Record<string, TrafficPoint[]> = { '7d': traffic(DAYS7, 10_200_000), '30d': traffic(DAYS30, 9_800_000) };
export const trafficRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '76.1M', delta: { value: '+6.4%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '311M', delta: { value: '+4.2%', direction: 'up', sentiment: 'positive' } } },
];
