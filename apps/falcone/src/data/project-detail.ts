import type { ActivityItem, DangerZoneAction, DescriptionItem, PageHeaderMetaItem, StatusEvent } from '@gntik-ai/blocks';
import { Building2, Clock, Globe, Layers } from '@gntik-ai/icons';
import { mcpEndpoint, type Project } from './projects';
import { daysAgo, hoursAgo } from './time';

const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const n = (v: number) => v.toLocaleString('en-US');

/** Header meta row for a project. */
export const projectMeta = (p: Project): PageHeaderMetaItem[] => [
  { label: 'Tenant', value: p.tenant, icon: Building2 },
  { label: 'Region', value: p.region, icon: Globe, mono: true },
  { label: 'Stages', value: p.stages.join(' · '), icon: Layers, mono: true },
  { label: 'Updated', value: p.updatedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), icon: Clock },
];

/** Overview description list. */
export const projectDetails = (p: Project): DescriptionItem[] => [
  { id: 'id', label: 'Project ID', value: `prj_${p.id.replace(/-/g, '_')}`, mono: true, copyable: true },
  { id: 'status', label: 'Status', value: p.status, status: p.status },
  { id: 'mcp', label: 'MCP server', value: mcpEndpoint(p), mono: true, copyable: true },
  { id: 'functions', label: 'Functions', value: String(p.functions) },
  { id: 'workflows', label: 'Workflows', value: String(p.workflows) },
  { id: 'channels', label: 'Real-time channels', value: p.channels.length ? p.channels.join(', ') : 'None', mono: p.channels.length > 0 },
  { id: 'llm', label: 'Model provider', value: p.modelProvider === 'none' ? 'None (no LLM functions)' : p.modelProvider },
  { id: 'invocations', label: 'Invocations · 24h', value: n(p.invocations24h) },
  { id: 'errors', label: 'Error rate · 24h', value: pct(p.errorRate) },
  { id: 'p95', label: 'p95 latency', value: `${n(p.p95Ms)} ms`, mono: true },
  { id: 'cost', label: 'Metered cost · 30 days', value: usd.format(p.cost30d) },
  { id: 'owner', label: 'Owner', value: p.owner },
];

/** Status history, newest first. */
export const projectEvents = (p: Project): StatusEvent[] => [
  p.status === 'failed'
    ? { id: 'e1', status: 'Failed', tone: 'destructive', title: 'render-pdf crashing on cold start', description: 'Out of memory at 512 MB; 18% of invocations failed.', at: hoursAgo(9), actor: 'runtime', live: true }
    : p.status === 'degraded'
      ? { id: 'e1', status: 'Degraded', tone: 'warning', title: 'p95 above the 2 s SLO on prod', description: 'Model provider latency on draft-reply.', at: hoursAgo(2), actor: 'SLO monitor', live: true }
      : p.status === 'paused'
        ? { id: 'e1', status: 'Paused', tone: 'neutral', title: 'Paused by owner', description: 'Channels drained; functions scaled to zero.', at: daysAgo(6), actor: p.owner }
        : { id: 'e1', status: 'Running', tone: 'success', title: 'prod serving 100% of traffic', at: p.updatedAt, actor: p.owner, live: true },
  { id: 'e2', status: 'Promoted', tone: 'info', title: 'staging promoted to prod', description: 'Smoke tests passed on 14 of 14 functions.', at: daysAgo(1), actor: 'release bot' },
  { id: 'e3', status: 'Quota', tone: 'warning', title: 'Invocation quota at 80%', at: daysAgo(3), actor: 'metering' },
  { id: 'e4', status: 'Created', tone: 'neutral', title: `Project created in ${p.tenant}`, at: daysAgo(120), actor: p.owner },
];

/** Changes made to the project. */
export const projectActivity = (p: Project): ActivityItem[] => [
  { id: 'a1', actor: { name: p.owner }, action: 'deployed', target: `${p.name} to prod`, at: p.updatedAt },
  { id: 'a2', actor: { name: 'Omar Haddad' }, action: 'rotated the MCP token of', target: p.name, at: hoursAgo(20) },
  { id: 'a3', actor: { name: 'Mei Tanaka' }, action: 'raised the invocation quota of', target: p.name, at: daysAgo(2) },
  { id: 'a4', actor: { name: 'Lukas Brandt' }, action: 'added the stage', target: 'staging', at: daysAgo(9) },
];

export const projectDangerActions = (p: Project): DangerZoneAction[] => [
  { id: 'pause', title: 'Pause project', description: 'Scales every function to zero and closes its real-time channels.', actionLabel: 'Pause', destructive: false },
  { id: 'delete', title: 'Delete project', description: `Permanently deletes ${p.name}, its stages, functions, workflows and metering history.`, actionLabel: 'Delete project', confirmText: p.name },
];
