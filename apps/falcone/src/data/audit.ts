import type { FilterField } from '@gntik-ai/blocks';
import type { AuditEvent } from '@gntik-ai/templates';
import { hoursAgo, minutesAgo, daysAgo } from './time';

const ingrid = { name: 'Ingrid Halvorsen', email: 'ingrid@northwind-labs.io' };
const omar = { name: 'Omar Haddad', email: 'omar@northwind-labs.io' };
const mei = { name: 'Mei Tanaka', email: 'mei@northwind-labs.io' };
const lukas = { name: 'Lukas Brandt', email: 'lukas@northwind-labs.io' };
const ci = { name: 'Release bot', email: 'release-bot@northwind-labs.io' };

/** Tenant audit trail, newest first. */
export const auditEvents: AuditEvent[] = [
  {
    id: 'aud_7c41', at: minutesAgo(18), actor: ci, action: 'stage.promote', resource: 'Stage', target: 'checkout-api staging → prod', ip: '10.12.0.4', result: 'succeeded',
    diff: ' {\n   "project": "checkout-api",\n-  "prod.release": "r-212",\n+  "prod.release": "r-213"\n }',
  },
  {
    id: 'aud_7c3a', at: minutesAgo(52), actor: omar, action: 'function.update', resource: 'Function', target: 'support-copilot/draft-reply', ip: '198.51.100.23', result: 'succeeded',
    diff: ' {\n   "function": "draft-reply",\n-  "timeoutMs": 10000,\n+  "timeoutMs": 20000,\n-  "memoryMb": 512\n+  "memoryMb": 1024\n }',
  },
  { id: 'aud_7c20', at: hoursAgo(3), actor: lukas, action: 'provider_key.rotate', resource: 'Model provider', target: 'Gateway (openai-compatible)', ip: '203.0.113.71', result: 'succeeded' },
  { id: 'aud_7c11', at: hoursAgo(4), actor: mei, action: 'workflow.publish', resource: 'Workflow', target: 'Order fulfilment', ip: '203.0.113.40', result: 'succeeded' },
  { id: 'aud_7bf9', at: hoursAgo(9), actor: ci, action: 'function.deploy', resource: 'Function', target: 'report-builder/render-pdf', ip: '10.12.0.4', result: 'failed' },
  {
    id: 'aud_7be2', at: daysAgo(1), actor: ingrid, action: 'quota.update', resource: 'Quota', target: 'ingest-pipeline invocations', ip: '198.51.100.9', result: 'succeeded',
    diff: ' {\n   "meter": "invocations",\n-  "monthlyLimit": 150000000,\n+  "monthlyLimit": 250000000\n }',
  },
  { id: 'aud_7bd0', at: daysAgo(1.4), actor: lukas, action: 'tenant.plan.update', resource: 'Tenant', target: 'Northwind Labs', ip: '203.0.113.71', result: 'denied' },
  { id: 'aud_7bc6', at: daysAgo(2), actor: omar, action: 'mcp.token.create', resource: 'MCP server', target: 'support-copilot', ip: '198.51.100.23', result: 'succeeded' },
  { id: 'aud_7bb1', at: daysAgo(3), actor: mei, action: 'channel.create', resource: 'Channel', target: 'orders.live', ip: '203.0.113.40', result: 'succeeded' },
  {
    id: 'aud_7ba8', at: daysAgo(4), actor: ingrid, action: 'member.role.update', resource: 'Member', target: 'lukas@northwind-labs.io', ip: '198.51.100.9', result: 'succeeded',
    diff: ' {\n   "member": "lukas@northwind-labs.io",\n-  "role": "member"\n+  "role": "admin"\n }',
  },
  { id: 'aud_7b90', at: daysAgo(5), actor: omar, action: 'project.delete', resource: 'Project', target: 'legacy-cron', ip: '198.51.100.23', result: 'denied' },
];

export const auditFilterFields: FilterField[] = [
  { id: 'actor', label: 'Actor', options: [ingrid.name, omar.name, mei.name, lukas.name, ci.name] },
  { id: 'resource', label: 'Resource', options: ['Project', 'Stage', 'Function', 'Workflow', 'Model provider', 'MCP server', 'Channel', 'Quota', 'Tenant', 'Member'] },
  { id: 'result', label: 'Result', options: ['succeeded', 'failed', 'denied'] },
];
