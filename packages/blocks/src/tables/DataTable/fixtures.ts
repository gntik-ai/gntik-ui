import { StatusTag } from '@gntik-ai/ui';
import { createElement } from 'react';
import type { DataTableColumn } from './data-table-utils';

export interface DeploymentRow {
  id: string;
  name: string;
  region: string;
  status: 'running' | 'queued' | 'paused' | 'degraded' | 'failed';
  requests: number;
  cost: number;
  updatedAt: Date;
}

const NAMES = ['orders-api', 'billing-sync', 'invoice-worker', 'search-index', 'auth-gateway', 'media-resizer', 'nightly-export', 'webhooks', 'reports', 'notifications', 'checkout-web', 'audit-log'];
const REGIONS = ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'];
const STATUSES: DeploymentRow['status'][] = ['running', 'running', 'running', 'queued', 'paused', 'degraded', 'running', 'failed'];
const BASE = Date.UTC(2026, 8, 30, 12, 0, 0);

/** 24 deployments: enough for two pages at the default page size. */
export const DEPLOYMENT_ROWS: DeploymentRow[] = Array.from({ length: 24 }, (_, i) => ({
  id: `dep_${(1000 + i * 37).toString(36)}`,
  name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? '-staging' : ''}`,
  region: REGIONS[(i * 3) % REGIONS.length] ?? 'eu-west-1',
  status: STATUSES[(i * 5) % STATUSES.length] ?? 'running',
  requests: ((i * 7919) % 90_000) + 1_200,
  cost: Math.round((((i * 3571) % 900) + 40) * 100) / 100,
  updatedAt: new Date(BASE - i * 3_700_000 * 5),
}));

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const count = new Intl.NumberFormat('en-US');

/** Columns for DEPLOYMENT_ROWS. */
export const DEPLOYMENT_COLUMNS: DataTableColumn<DeploymentRow>[] = [
  { id: 'name', header: 'Deployment', accessor: (r) => r.name, sortable: true, hideable: false, className: 'font-semibold' },
  { id: 'region', header: 'Region', accessor: (r) => r.region, sortable: true, className: 'font-mono text-[12px] text-muted-foreground' },
  { id: 'status', header: 'Status', accessor: (r) => r.status, cell: (r) => createElement(StatusTag, { status: r.status }), sortable: true },
  { id: 'requests', header: 'Requests', accessor: (r) => r.requests, cell: (r) => count.format(r.requests), sortable: true, align: 'right', className: 'font-mono text-[12.5px]' },
  { id: 'cost', header: 'Cost', accessor: (r) => r.cost, cell: (r) => money.format(r.cost), sortable: true, align: 'right', className: 'font-mono text-[12.5px]' },
  { id: 'updated', header: 'Updated', accessor: (r) => r.updatedAt, cell: (r) => r.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sortable: true, align: 'right', defaultHidden: true, className: 'text-[12px] text-muted-foreground' },
];
