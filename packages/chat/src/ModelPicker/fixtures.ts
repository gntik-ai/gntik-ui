import type { ChatModel } from './ModelPicker';

/** Generic, product-agnostic models for examples and the demo. */
export const DEMO_MODELS: ChatModel[] = [
  { id: 'swift', name: 'Swift', provider: 'Hosted', description: 'Fast answers for everyday questions.', capabilities: ['tools'], contextWindow: 128_000 },
  {
    id: 'balanced',
    name: 'Balanced',
    provider: 'Hosted',
    description: 'Good default for analysis and writing.',
    capabilities: ['vision', 'tools', 'files'],
    contextWindow: 200_000,
  },
  {
    id: 'deep',
    name: 'Deep reasoning',
    provider: 'Hosted',
    description: 'Plans multi-step work; slower.',
    capabilities: ['vision', 'tools', 'reasoning'],
    contextWindow: 1_000_000,
    disabled: true,
    disabledReason: 'Needs an upgraded plan',
  },
  { id: 'local-small', name: 'Local small', provider: 'Self-hosted', description: 'Runs in your own cluster.', contextWindow: 32_000 },
  { id: 'local-vision', name: 'Local vision', provider: 'Self-hosted', capabilities: ['vision'], contextWindow: 64_000 },
];
