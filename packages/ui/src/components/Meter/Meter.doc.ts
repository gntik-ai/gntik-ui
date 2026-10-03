import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Meter',
  group: 'Feedback',
  status: 'stable',
  description: 'Usage meter for quotas and limits: label, value text, and a level set by thresholds (healthy → warning near the cap → destructive at or over it), with an optional note under the bar.',
  primitive: '@base-ui/react/meter',
  pattern: 'meter',
  tokens: ['primary', 'warning', 'warning-text', 'destructive', 'destructive-text', 'secondary', 'foreground', 'muted-foreground'],
};
