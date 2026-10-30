import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Badge',
  group: 'Display',
  status: 'stable',
  description:
    'Compact label for status, counts and categories. Semantic tones (neutral, primary, success, warning, destructive, info) plus four category tones, in soft, outline or solid; optional dot and remove button for tags. The root exposes data-tone for shared bg-tone, border-tone, text-tone-text and text-tone-chip-text utilities; unknown tone names clear inherited tone variables.',
  pattern: 'button (remove)',
  keyboard: [
    ['Tab', 'Moves focus to the remove button, when present'],
    ['Enter', 'Activates the remove button'],
    ['Space', 'Activates the remove button'],
  ],
  tokens: [
    'tone',
    'tone-text',
    'tone-chip-text',
    'primary',
    'primary-text',
    'success',
    'success-text',
    'warning',
    'warning-text',
    'destructive',
    'destructive-text',
    'info',
    'category-violet',
    'category-cyan',
    'category-amber',
    'category-rose',
    'muted-foreground',
    'focus-ring',
  ],
};
