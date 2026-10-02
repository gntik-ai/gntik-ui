import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Progress',
  group: 'Feedback',
  status: 'stable',
  description: 'Progress bar for a running task: optional label and formatted value, four tones (primary, success, warning, destructive), three heights, and an indeterminate state (value null) that stops pulsing under reduced motion.',
  primitive: '@base-ui/react/progress',
  pattern: 'progressbar',
  tokens: ['primary', 'success', 'success-text', 'warning', 'warning-text', 'destructive', 'destructive-text', 'secondary', 'foreground'],
};
