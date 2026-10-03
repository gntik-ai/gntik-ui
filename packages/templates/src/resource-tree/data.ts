import { Building2, Database, FolderKanban, HardDrive, ListOrdered, Server, type LucideIcon } from '@gntik-ai/icons';
import type { BreadcrumbItem, TreeNode } from '@gntik-ai/ui';

export type ResourceKind = 'service' | 'database' | 'bucket' | 'queue';
export type ResourceGroupBy = 'kind' | 'region' | 'team';

export interface TreeResource {
  id: string;
  name: string;
  kind: ResourceKind;
  team: string;
  project: string;
  region: string;
  status: 'healthy' | 'degraded' | 'stopped';
  tags: string[];
  /** ISO date of the last change. */
  updatedAt: string;
}

export const kindLabels: Record<ResourceKind, string> = { service: 'Services', database: 'Databases', bucket: 'Buckets', queue: 'Queues' };
export const kindIcons: Record<ResourceKind, LucideIcon> = { service: Server, database: Database, bucket: HardDrive, queue: ListOrdered };
export const groupByLabels: Record<ResourceGroupBy, string> = { kind: 'Kind', region: 'Region', team: 'Team' };

export const resourceTreeBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Resources' }];

export const treeResources: TreeResource[] = [
  { id: 'r1', name: 'orders-api', kind: 'service', team: 'Commerce', project: 'checkout', region: 'eu-west-1', status: 'healthy', tags: ['production', 'pci', 'tier-1'], updatedAt: '2026-09-30' },
  { id: 'r2', name: 'orders-db', kind: 'database', team: 'Commerce', project: 'checkout', region: 'eu-west-1', status: 'healthy', tags: ['production', 'pci', 'backups', 'encrypted'], updatedAt: '2026-09-28' },
  { id: 'r3', name: 'payment-events', kind: 'queue', team: 'Commerce', project: 'checkout', region: 'eu-west-1', status: 'degraded', tags: ['production', 'on-call'], updatedAt: '2026-10-02' },
  { id: 'r4', name: 'catalog-web', kind: 'service', team: 'Commerce', project: 'catalog', region: 'us-east-1', status: 'healthy', tags: ['production'], updatedAt: '2026-09-21' },
  { id: 'r5', name: 'catalog-images', kind: 'bucket', team: 'Commerce', project: 'catalog', region: 'us-east-1', status: 'healthy', tags: ['public', 'cdn', 'production'], updatedAt: '2026-09-12' },
  { id: 'r6', name: 'usage-collector', kind: 'service', team: 'Platform', project: 'metering', region: 'eu-west-1', status: 'healthy', tags: ['internal', 'tier-1'], updatedAt: '2026-09-29' },
  { id: 'r7', name: 'usage-warehouse', kind: 'database', team: 'Platform', project: 'metering', region: 'eu-west-1', status: 'stopped', tags: ['analytics', 'staging'], updatedAt: '2026-08-30' },
  { id: 'r8', name: 'audit-archive', kind: 'bucket', team: 'Platform', project: 'compliance', region: 'ap-south-1', status: 'healthy', tags: ['retention-7y', 'encrypted', 'worm', 'legal-hold'], updatedAt: '2026-09-02' },
  { id: 'r9', name: 'export-jobs', kind: 'queue', team: 'Platform', project: 'compliance', region: 'ap-south-1', status: 'healthy', tags: ['internal'], updatedAt: '2026-09-25' },
];

/** Team → project tree with resource counts. Node ids: `team:<name>` and `project:<name>`. */
export function buildResourceTree(rows: readonly TreeResource[]): TreeNode[] {
  const teams = [...new Set(rows.map((r) => r.team))];
  return teams.map((team) => {
    const inTeam = rows.filter((r) => r.team === team);
    const projects = [...new Set(inTeam.map((r) => r.project))];
    return {
      id: `team:${team}`,
      label: team,
      icon: Building2,
      meta: String(inTeam.length),
      children: projects.map((p) => ({ id: `project:${p}`, label: p, icon: FolderKanban, meta: String(inTeam.filter((r) => r.project === p).length) })),
    };
  });
}

/** Rows under a tree node id (`team:…`, `project:…`); `null` = all. */
export function rowsUnder(rows: readonly TreeResource[], nodeId: string | null): TreeResource[] {
  if (!nodeId) return [...rows];
  const [type, name] = nodeId.split(':');
  return rows.filter((r) => (type === 'team' ? r.team === name : r.project === name));
}

/** Groups rows by a field, in first-seen order. */
export function groupRows(rows: readonly TreeResource[], by: ResourceGroupBy): Array<{ key: string; label: string; rows: TreeResource[] }> {
  const keys = [...new Set(rows.map((r) => r[by]))];
  return keys.map((key) => ({ key, label: by === 'kind' ? kindLabels[key as ResourceKind] : key, rows: rows.filter((r) => r[by] === key) }));
}

