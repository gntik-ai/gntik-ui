export interface ApiKeyScope {
  value: string;
  label: string;
  description?: string;
}

export interface ApiKeyExpiry {
  value: string;
  label: string;
}

export const apiKeyScopes: ApiKeyScope[] = [
  { value: 'projects:read', label: 'projects:read', description: 'List and read projects and deployments.' },
  { value: 'projects:write', label: 'projects:write', description: 'Create, update and deploy projects.' },
  { value: 'members:read', label: 'members:read', description: 'Read workspace members and roles.' },
  { value: 'billing:read', label: 'billing:read', description: 'Read invoices and usage.' },
];

export const apiKeyExpiries: ApiKeyExpiry[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'never', label: 'No expiry' },
];

/** Demo secret generator (the real secret comes from your API). */
export function generateDemoSecret(prefix = 'sk_live_') {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
