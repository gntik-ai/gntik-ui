import type { BreadcrumbItem } from '@gntik-ai/ui';

export type SearchResultType = 'project' | 'deployment' | 'member' | 'document';

export interface SearchHit {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  href: string;
  owner: string;
  /** Mono context line (region, id, email…). */
  meta: string;
}

export interface SearchFacet {
  id: 'type' | 'owner';
  label: string;
  options: Array<{ value: string; label: string }>;
}

export const searchTypeLabels: Record<SearchResultType, string> = {
  project: 'Projects',
  deployment: 'Deployments',
  member: 'Members',
  document: 'Documents',
};

export const searchTypeOrder: SearchResultType[] = ['project', 'deployment', 'member', 'document'];

/** Neutral search index for the sample. */
export const searchHits: SearchHit[] = [
  { id: 'p1', type: 'project', title: 'billing-api', snippet: 'Invoices, payment methods and usage metering for the workspace.', href: '/projects/billing-api', owner: 'Dana Whitfield', meta: 'eu-west-1 · Node 24' },
  { id: 'p2', type: 'project', title: 'billing-web', snippet: 'Customer-facing billing portal and plan management.', href: '/projects/billing-web', owner: 'Sam Patel', meta: 'us-east-1 · Vite' },
  { id: 'p3', type: 'project', title: 'orders-api', snippet: 'Order intake and fulfilment; emits billing events.', href: '/projects/orders-api', owner: 'Lee Chen', meta: 'eu-central-1 · Go' },
  { id: 'd1', type: 'deployment', title: 'billing-api build 412', snippet: 'Promoted to production · health checks passed in 38 s.', href: '/deployments/dep_412', owner: 'Dana Whitfield', meta: 'dep_412 · production' },
  { id: 'd2', type: 'deployment', title: 'billing-web #87', snippet: 'Preview deployment for “New invoice layout”.', href: '/deployments/dep_087', owner: 'Sam Patel', meta: 'dep_087 · preview' },
  { id: 'd3', type: 'deployment', title: 'billing-api build 411', snippet: 'Rolled back: error rate above 2% in us-east-1.', href: '/deployments/dep_411', owner: 'Lee Chen', meta: 'dep_411 · production' },
  { id: 'm1', type: 'member', title: 'Riley Morgan', snippet: 'Billing admin · manages invoices and payment methods.', href: '/members/riley', owner: 'Dana Whitfield', meta: 'riley@example.com' },
  { id: 'doc1', type: 'document', title: 'Billing runbook', snippet: 'What to do when a billing sync fails or invoices are delayed.', href: '/docs/billing-runbook', owner: 'Lee Chen', meta: 'Updated 3 days ago' },
  { id: 'doc2', type: 'document', title: 'Usage-based billing guide', snippet: 'How metered usage turns into invoice line items.', href: '/docs/usage-billing', owner: 'Sam Patel', meta: 'Updated last week' },
];

export const searchFacets: SearchFacet[] = [
  { id: 'type', label: 'Type', options: searchTypeOrder.map((t) => ({ value: t, label: searchTypeLabels[t] })) },
  {
    id: 'owner',
    label: 'Owner',
    options: ['Dana Whitfield', 'Sam Patel', 'Lee Chen'].map((name) => ({ value: name, label: name })),
  },
];

export const searchDefaultQuery = 'billing';

export const searchBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Search' }];
