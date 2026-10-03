import { hoursAgo, minutesAgo, daysAgo } from './time';

export type Stage = 'dev' | 'staging' | 'prod';

/** A Falcone project: a tenant's unit of deployment (stages, functions, workflows, MCP server). */
export interface Project {
  id: string;
  name: string;
  tenant: string;
  description: string;
  status: 'running' | 'degraded' | 'paused' | 'failed';
  region: string;
  stages: Stage[];
  functions: number;
  workflows: number;
  channels: string[];
  invocations24h: number;
  errorRate: number;
  p95Ms: number;
  cost30d: number;
  owner: string;
  modelProvider: string;
  updatedAt: Date;
}

export const projects: Project[] = [
  {
    id: 'checkout-api',
    name: 'checkout-api',
    tenant: 'Northwind Labs',
    description: 'Cart, pricing and payment functions behind the storefront.',
    status: 'running',
    region: 'eu-west-1',
    stages: ['dev', 'staging', 'prod'],
    functions: 14,
    workflows: 3,
    channels: ['orders.live', 'cart.presence'],
    invocations24h: 1_284_310,
    errorRate: 0.0021,
    p95Ms: 182,
    cost30d: 1_412.6,
    owner: 'Ingrid Halvorsen',
    modelProvider: 'Production (Anthropic)',
    updatedAt: minutesAgo(18),
  },
  {
    id: 'support-copilot',
    name: 'support-copilot',
    tenant: 'Northwind Labs',
    description: 'LLM functions that draft replies and summarise tickets, exposed over MCP.',
    status: 'degraded',
    region: 'eu-west-1',
    stages: ['dev', 'prod'],
    functions: 6,
    workflows: 2,
    channels: ['tickets.updates'],
    invocations24h: 212_904,
    errorRate: 0.0194,
    p95Ms: 2_310,
    cost30d: 3_980.15,
    owner: 'Omar Haddad',
    modelProvider: 'Production (Anthropic)',
    updatedAt: hoursAgo(2),
  },
  {
    id: 'ingest-pipeline',
    name: 'ingest-pipeline',
    tenant: 'Northwind Labs',
    description: 'Event ingestion, enrichment and fan-out to the warehouse.',
    status: 'running',
    region: 'eu-central-1',
    stages: ['dev', 'staging', 'prod'],
    functions: 9,
    workflows: 4,
    channels: ['ingest.status'],
    invocations24h: 4_902_118,
    errorRate: 0.0008,
    p95Ms: 64,
    cost30d: 2_207.4,
    owner: 'Mei Tanaka',
    modelProvider: 'none',
    updatedAt: hoursAgo(6),
  },
  {
    id: 'auth-hooks',
    name: 'auth-hooks',
    tenant: 'Northwind Labs',
    description: 'Sign-up, token exchange and session hooks for the identity provider.',
    status: 'running',
    region: 'eu-west-1',
    stages: ['staging', 'prod'],
    functions: 5,
    workflows: 0,
    channels: [],
    invocations24h: 640_022,
    errorRate: 0.0012,
    p95Ms: 41,
    cost30d: 318.9,
    owner: 'Ingrid Halvorsen',
    modelProvider: 'none',
    updatedAt: daysAgo(1),
  },
  {
    id: 'report-builder',
    name: 'report-builder',
    tenant: 'Northwind Labs',
    description: 'Nightly PDF reports with LLM-written summaries.',
    status: 'failed',
    region: 'eu-west-1',
    stages: ['dev', 'staging'],
    functions: 4,
    workflows: 1,
    channels: [],
    invocations24h: 3_120,
    errorRate: 0.142,
    p95Ms: 8_940,
    cost30d: 96.3,
    owner: 'Lukas Brandt',
    modelProvider: 'Gateway (openai-compatible)',
    updatedAt: hoursAgo(9),
  },
  {
    id: 'realtime-presence',
    name: 'realtime-presence',
    tenant: 'Northwind Labs',
    description: 'Presence and typing indicators over real-time channels.',
    status: 'paused',
    region: 'us-east-1',
    stages: ['dev'],
    functions: 3,
    workflows: 0,
    channels: ['presence.*'],
    invocations24h: 0,
    errorRate: 0,
    p95Ms: 0,
    cost30d: 12.4,
    owner: 'Mei Tanaka',
    modelProvider: 'none',
    updatedAt: daysAgo(6),
  },
];

export const findProject = (id: string) => projects.find((p) => p.id === id);

/** MCP server endpoint of a project's production stage. */
export const mcpEndpoint = (p: Project) => `https://mcp.falcone.dev/${p.tenant.toLowerCase().replace(/\s+/g, '-')}/${p.id}`;
