import { apiKeyExpiries, apiKeyScopes, type ApiKeyExpiry, type ApiKeyScope } from '@gntik-ai/blocks';

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export interface ApiKey {
  id: string;
  name: string;
  /** Visible start of the secret, e.g. "sk_live_3f9a". */
  prefix: string;
  scopes: string[];
  /** ISO date. */
  createdAt: string;
  /** ISO date; null when never used. */
  lastUsedAt: string | null;
  createdBy: string;
}

export const scopes: ApiKeyScope[] = apiKeyScopes;
export const expiries: ApiKeyExpiry[] = apiKeyExpiries;

export const apiKeys: ApiKey[] = [
  { id: 'k1', name: 'ci-deploy', prefix: 'sk_live_3f9a', scopes: ['projects:read', 'projects:write'], createdAt: daysAgo(120), lastUsedAt: daysAgo(0.02), createdBy: 'Avery Collins' },
  { id: 'k2', name: 'metrics-exporter', prefix: 'sk_live_81c0', scopes: ['projects:read', 'billing:read'], createdAt: daysAgo(64), lastUsedAt: daysAgo(1), createdBy: 'Sam Rivera' },
  { id: 'k3', name: 'directory-sync', prefix: 'sk_live_c27e', scopes: ['members:read'], createdAt: daysAgo(30), lastUsedAt: daysAgo(9), createdBy: 'Avery Collins' },
  { id: 'k4', name: 'local-testing', prefix: 'sk_live_09bd', scopes: ['projects:read'], createdAt: daysAgo(4), lastUsedAt: null, createdBy: 'Jordan Lee' },
];
