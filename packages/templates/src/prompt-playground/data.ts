import type { PromptRunInput } from '@gntik-ai/blocks';
import type { BreadcrumbItem, ListInputPair } from '@gntik-ai/ui';

/** A model the playground can compare. */
export interface PlaygroundModel {
  id: string;
  label: string;
}

/** One model's answer to a run. */
export interface PlaygroundOutput {
  text: string;
  latencyMs: number;
  outputTokens: number;
}

export const playgroundModels: PlaygroundModel[] = [
  { id: 'general-large', label: 'general-large' },
  { id: 'general-small', label: 'general-small' },
  { id: 'reasoning-medium', label: 'reasoning-medium' },
  { id: 'self-hosted-8b', label: 'self-hosted-8b' },
];

export const playgroundDefaultColumns = ['general-large', 'general-small'];

export const playgroundPrompt = {
  title: 'Ticket summary',
  system: 'You are a concise support assistant for {{company}}. Answer in {{language}}.',
  user: 'Summarise the ticket below in three bullet points and suggest a next step.\n\n{{ticket}}',
  temperature: 0.4,
  maxTokens: 512,
};

/** Shared variable values applied to every column (they override the editor's own fields). */
export const playgroundVariables: ListInputPair[] = [
  { key: 'company', value: 'Northwind' },
  { key: 'language', value: 'English' },
  { key: 'ticket', value: 'Customer cannot export invoices as CSV since the last release; the button spins forever.' },
];

export const playgroundBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Prompts', href: '/prompts' },
  { label: 'ticket-summary', mono: true },
];

const SAMPLE_OUTPUTS: Record<string, string> = {
  'general-large':
    '- Invoice CSV export hangs since the latest release.\n- The export button keeps spinning and no file is produced.\n- Affects the billing area for at least one customer.\nNext step: reproduce on staging and check the export job logs.',
  'general-small':
    '- CSV export of invoices is broken.\n- The export button keeps spinning and no file is produced.\n- Started after the last release.\nNext step: roll back the export change.',
  'reasoning-medium':
    '- Invoice CSV export hangs since the latest release.\n- The spinner suggests the export request never completes.\n- Likely a regression in the export job.\nNext step: compare export job logs before and after the release.',
  'self-hosted-8b':
    '- Export to CSV not working.\n- Button spins.\n- Since release.\nNext step: investigate.',
};

/** Sample output of a model before the first run (or for a model without a sample). */
export function sampleOutput(model: string): PlaygroundOutput {
  const text = SAMPLE_OUTPUTS[model] ?? SAMPLE_OUTPUTS['general-small'] ?? '';
  return { text, latencyMs: 600 + (model.length * 97) % 900, outputTokens: Math.round(text.length / 4) };
}

/** Simulated generation: the sample output, prefixed with the resolved variables. */
export function simulateGenerate(model: string, input: PromptRunInput): Promise<PlaygroundOutput> {
  const out = sampleOutput(model);
  const company = input.variables.company?.trim();
  const text = company ? `${out.text}\n(${company}, temperature ${input.temperature})` : out.text;
  return new Promise((resolve) => setTimeout(() => resolve({ ...out, text }), 400));
}
