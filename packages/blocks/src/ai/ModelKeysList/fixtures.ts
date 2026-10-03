export type ModelKeyStatus = 'connected' | 'failing' | 'untested' | 'revoked';

export interface ModelKey {
  id: string;
  /** Display name, e.g. "Production". */
  name: string;
  /** Provider or protocol, e.g. "Provider A", "openai-compatible", "self-hosted". */
  provider: string;
  /** Base URL for compatible or self-hosted endpoints. */
  endpoint?: string;
  /** Masked secret, e.g. "sk-…4f2a". Never pass the full key to the UI. */
  maskedKey: string;
  status: ModelKeyStatus;
  /** Relative last-use time, e.g. "3 min ago". */
  lastUsed?: string;
}

export const modelKeys: ModelKey[] = [
  { id: 'k1', name: 'Production', provider: 'Provider A', maskedKey: 'pa-…4f2a', status: 'connected', lastUsed: '3 min ago' },
  { id: 'k2', name: 'Gateway', provider: 'openai-compatible', endpoint: 'https://llm-gateway.internal/v1', maskedKey: 'sk-…9c01', status: 'untested' },
  { id: 'k3', name: 'On-prem cluster', provider: 'self-hosted', endpoint: 'http://10.0.4.12:8000/v1', maskedKey: 'tok-…77de', status: 'failing', lastUsed: '2 days ago' },
];
