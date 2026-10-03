export type AssistantStatus = 'active' | 'paused' | 'draft' | 'degraded' | 'failed';

export interface Assistant {
  id: string;
  name: string;
  description: string;
  /** Model identifier, e.g. "general-large". */
  model: string;
  /** Where it runs, e.g. "openai-compatible" or "self-hosted". */
  runtime: string;
  status: AssistantStatus;
  /** Relative update time, e.g. "2h ago". */
  updated?: string;
  /** Optional link to the assistant's page. */
  href?: string;
}

export const assistants: Assistant[] = [
  { id: 'a1', name: 'Support triage', description: 'Classifies incoming tickets and drafts first replies.', model: 'general-large', runtime: 'openai-compatible', status: 'active', updated: '2h ago' },
  { id: 'a2', name: 'Release notes writer', description: 'Summarises merged changes into customer-facing notes.', model: 'general-medium', runtime: 'Provider A', status: 'active', updated: 'yesterday' },
  { id: 'a3', name: 'Invoice checker', description: 'Flags invoices whose totals do not match the usage report.', model: 'reasoning-small', runtime: 'self-hosted', status: 'degraded', updated: '3d ago' },
  { id: 'a4', name: 'Onboarding guide', description: 'Answers setup questions from the product documentation.', model: 'general-small', runtime: 'self-hosted', status: 'paused', updated: '1w ago' },
  { id: 'a5', name: 'Data cleanup', description: 'Normalises imported records before they reach the warehouse.', model: 'general-medium', runtime: 'openai-compatible', status: 'draft' },
  { id: 'a6', name: 'Incident summariser', description: 'Builds a timeline from alerts and chat during an incident.', model: 'general-large', runtime: 'Provider A', status: 'failed', updated: '5h ago' },
];
