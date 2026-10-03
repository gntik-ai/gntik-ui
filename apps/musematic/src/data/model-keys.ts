import type { ModelKey } from '@gntik-ai/blocks';

/** Model provider keys the workspace's agents run on. Secrets are masked; the UI never sees them. */
export const modelKeys: ModelKey[] = [
  { id: 'mk1', name: 'Production', provider: 'Anthropic', maskedKey: 'sk-ant-…4f2a', status: 'connected', lastUsed: '1 min ago' },
  { id: 'mk2', name: 'Evaluations', provider: 'Anthropic', maskedKey: 'sk-ant-…a91c', status: 'connected', lastUsed: '2 hours ago' },
  { id: 'mk3', name: 'LLM gateway', provider: 'openai-compatible', endpoint: 'https://llm-gateway.acme.internal/v1', maskedKey: 'sk-…9c01', status: 'untested' },
  { id: 'mk4', name: 'On-prem embeddings', provider: 'self-hosted', endpoint: 'http://10.20.4.12:8000/v1', maskedKey: 'tok-…77de', status: 'failing', lastUsed: '2 days ago' },
];
