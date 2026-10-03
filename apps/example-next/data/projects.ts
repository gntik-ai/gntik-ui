// Types only: this module is also imported by Server Components, which get client references
// (not values) from the kit's 'use client' bundles.
import type { DeploymentRow } from '@gntik-ai/blocks';

/** A project row: same shape as the kit's resource-index rows. */
export type Project = DeploymentRow & { description: string; owner: string; runtime: string };

const DAY = 86_400_000;
const BASE = Date.UTC(2026, 8, 28, 9, 0, 0);

const seed: Array<[string, string, Project['status'], string, string]> = [
  ['web-storefront', 'eu-west-1', 'running', 'Customer-facing storefront.', 'Web team'],
  ['payments-api', 'us-east-1', 'running', 'Payment intents, refunds and payouts.', 'Platform team'],
  ['search-indexer', 'eu-central-1', 'degraded', 'Builds the product search index.', 'Data team'],
  ['email-worker', 'eu-west-1', 'queued', 'Sends transactional email.', 'Platform team'],
  ['reports-batch', 'ap-south-1', 'paused', 'Nightly CSV and PDF reports.', 'Data team'],
  ['image-proxy', 'us-east-1', 'running', 'Resizes and caches images.', 'Web team'],
  ['auth-service', 'eu-west-1', 'running', 'Sign-in, sessions and tokens.', 'Identity team'],
  ['audit-stream', 'eu-central-1', 'failed', 'Ships audit events to storage.', 'Security team'],
  ['admin-console', 'us-east-1', 'running', 'Internal back office.', 'Web team'],
  ['feature-flags', 'eu-west-1', 'running', 'Flag evaluation service.', 'Platform team'],
  ['metrics-gateway', 'ap-south-1', 'running', 'Collects service metrics.', 'Platform team'],
  ['docs-site', 'us-east-1', 'running', 'Public documentation.', 'Developer relations'],
];

export const projects: Project[] = seed.map(([name, region, status, description, owner], i) => ({
  id: `prj_${(4200 + i * 53).toString(36)}`,
  name,
  region,
  status,
  description,
  owner,
  runtime: i % 3 === 0 ? 'node-24' : i % 3 === 1 ? 'python-3.13' : 'go-1.25',
  requests: ((i * 6151) % 80_000) + 2_400,
  cost: Math.round((((i * 2713) % 700) + 35) * 100) / 100,
  updatedAt: new Date(BASE - i * DAY),
}));

export const findProject = (id: string) => projects.find((p) => p.id === id);
