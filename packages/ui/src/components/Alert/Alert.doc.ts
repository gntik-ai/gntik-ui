import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Alert',
  group: 'Feedback',
  status: 'stable',
  description: 'Inline banner in four tones (info, success, warning, destructive) with title, description, an action row and an optional dismiss button. Destructive alerts use role="alert"; the others role="status".',
  pattern: 'alert / status',
  keyboard: [
    ['Tab', 'Moves focus to the actions and the dismiss button'],
    ['Enter', 'Activates the dismiss button'],
    ['Space', 'Activates the dismiss button'],
  ],
  tokens: ['info', 'success', 'success-text', 'warning', 'warning-text', 'destructive', 'destructive-text', 'foreground', 'focus-ring'],
};
