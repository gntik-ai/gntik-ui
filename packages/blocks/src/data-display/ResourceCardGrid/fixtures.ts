import { Boxes, Database, Globe, HardDrive, Server, Workflow } from '@gntik-ai/icons';
import type { ResourceCard } from './ResourceCardGrid';

/** Project resources. */
export const RESOURCE_CARDS: ResourceCard[] = [
  { id: 'api', name: 'orders-api', description: 'Public REST API', icon: Server, status: 'running', meta: [{ label: 'Requests 30d', value: '1.2M' }, { label: 'Cost 30d', value: '$412' }] },
  { id: 'db', name: 'orders-db', description: 'Postgres 17 · 3 replicas', icon: Database, status: 'running', meta: [{ label: 'Storage', value: '84 GB' }, { label: 'Cost 30d', value: '$238' }] },
  { id: 'worker', name: 'invoice-worker', description: 'Queue consumer', icon: Workflow, status: 'degraded', meta: [{ label: 'Jobs 30d', value: '48,210' }, { label: 'Cost 30d', value: '$96' }] },
  { id: 'cdn', name: 'static-assets', description: 'Edge cache', icon: Globe, status: 'running', meta: [{ label: 'Hit rate', value: '97.4%' }, { label: 'Cost 30d', value: '$31' }] },
  { id: 'batch', name: 'nightly-export', description: 'Scheduled job', icon: Boxes, status: 'paused', meta: [{ label: 'Last run', value: '2 days ago' }, { label: 'Cost 30d', value: '$12' }] },
  { id: 'bucket', name: 'backups', description: 'Object storage', icon: HardDrive, status: 'failed', meta: [{ label: 'Objects', value: '18,422' }, { label: 'Cost 30d', value: '$54' }] },
];
