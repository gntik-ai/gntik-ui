import type { ModelKey } from '@gntik-ai/blocks';
import { Cpu } from '@gntik-ai/icons';
import type { SettingsNavExtraItem } from '../settings-profile/settings-nav';

/** Nav entry this page adds to the shared settings nav (id `model-providers`). */
export const modelProvidersNavItem: SettingsNavExtraItem = { id: 'model-providers', label: 'Model providers', icon: Cpu, group: 'Workspace' };

/** A usage limit shown as a Meter (monthly tokens, spend, rate). */
export interface ProviderUsageLimit {
  id: string;
  label: string;
  value: number;
  max: number;
  /** Visible value text, e.g. "31.2M / 50M tokens". */
  valueLabel: string;
  /** Helper line under the bar. */
  note?: string;
}

/** What the add-key dialog collects; the secret never comes back to the UI. */
export interface NewModelKeyInput {
  name: string;
  provider: string;
  endpoint: string;
  secret: string;
}

export const providerOptions = [
  { value: 'Provider A', label: 'Provider A' },
  { value: 'Provider B', label: 'Provider B' },
  { value: 'openai-compatible', label: 'OpenAI-compatible endpoint' },
  { value: 'self-hosted', label: 'Self-hosted' },
];

export const providerKeys: ModelKey[] = [
  { id: 'k1', name: 'Production', provider: 'Provider A', maskedKey: 'pa-…4f2a', status: 'connected', lastUsed: '3 min ago' },
  { id: 'k2', name: 'Evaluations', provider: 'Provider B', maskedKey: 'pb-…a913', status: 'connected', lastUsed: '1 h ago' },
  { id: 'k3', name: 'Gateway', provider: 'openai-compatible', endpoint: 'https://llm-gateway.internal/v1', maskedKey: 'sk-…9c01', status: 'untested' },
  { id: 'k4', name: 'On-prem cluster', provider: 'self-hosted', endpoint: 'http://10.0.4.12:8000/v1', maskedKey: 'tok-…77de', status: 'failing', lastUsed: '2 days ago' },
];

export const providerUsageLimits: ProviderUsageLimit[] = [
  { id: 'tokens', label: 'Tokens this month', value: 31_200_000, max: 50_000_000, valueLabel: '31.2M / 50M', note: 'Resets on the 1st of each month.' },
  { id: 'spend', label: 'Spend this month', value: 412, max: 500, valueLabel: '$412 / $500', note: 'Requests are blocked when the cap is reached.' },
  { id: 'rate', label: 'Peak requests per minute', value: 540, max: 600, valueLabel: '540 / 600 rpm' },
];

/** Masks a secret for display: provider prefix + last four characters. */
export function maskSecret(secret: string) {
  const trimmed = secret.trim();
  const prefix = trimmed.match(/^[a-z]+-/i)?.[0] ?? '';
  return `${prefix}…${trimmed.slice(-4)}`;
}
