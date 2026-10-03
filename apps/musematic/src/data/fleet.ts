import type { ResourceCard } from '@gntik-ai/blocks';
import { Bot, Boxes, Cpu, Server, Workflow } from '@gntik-ai/icons';

/** Fleet deployments: groups of agent replicas serving one workload. */
export const fleetDeployments: ResourceCard[] = [
  { id: 'support-eu', name: 'support-eu', description: 'support-triage and onboarding-guide for EU customers.', icon: Bot, status: 'running', meta: [{ label: 'Agents', value: '2' }, { label: 'Replicas', value: '24' }, { label: 'Region', value: 'eu-west-1' }] },
  { id: 'finance-ops', name: 'finance-ops', description: 'invoice-reconciler and contract-analyst behind the ERP connector.', icon: Boxes, status: 'running', meta: [{ label: 'Agents', value: '2' }, { label: 'Replicas', value: '8' }, { label: 'Region', value: 'eu-central-1' }] },
  { id: 'eng-review', name: 'eng-review', description: 'code-reviewer and docs-writer on every pull request.', icon: Cpu, status: 'running', meta: [{ label: 'Agents', value: '2' }, { label: 'Replicas', value: '12' }, { label: 'Region', value: 'us-east-1' }] },
  { id: 'market-intel', name: 'market-intel', description: 'research-scout crawling news and filings every hour.', icon: Server, status: 'degraded', meta: [{ label: 'Agents', value: '1' }, { label: 'Replicas', value: '6' }, { label: 'Region', value: 'us-east-1' }] },
  { id: 'on-call', name: 'on-call', description: 'incident-commander paired with the pager integration.', icon: Workflow, status: 'running', meta: [{ label: 'Agents', value: '1' }, { label: 'Replicas', value: '3' }, { label: 'Region', value: 'eu-central-1' }] },
  { id: 'revenue', name: 'revenue', description: 'sales-qualifier and churn-predictor for the revenue team.', icon: Bot, status: 'paused', meta: [{ label: 'Agents', value: '2' }, { label: 'Replicas', value: '0' }, { label: 'Region', value: 'us-east-1' }] },
  { id: 'security', name: 'security', description: 'security-auditor on IAM and secrets changes.', icon: Server, status: 'failed', meta: [{ label: 'Agents', value: '1' }, { label: 'Replicas', value: '2' }, { label: 'Region', value: 'eu-central-1' }] },
  { id: 'data-hygiene', name: 'data-hygiene', description: 'data-cleaner nightly batch over the CRM.', icon: Boxes, status: 'queued', meta: [{ label: 'Agents', value: '1' }, { label: 'Replicas', value: '4' }, { label: 'Region', value: 'ap-south-1' }] },
];
