export interface Deployment {
  id: number;
  name: string;
  region: string;
  status: 'running' | 'paused' | 'degraded' | 'failed';
  requests: number;
  cost: number;
}

/** Product-agnostic sample data shared by the Table examples. */
export const DEPLOYMENTS: Deployment[] = [
  { id: 1, name: 'web-frontend', region: 'eu-west-1', status: 'running', requests: 18204, cost: 412.8 },
  { id: 2, name: 'billing-api', region: 'us-east-1', status: 'running', requests: 9442, cost: 88.4 },
  { id: 3, name: 'search-indexer', region: 'eu-west-1', status: 'degraded', requests: 22931, cost: 1204.1 },
  { id: 4, name: 'reports-worker', region: 'ap-south-1', status: 'paused', requests: 0, cost: 0 },
  { id: 5, name: 'auth-service', region: 'us-east-1', status: 'running', requests: 7188, cost: 233.5 },
  { id: 6, name: 'image-resizer', region: 'eu-west-1', status: 'failed', requests: 1102, cost: 51.2 },
];

export const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const count = (n: number) => n.toLocaleString('en-US');
