import type { BreadcrumbItem } from '@gntik-ai/ui';

/** Neutral fixtures for the flow builder page; the graph itself uses the FlowBuilder block fixtures. */
export const flowBuilderContent = {
  title: 'Order sync',
  status: 'draft',
  lastSaved: 'Saved 2 min ago',
};

export const flowBuilderBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Automations', href: '/automations' },
  { label: 'order-sync', mono: true },
];
