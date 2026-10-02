import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Badge',
  group: 'Display',
  status: 'stable',
  description: 'Compact label for status, counts and categories. Semantic tones (neutral, primary, success, warning, destructive, info) plus four category tones, in soft, outline or solid; optional dot and remove button for tags.',
  pattern: 'button (remove)',
  keyboard: [
    ['Tab', 'Moves focus to the remove button, when present'],
    ['Enter', 'Activates the remove button'],
    ['Space', 'Activates the remove button'],
  ],
  tokens: ['primary', 'primary-text', 'success', 'success-text', 'warning', 'warning-text', 'destructive', 'destructive-text', 'info', 'category-violet', 'category-cyan', 'category-amber', 'category-rose', 'muted-foreground', 'focus-ring'],
};
