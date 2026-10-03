import type { ActivityItem, DangerZoneAction, DescriptionItem, PageHeaderMetaItem, StatusEvent } from '@gntik-ai/blocks';
import { Bot, Clock, Globe, Tag } from '@gntik-ai/icons';
import type { Agent } from './agents';
import { daysAgo, hoursAgo } from './time';

const pct = (r: number) => `${(r * 100).toFixed(1)}%`;
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Header meta row for an agent. */
export const agentMeta = (a: Agent): PageHeaderMetaItem[] => [
  { label: 'Model', value: a.model, icon: Bot, mono: true },
  { label: 'Region', value: a.region, icon: Globe, mono: true },
  { label: 'Version', value: a.version, icon: Tag, mono: true },
  { label: 'Updated', value: a.updatedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), icon: Clock },
];

/** Overview description list. */
export const agentDetails = (a: Agent): DescriptionItem[] => [
  { id: 'id', label: 'Agent ID', value: `agt_${a.id.replace(/-/g, '_')}`, mono: true, copyable: true },
  { id: 'status', label: 'Status', value: a.status, status: a.status },
  { id: 'model', label: 'Model', value: a.model, mono: true },
  { id: 'tools', label: 'Tools', value: a.tools.join(', '), mono: true },
  { id: 'knowledge', label: 'Knowledge', value: a.knowledge },
  { id: 'owner', label: 'Owner', value: a.owner },
  { id: 'runs', label: 'Runs · 24h', value: a.runs24h.toLocaleString('en-US') },
  { id: 'success', label: 'Success rate', value: pct(a.successRate) },
  { id: 'p95', label: 'p95 latency', value: `${a.p95Ms.toLocaleString('en-US')} ms`, mono: true },
  { id: 'cost', label: 'Spend · 30 days', value: usd.format(a.cost30d) },
];

/** Status history, newest first. */
export const agentEvents = (a: Agent): StatusEvent[] => [
  a.status === 'failed'
    ? { id: 'e1', status: 'Failed', tone: 'destructive', title: 'Guardrail tripped on 3 consecutive runs', description: 'Tool secrets.scan returned unredacted output.', at: hoursAgo(2), actor: 'policy engine', live: true }
    : a.status === 'degraded'
      ? { id: 'e1', status: 'Degraded', tone: 'warning', title: 'Tool latency above SLO', description: 'web.fetch p95 at 6.9 s (SLO 4 s).', at: hoursAgo(5), actor: 'fleet monitor', live: true }
      : a.status === 'paused'
        ? { id: 'e1', status: 'Paused', tone: 'neutral', title: 'Paused by owner', description: 'Waiting on the new ICP playbook.', at: daysAgo(4), actor: a.owner }
        : { id: 'e1', status: 'Running', tone: 'success', title: `${a.version} serving 100% of traffic`, at: a.updatedAt, actor: a.owner, live: true },
  { id: 'e2', status: 'Rollout', tone: 'info', title: `${a.version} canary at 10%`, description: 'Eval gate passed on 4 of 4 datasets.', at: daysAgo(1), actor: 'eval gate' },
  { id: 'e3', status: 'Evaluated', tone: 'primary', title: 'Scheduled evaluation finished', at: daysAgo(2), actor: 'evaluations' },
  { id: 'e4', status: 'Running', tone: 'success', title: 'Previous version serving 100% of traffic', at: daysAgo(9), actor: a.owner },
  { id: 'e5', status: 'Created', tone: 'neutral', title: 'Agent created from the support template', at: daysAgo(64), actor: a.owner },
];

/** Changes made to the agent. */
export const agentActivity = (a: Agent): ActivityItem[] => [
  { id: 'a1', actor: { name: a.owner }, action: 'promoted', target: `${a.name} ${a.version}`, at: a.updatedAt },
  { id: 'a2', actor: { name: 'Priya Shah' }, action: 'changed the system prompt of', target: a.name, at: hoursAgo(20) },
  { id: 'a3', actor: { name: 'Marc Duran' }, action: 'added the tool', target: a.tools[a.tools.length - 1] ?? 'kb.lookup', at: daysAgo(2) },
  { id: 'a4', actor: { name: a.owner }, action: 'raised the monthly budget of', target: a.name, at: daysAgo(5) },
  { id: 'a5', actor: { name: 'Elena Costa' }, action: 'attached knowledge base', target: a.knowledge, at: daysAgo(12) },
];

export const agentDangerActions = (a: Agent): DangerZoneAction[] => [
  { id: 'pause', title: 'Pause agent', description: 'Stops new runs across the fleet; queued runs are kept.', actionLabel: 'Pause', destructive: false },
  { id: 'delete', title: 'Delete agent', description: `Permanently deletes ${a.name}, its versions, traces and evaluation history.`, actionLabel: 'Delete agent', confirmText: a.name },
];

