import type { PowerSearchField } from '../power-search-query';

export type DeploymentField = 'status' | 'project' | 'region' | 'duration' | 'author';

export const deploymentFields: PowerSearchField<DeploymentField>[] = [
  { key: 'status', label: 'status', type: 'enum', values: ['running', 'succeeded', 'failed', 'cancelled'], description: 'Deployment result' },
  { key: 'project', label: 'project', values: ['support-triage', 'invoice-sync', 'usage-reports', 'deploy-gate'] },
  { key: 'region', label: 'region', type: 'enum', values: [{ value: 'eu-west', label: 'EU West' }, { value: 'us-east', label: 'US East' }, { value: 'ap-south', label: 'AP South' }] },
  { key: 'duration', label: 'duration', type: 'number', description: 'Seconds' },
  { key: 'author', label: 'author', values: ['ada', 'grace', 'linus'] },
];

export const deployments = [
  { id: 'd-4121', status: 'failed', project: 'invoice-sync', region: 'eu-west', duration: 312, author: 'ada' },
  { id: 'd-4120', status: 'succeeded', project: 'support-triage', region: 'us-east', duration: 88, author: 'grace' },
  { id: 'd-4119', status: 'running', project: 'usage-reports', region: 'eu-west', duration: 41, author: 'linus' },
  { id: 'd-4118', status: 'failed', project: 'deploy-gate', region: 'ap-south', duration: 145, author: 'grace' },
  { id: 'd-4117', status: 'succeeded', project: 'invoice-sync', region: 'us-east', duration: 97, author: 'ada' },
  { id: 'd-4116', status: 'cancelled', project: 'support-triage', region: 'eu-west', duration: 12, author: 'linus' },
];
