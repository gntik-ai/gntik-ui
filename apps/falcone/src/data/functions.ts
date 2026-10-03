import type { Stage } from './projects';

export type Runtime = 'node22' | 'python3.13' | 'go1.24' | 'deno2';

/** A deployed function (one stage of one project). */
export interface FalconeFunction {
  id: string;
  name: string;
  projectId: string;
  runtime: Runtime;
  stage: Stage;
  status: 'running' | 'degraded' | 'failed' | 'paused';
  invocations24h: number;
  p95Ms: number;
  errorRate: number;
}

type Seed = [name: string, projectId: string, runtime: Runtime, stage: Stage, status: FalconeFunction['status'], inv: number, p95: number, err: number];

const SEEDS: Seed[] = [
  ['create-order', 'checkout-api', 'node22', 'prod', 'running', 412_880, 164, 0.0018],
  ['price-cart', 'checkout-api', 'node22', 'prod', 'running', 598_204, 92, 0.0009],
  ['capture-payment', 'checkout-api', 'go1.24', 'prod', 'running', 118_540, 241, 0.0031],
  ['refund', 'checkout-api', 'go1.24', 'staging', 'running', 2_310, 210, 0],
  ['draft-reply', 'support-copilot', 'python3.13', 'prod', 'degraded', 96_410, 2_880, 0.0262],
  ['summarise-ticket', 'support-copilot', 'python3.13', 'prod', 'running', 104_822, 1_640, 0.0071],
  ['classify-intent', 'support-copilot', 'python3.13', 'dev', 'running', 1_204, 920, 0.004],
  ['ingest-event', 'ingest-pipeline', 'go1.24', 'prod', 'running', 3_880_400, 38, 0.0004],
  ['enrich-geo', 'ingest-pipeline', 'go1.24', 'prod', 'running', 912_330, 71, 0.0011],
  ['fanout-warehouse', 'ingest-pipeline', 'deno2', 'prod', 'running', 104_210, 220, 0.0016],
  ['on-signup', 'auth-hooks', 'node22', 'prod', 'running', 18_220, 58, 0.0005],
  ['token-exchange', 'auth-hooks', 'node22', 'prod', 'running', 610_400, 36, 0.0012],
  ['render-pdf', 'report-builder', 'node22', 'staging', 'failed', 1_840, 9_420, 0.181],
  ['write-summary', 'report-builder', 'python3.13', 'staging', 'degraded', 1_280, 7_310, 0.086],
  ['presence-join', 'realtime-presence', 'deno2', 'dev', 'paused', 0, 0, 0],
];

export const functions: FalconeFunction[] = SEEDS.map(([name, projectId, runtime, stage, status, inv, p95, err]) => ({
  id: `fn_${projectId}_${name}`.replace(/-/g, '_'),
  name,
  projectId,
  runtime,
  stage,
  status,
  invocations24h: inv,
  p95Ms: p95,
  errorRate: err,
}));
