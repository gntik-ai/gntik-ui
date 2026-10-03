import { Gauge, Globe, Layers, Lock, Users, Zap } from '@gntik-ai/icons';
import type { Feature } from './FeatureGrid';

/** Sample product-agnostic features. */
export const sampleFeatures: Feature[] = [
  { icon: Zap, title: 'Instant deployments', description: 'Push a change and get a preview URL in seconds. Promote it to production with one click.' },
  { icon: Users, title: 'Team access', description: 'Invite members, assign roles per project and review every permission change in the audit log.' },
  { icon: Gauge, title: 'Usage you can read', description: 'Meters for every quota, alerts before the cap and a forecast for the end of the cycle.' },
  { icon: Lock, title: 'Secure by default', description: 'SSO, scoped API keys and encrypted secrets, with no extra configuration to get right.' },
  { icon: Globe, title: 'Multi-region', description: 'Run close to your users and keep data in the region you choose.' },
  { icon: Layers, title: 'Composable', description: 'Start from a template, extend it with your own components and keep one design system.' },
];
