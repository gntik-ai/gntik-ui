import type { DeploymentRow } from '@gntik-ai/blocks';
import { daysAgo, hoursAgo, minutesAgo } from './time';

export type AgentStatus = DeploymentRow['status'];

/** An AI agent in the workspace. */
export interface Agent {
  id: string;
  name: string;
  description: string;
  /** Model the agent runs on. */
  model: string;
  /** Region its fleet is deployed in. */
  region: string;
  status: AgentStatus;
  version: string;
  owner: string;
  tools: string[];
  knowledge: string;
  runs24h: number;
  /** Spend in the last 30 days, USD. */
  cost30d: number;
  successRate: number;
  p95Ms: number;
  updatedAt: Date;
}

export const agents: Agent[] = [
  { id: 'support-triage', name: 'support-triage', description: 'Classifies inbound tickets, drafts a first reply and routes edge cases to a human.', model: 'claude-sonnet', region: 'eu-west-1', status: 'running', version: 'v13', owner: 'Lucía Romero', tools: ['zendesk.search', 'kb.lookup', 'handoff.human'], knowledge: 'support-kb (4,210 docs)', runs24h: 18_420, cost30d: 612.4, successRate: 0.962, p95Ms: 1420, updatedAt: minutesAgo(12) },
  { id: 'invoice-reconciler', name: 'invoice-reconciler', description: 'Matches supplier invoices to purchase orders and flags mismatches for finance.', model: 'claude-haiku', region: 'eu-central-1', status: 'running', version: 'v7', owner: 'Marc Duran', tools: ['erp.query', 'ocr.extract', 'email.send'], knowledge: 'finance-policies (182 docs)', runs24h: 6_210, cost30d: 148.9, successRate: 0.981, p95Ms: 980, updatedAt: hoursAgo(3) },
  { id: 'code-reviewer', name: 'code-reviewer', description: 'Reviews pull requests for bugs, style drift and missing tests; comments inline.', model: 'claude-opus', region: 'us-east-1', status: 'running', version: 'v21', owner: 'Priya Shah', tools: ['github.diff', 'github.comment', 'ci.logs'], knowledge: 'eng-handbook (96 docs)', runs24h: 2_340, cost30d: 905.1, successRate: 0.947, p95Ms: 8_300, updatedAt: hoursAgo(1) },
  { id: 'research-scout', name: 'research-scout', description: 'Collects and summarises market signals from news, filings and analyst notes.', model: 'claude-sonnet', region: 'us-east-1', status: 'degraded', version: 'v4', owner: 'Tomás Vidal', tools: ['web.search', 'web.fetch', 'notes.write'], knowledge: 'none', runs24h: 1_105, cost30d: 284.6, successRate: 0.874, p95Ms: 6_900, updatedAt: hoursAgo(5) },
  { id: 'onboarding-guide', name: 'onboarding-guide', description: 'Walks new customers through setup, answers product questions and books calls.', model: 'claude-haiku', region: 'eu-west-1', status: 'running', version: 'v9', owner: 'Lucía Romero', tools: ['calendar.book', 'kb.lookup', 'crm.update'], knowledge: 'product-docs (1,340 docs)', runs24h: 4_870, cost30d: 97.3, successRate: 0.971, p95Ms: 1_100, updatedAt: daysAgo(1) },
  { id: 'sales-qualifier', name: 'sales-qualifier', description: 'Scores inbound leads against the ICP and writes a hand-off note for sales.', model: 'claude-haiku', region: 'us-east-1', status: 'paused', version: 'v3', owner: 'Elena Costa', tools: ['crm.query', 'enrich.company'], knowledge: 'icp-playbook (24 docs)', runs24h: 0, cost30d: 41.2, successRate: 0.93, p95Ms: 1_300, updatedAt: daysAgo(4) },
  { id: 'incident-commander', name: 'incident-commander', description: 'Correlates alerts, opens the incident channel and keeps the timeline up to date.', model: 'claude-sonnet', region: 'eu-central-1', status: 'running', version: 'v12', owner: 'Priya Shah', tools: ['pager.ack', 'slack.post', 'metrics.query'], knowledge: 'runbooks (310 docs)', runs24h: 380, cost30d: 66.8, successRate: 0.989, p95Ms: 2_400, updatedAt: hoursAgo(9) },
  { id: 'contract-analyst', name: 'contract-analyst', description: 'Extracts clauses, renewal dates and liabilities from customer contracts.', model: 'claude-opus', region: 'eu-west-1', status: 'queued', version: 'v2', owner: 'Marc Duran', tools: ['docs.read', 'clauses.extract'], knowledge: 'legal-templates (58 docs)', runs24h: 140, cost30d: 210.0, successRate: 0.915, p95Ms: 12_400, updatedAt: minutesAgo(40) },
  { id: 'churn-predictor', name: 'churn-predictor', description: 'Flags accounts at risk from usage drops and support sentiment, weekly.', model: 'claude-haiku', region: 'ap-south-1', status: 'running', version: 'v5', owner: 'Elena Costa', tools: ['warehouse.query', 'crm.update'], knowledge: 'none', runs24h: 52, cost30d: 18.7, successRate: 0.996, p95Ms: 3_100, updatedAt: daysAgo(2) },
  { id: 'docs-writer', name: 'docs-writer', description: 'Drafts release notes and reference pages from merged pull requests.', model: 'claude-sonnet', region: 'us-east-1', status: 'running', version: 'v6', owner: 'Tomás Vidal', tools: ['github.diff', 'docs.publish'], knowledge: 'style-guide (12 docs)', runs24h: 64, cost30d: 39.5, successRate: 0.968, p95Ms: 9_800, updatedAt: daysAgo(3) },
  { id: 'security-auditor', name: 'security-auditor', description: 'Reviews IAM changes and secrets exposure; opens findings for the security team.', model: 'claude-opus', region: 'eu-central-1', status: 'failed', version: 'v1', owner: 'Priya Shah', tools: ['iam.diff', 'secrets.scan', 'jira.create'], knowledge: 'security-policies (77 docs)', runs24h: 12, cost30d: 54.0, successRate: 0.61, p95Ms: 14_200, updatedAt: hoursAgo(2) },
  { id: 'data-cleaner', name: 'data-cleaner', description: 'Normalises CRM records: dedupes contacts, fixes country codes, fills gaps.', model: 'claude-haiku', region: 'ap-south-1', status: 'running', version: 'v8', owner: 'Elena Costa', tools: ['crm.query', 'crm.update'], knowledge: 'none', runs24h: 9_830, cost30d: 72.1, successRate: 0.99, p95Ms: 640, updatedAt: daysAgo(6) },
];

export const findAgent = (id: string) => agents.find((a) => a.id === id);

/** Agents as kit ResourceIndex rows: runs (24h) in the "requests" figure, 30-day spend in "cost". */
export const agentRows: DeploymentRow[] = agents.map((a) => ({
  id: a.id,
  name: a.name,
  region: a.region,
  status: a.status,
  requests: a.runs24h,
  cost: a.cost30d,
  updatedAt: a.updatedAt,
}));
