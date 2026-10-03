import type { ModelKey } from '@gntik-ai/blocks';

/** Bring-your-own-key LLM providers of the tenant. Secrets are masked; the UI never sees them. */
export const modelKeys: ModelKey[] = [
  { id: 'mk1', name: 'Production', provider: 'Anthropic', maskedKey: 'sk-ant-…7b30', status: 'connected', lastUsed: '1 min ago' },
  { id: 'mk2', name: 'Gateway', provider: 'openai-compatible', endpoint: 'https://llm.northwind-labs.internal/v1', maskedKey: 'sk-…e41d', status: 'connected', lastUsed: '9 min ago' },
  { id: 'mk3', name: 'Staging', provider: 'Anthropic', maskedKey: 'sk-ant-…0c92', status: 'untested' },
  { id: 'mk4', name: 'On-prem embeddings', provider: 'self-hosted', endpoint: 'http://10.12.8.20:8080/v1', maskedKey: 'tok-…5aa1', status: 'failing', lastUsed: '3 days ago' },
];
