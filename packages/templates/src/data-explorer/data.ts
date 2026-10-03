import type { BreadcrumbItem, PowerSearchField, TransferListItem } from '@gntik-ai/ui';

/** One request log row of the sample dataset. */
export interface ExplorerRow {
  id: string;
  timestamp: string;
  project: string;
  region: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  bytes: number;
  userAgent: string;
}

export type ExplorerField = Exclude<keyof ExplorerRow, 'id'>;

const PROJECTS = ['web-app', 'billing-api', 'auth-service', 'search-indexer', 'reports'];
const REGIONS = ['eu-west', 'us-east', 'ap-south'];
const METHODS = ['GET', 'GET', 'GET', 'POST', 'PUT', 'DELETE'];
const PATHS = ['/v1/projects', '/v1/projects/:id', '/v1/invoices', '/v1/search', '/v1/sessions', '/v1/exports'];
const STATUSES = [200, 200, 200, 200, 201, 204, 304, 400, 404, 429, 500, 503];
const AGENTS = ['web/4.2', 'cli/1.8', 'sdk-js/3.1', 'sdk-py/2.0'];

/** Deterministic pseudo-random sample of `count` request rows (newest first). */
export function generateExplorerRows(count = 10_000, end = Date.UTC(2026, 4, 4, 12)): ExplorerRow[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    return seed / 2_147_483_648;
  };
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)] as T;
  return Array.from({ length: count }, (_, i) => {
    const status = pick(STATUSES);
    return {
      id: `req_${String(count - i).padStart(5, '0')}`,
      timestamp: new Date(end - i * 37_000).toISOString(),
      project: pick(PROJECTS),
      region: pick(REGIONS),
      method: pick(METHODS),
      path: pick(PATHS),
      status,
      durationMs: Math.round((status >= 500 ? 900 : 40) + rand() * 600),
      bytes: Math.round(200 + rand() * 48_000),
      userAgent: pick(AGENTS),
    };
  });
}

export const explorerRows: ExplorerRow[] = generateExplorerRows();

export const explorerFields: PowerSearchField<ExplorerField>[] = [
  { key: 'status', label: 'status', type: 'number', values: ['200', '201', '204', '304', '400', '404', '429', '500', '503'], description: 'HTTP status' },
  { key: 'project', label: 'project', type: 'enum', values: PROJECTS },
  { key: 'region', label: 'region', type: 'enum', values: REGIONS },
  { key: 'method', label: 'method', type: 'enum', values: ['GET', 'POST', 'PUT', 'DELETE'] },
  { key: 'path', label: 'path', values: PATHS },
  { key: 'durationMs', label: 'duration', type: 'number', description: 'Milliseconds' },
  { key: 'bytes', label: 'bytes', type: 'number', description: 'Response size' },
  { key: 'userAgent', label: 'agent', values: AGENTS },
];

export const explorerColumns: Array<TransferListItem & { value: ExplorerField }> = [
  { value: 'timestamp', label: 'Time', description: 'When the request arrived (UTC)' },
  { value: 'method', label: 'Method' },
  { value: 'path', label: 'Path', description: 'Route template' },
  { value: 'status', label: 'Status', description: 'HTTP status code' },
  { value: 'durationMs', label: 'Duration', description: 'Milliseconds' },
  { value: 'project', label: 'Project' },
  { value: 'region', label: 'Region' },
  { value: 'bytes', label: 'Size', description: 'Response bytes' },
  { value: 'userAgent', label: 'Client', description: 'User agent' },
];

export const explorerDefaultColumns: ExplorerField[] = ['timestamp', 'method', 'path', 'status', 'durationMs', 'project'];

export const explorerBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Data', href: '/data' },
  { label: 'request_logs', mono: true },
];
